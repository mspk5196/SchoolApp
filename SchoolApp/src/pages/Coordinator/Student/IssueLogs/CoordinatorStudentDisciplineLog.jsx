import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator,
  Linking,
  Keyboard,
  RefreshControl
} from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/IssueLogs/leftarrow.svg';
import AddIcon from '../../../../assets/CoordinatorPage/DisciplineLog/AddIcon.svg';
import Phone from '../../../../assets/CoordinatorPage/DisciplineLog/call.svg';
import MessageSquare from '../../../../assets/CoordinatorPage/DisciplineLog/msg.svg';
import SearchIcon from '../../../../assets/CoordinatorPage/DisciplineLog/search.svg';
import styles from './StudentDisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../../utils/env.js'
import Nodata from '../../../../components/General/Nodata';
const Staff = '../../../../assets/CoordinatorPage/DisciplineLog/staff.png';

const CoordinatorStudentDisciplineLog = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  const [activeSection, setActiveSection] = useState(null);

  const [sections, setSections] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disciplineData, setDisciplineData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Search states
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Fetch student list
  const fetchStudent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/student/getStudentList`);
      const data = await response.json();
      if (response.ok) {
        setStudentList(data.student);
        console.log(data.student);
        
      } else {
        console.error('Failed to fetch student:', data.message);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  // Fetch discipline logs
  const fetchDisciplineLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/coordinator/student/getStudentDisciplineLogs?sectionId=${activeSection}`);
      const data = await response.json();
      if (response.ok) {
        setDisciplineData(data.logs);   
        setFilteredData(data.logs);
        console.log('Discipline Logs API Response:', data.logs);
        
      } else {
        console.error('Failed to fetch logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudent(), fetchDisciplineLogs()]);
    };
    loadData();
  }, [activeSection]);

  // Filter data when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(disciplineData);
    } else {
      const filtered = disciplineData.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
          item.student_name.toLowerCase().includes(searchLower) ||
          item.roll.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  }, [searchText, disciplineData]);

  const handleAddComplaint = async () => {
    if (!selectedStudent || !reason.trim()) {
      Alert.alert('Error', 'Please select student and enter reason');
      return;
    }

    try {
      console.log(coordinatorData.phone);
      const response = await fetch(`${API_URL}/api/coordinator/student/addStudentComplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roll: selectedStudent.roll,
          complaint: reason,
          registeredBy: coordinatorData.phone
        }),
      });

      const data = await response.json();


      if (response.ok) {
        fetchDisciplineLogs(); // Refresh the list
        setReason('');
        setSelectedStudent(null);
        setModalVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    }
  };

  const filteredStudent = studentList.filter(student =>
    student.student_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.roll?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Staff;
    }
  };

  const handleCallPress = (phone) => {
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phone}`);
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDisciplineLogs();
    setRefreshing(false);
  };

  // Fetch sections for the active grade
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gradeID: activeGrade }),
        });

        const data = await response.json();
        console.log('Grade Sections Data API Response:', data);

        if (data.success) {
          setSections(data.gradeSections);
          if (data.gradeSections.length > 0) {
            setActiveSection(data.gradeSections[0].id);
          }
        } else {
          Alert.alert('No Sections Found', 'No section is associated with this grade');
        }
      } catch (error) {
        console.error('Error fetching sections data:', error);
        Alert.alert('Error', 'Failed to fetch sections data');
      }
    };

    fetchSections();
  }, [coordinatorData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Discipline Log</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsection}
        nestedScrollEnabled={true}
      >
        {sections.map((section, index) => (
          <Pressable
            key={section.id}
            style={[styles.gradeselection, activeSection === section.id && styles.activeButton]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === section.id && styles.activeText]}>
              Section {section.section_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Search student by name or phone..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading discipline logs...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.cardContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0C36FF']}
              tintColor="#0C36FF"
            />
          }
        >
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {item.profile_photo ? (
                    <Image source={getProfileImageSource(item.profile_photo)} style={styles.avatar} />
                  ) : (
                    <Image source={Staff} style={styles.avatar} />
                  )}
                  <View>
                    <Text style={styles.cardTitle}>{item.student_name}</Text>
                    <Text style={styles.cardSubtitle}>{item.roll}</Text>
                  </View>
                  <Text style={styles.cardDate}>{new Date(item.registered_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Reason</Text>
                  <View style={styles.cardReasonContainer}>
                    <Text style={styles.cardReason}>{item.complaint}</Text>
                  </View>
                  <View style={styles.regBar}>
                    <Text style={styles.registeredBy}>Registered by {item.registered_by_name}</Text>
                    <TouchableOpacity style={styles.actionButtonCall} onPress={() => handleCallPress(item.registered_by_phone)}>
                      <Phone width={20} height={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonMsg}>
                      <MessageSquare width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Nodata message="No discipline records found" />
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.AddButton}
        onPress={() => setModalVisible(true)}
      >
        <AddIcon width={styles.AddIcon.width} height={styles.AddIcon.height} />
      </TouchableOpacity>

      {/* Add Complaint Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Discipline Record</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Student</Text>
                    <TouchableOpacity
                      style={styles.textInput}
                      onPress={() => setShowStudentModal(true)}
                    >
                      <Text style={{ color: selectedStudent ? '#000' : '#999' }}>
                        {selectedStudent ? `${selectedStudent.student_name} (${selectedStudent.roll})` : 'Select student...'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reason</Text>
                    <TextInput
                      style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                      placeholder="Enter reason"
                      value={reason}
                      onChangeText={setReason}
                      multiline
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Registered By</Text>
                    <TextInput
                      style={styles.textInput}
                      value={coordinatorData.name}
                      editable={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleAddComplaint}
                  >
                    <Text style={styles.registerButtonText}>Register Complaint</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Student Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStudentModal}
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '70%', width: '90%' }]}>
            <Text style={styles.modalTitle}>Select Student</Text>

            <View style={[styles.searchInput, { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }]}>
              <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1 }}
                placeholder="Search student..."
                value={studentSearch}
                onChangeText={setStudentSearch}
              />
            </View>

            <FlatList
              data={filteredStudent}
              keyExtractor={(item) => item.phone}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setSelectedStudent(item);
                    setShowStudentModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.student_name} (Grade {item.grade_id} - Section {item.section_name})</Text>
                  {/* <Text style={{ color: '#666' }}>{item.phone}</Text> */}
                  <Text style={{ color: '#666' }}>{item.roll}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorStudentDisciplineLog;
