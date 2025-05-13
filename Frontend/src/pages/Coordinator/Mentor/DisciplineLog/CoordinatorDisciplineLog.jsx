import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/DisciplineLog/leftarrow.svg';
import AddIcon from '../../../../assets/CoordinatorPage/DisciplineLog/AddIcon.svg';
import Phone from '../../../../assets/CoordinatorPage/DisciplineLog/call.svg';
import MessageSquare from '../../../../assets/CoordinatorPage/DisciplineLog/msg.svg';
import SearchIcon from '../../../../assets/CoordinatorPage/DisciplineLog/search.svg';
import styles from './DisciplineLogStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env'
const Staff = '../../../../assets/CoordinatorPage/DisciplineLog/staff.png';

const CoordinatorDisciplineLog = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disciplineData, setDisciplineData] = useState([]);

  // Search states
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Fetch faculty list
  const fetchFaculty = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getFacultyList`);
      const data = await response.json();
      if (response.ok) {
        setFacultyList(data.faculty);
      } else {
        console.error('Failed to fetch faculty:', data.message);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  // Fetch discipline logs
  const fetchDisciplineLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getDisciplineLogs`);
      const data = await response.json();
      if (response.ok) {
        setDisciplineData(data.logs);
        setFilteredData(data.logs);

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
    fetchFaculty();
    fetchDisciplineLogs();
  }, []);

  // Filter data when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(disciplineData);
    } else {
      const filtered = disciplineData.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
          item.faculty_name.toLowerCase().includes(searchLower) ||
          item.phone.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  }, [searchText, disciplineData]);

  const handleAddComplaint = async () => {
    if (!selectedFaculty || !reason.trim()) {
      Alert.alert('Error', 'Please select faculty and enter reason');
      return;
    }

    try {
      console.log(coordinatorData.phone);
      const response = await fetch(`${API_URL}/api/coordinator/mentor/addFacultyComplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: selectedFaculty.phone,
          complaint: reason,
          registeredBy: coordinatorData.phone
        }),
      });

      const data = await response.json();


      if (response.ok) {
        fetchDisciplineLogs(); // Refresh the list
        setReason('');
        setSelectedFaculty(null);
        setModalVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    }
  };

  const filteredFaculty = facultyList.filter(faculty =>
    faculty.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
    faculty.phone.toLowerCase().includes(facultySearch.toLowerCase())
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

      <View style={styles.searchContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Search faculty by name or phone..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
        </View>
      ) : (
        <ScrollView style={styles.cardContainer}>
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
                    <Text style={styles.cardTitle}>{item.faculty_name}</Text>
                    <Text style={styles.cardSubtitle}>{item.mentor_roll || item.coordinator_roll}</Text>
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
                    <TouchableOpacity style={styles.actionButtonCall} onPress={()=>handleCallPress(item.phone)}>
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
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No records found</Text>
            </View>
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
                    <Text style={styles.inputLabel}>Select Faculty</Text>
                    <TouchableOpacity
                      style={styles.textInput}
                      onPress={() => setShowFacultyModal(true)}
                    >
                      <Text style={{ color: selectedFaculty ? '#000' : '#999' }}>
                        {selectedFaculty ? `${selectedFaculty.name} (${selectedFaculty.mentor_roll || selectedFaculty.coordinator_roll})` : 'Select faculty...'}
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

      {/* Faculty Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFacultyModal}
        onRequestClose={() => setShowFacultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '70%', width: '90%' }]}>
            <Text style={styles.modalTitle}>Select Faculty</Text>

            <View style={[styles.searchInput, { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }]}>
              <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1 }}
                placeholder="Search faculty..."
                value={facultySearch}
                onChangeText={setFacultySearch}
              />
            </View>

            <FlatList
              data={filteredFaculty}
              keyExtractor={(item) => item.phone}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setSelectedFaculty(item);
                    setShowFacultyModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                  {/* <Text style={{ color: '#666' }}>{item.phone}</Text> */}
                  <Text style={{ color: '#666' }}>{item.mentor_roll || item.coordinator_roll}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorDisciplineLog;