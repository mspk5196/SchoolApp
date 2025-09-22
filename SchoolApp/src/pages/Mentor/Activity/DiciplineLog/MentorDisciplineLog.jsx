import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, Image, Modal, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Alert, 
  Linking, ActivityIndicator, StatusBar
} from "react-native";
import styles from "./DisciplineLogsty.js";
import Back from "../../../../assets/MentorPage/backarrow.svg";
import Add from "../../../../assets/MentorPage/plus.svg";
import SearchIcon from "../../../../assets/MentorPage/search.svg";
import Call from "../../../../assets/MentorPage/call.svg";
import Message from "../../../../assets/MentorPage/text.svg";
import { API_URL } from '../../../../utils/env.js';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
const Staff = '../../../../assets/AdminPage/StudentHome/Issuelog/staff.png';

const MentorDisciplineLog = ({ navigation, route }) => {
  const { mentorData } = route.params;

  // Main state
  const [disciplineData, setDisciplineData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [reason, setReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Student selection state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchStudent();
  }, []);

  const handleAddComplaint = async () => {
    if (!selectedStudent || !reason.trim()) {
      Alert.alert('Missing Information', 'Please select a student and enter a reason for the complaint');
      return;
    }

    try {
      setLoadingSubmit(true);
      const response = await apiFetch(`/coordinator/student/addStudentComplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roll: selectedStudent.roll,
          complaint: reason,
          registeredBy: mentorData[0].phone
        }),
      });

      const data = response

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Discipline record has been added successfully',
          [{ text: 'OK', onPress: () => {
            fetchDisciplineData(mentorData[0].section_id); // Refresh the list
            setReason('');
            setSelectedStudent(null);
            setModalVisible(false);
          }}]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please check your connection and try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  // Fetch student list
  const fetchStudent = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`${API_URL}/api/coordinator/student/getStudentList`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student list');
      }
      
      const data = response
      setStudentList(data.student);
    } catch (error) {
      console.error('Error fetching student:', error);
      Alert.alert('Error', 'Failed to load student list. Please try again later.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudent = studentList.filter(student =>
    student.student_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.roll?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Fetching logs
  useEffect(() => {
    if (mentorData) {
      fetchDisciplineData(mentorData[0].section_id);
    }
  }, [mentorData]);

  useEffect(() => {
    const filtered = disciplineData.filter(item =>
      item.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.roll?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, disciplineData]);

  const fetchDisciplineData = async (sectionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/discipline-issues`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch discipline data');
      }
      
      const data = response
      if (data.success) {
        setDisciplineData(data.issues || []);
      } else {
        throw new Error(data.message || 'Failed to load discipline data');
      }
    } catch (error) {
      console.error('Error fetching discipline data:', error);
      Alert.alert('Error', 'Failed to load discipline records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    if (mentorData) {
      fetchDisciplineData(mentorData[0].section_id);
    } else {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setSelectedSection(sectionId);
  };

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
    console.log(phone);
    
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessagePress = (item) => {
    // console.log(mentorData[0].id);

    navigation.navigate("MentorMessageBox", {
      contact: {
        receiver_id: item.registered_by_id,  //receiver_id
        receiver_name: item.registered_by_name,
        subject: item.subject || '',
        profile: item.registered_by_profile,
        sender_id: mentorData[0].id, // <-- pass mentor id  //sender_id
        sender_name: mentorData[0].name, // optional, for header
        receiver_type: item.registered_by_type
      }
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
      
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Discipline Log</Text>
      </View>

      <View style={styles.searchView}>
        <View style={styles.searchBar}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor="#767676"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={styles.loadingText}>Loading discipline records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.row}>
                  {item.profile_photo ? (
                    <Image source={getProfileImageSource(item.profile_photo)} style={styles.profilePic} />
                  ) : (
                    <Image source={Staff} style={styles.profilePic} />
                  )}
                  <View>
                    <Text style={styles.title}>{item.student_name}</Text>
                    <Text style={styles.stdid}>{item.roll}</Text>
                  </View>
                </View>
                <Text style={styles.date}>
                  {new Date(item.registered_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              
              {/* No severity indicator */}

              <Text style={styles.reasonTitle}>Reason</Text>
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>{item.complaint}</Text>
              </View>

              <View style={styles.actionButtons}>
                <Text style={styles.registeredText}>Registered by {item.registered_by_name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => handleCallPress(item.registered_by_phone)}
                  >
                    <Call width={wp('5%')} height={wp('5%')} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.chatButton}
                    onPress={() => handleMessagePress(item)}
                  >
                    <Message width={wp('5%')} height={wp('5%')} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No discipline records found</Text>
            </View>
          }
        />
      )}

      <View style={styles.activityIcons}>
        <TouchableOpacity 
          style={styles.AddIcon}
          onPress={() => setModalVisible(true)}
        >
          <Add width={wp('8.5%')} height={wp('8.5%')} />
        </TouchableOpacity>
      </View>

      {/* Add Complaint Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
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
                      <Text style={{ color: selectedStudent ? '#333' : '#999' }}>
                        {selectedStudent ? `${selectedStudent.student_name} (${selectedStudent.roll})` : 'Select student...'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reason</Text>
                    <TextInput
                      style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                      placeholder="Enter reason for discipline record..."
                      value={reason}
                      onChangeText={setReason}
                      multiline
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Registered By</Text>
                    <TextInput
                      style={[styles.textInput, {backgroundColor: '#F0F0F0'}]}
                      value={mentorData[0].name}
                      editable={false}
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        loadingSubmit && styles.registerButtonDisabled
                      ]}
                      onPress={handleAddComplaint}
                      disabled={loadingSubmit}
                    >
                      {loadingSubmit ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.registerButtonText}>
                          Submit Record
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Select Student</Text>
              <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { marginBottom: 15 }]}>
              <SearchIcon width={20} height={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or ID..."
                value={studentSearch}
                onChangeText={setStudentSearch}
              />
            </View>

            {loadingStudents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0C36FF" />
                <Text style={styles.loadingText}>Loading students...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredStudent}
                keyExtractor={(item) => item.phone}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.studentItem}
                    onPress={() => {
                      setSelectedStudent(item);
                      setShowStudentModal(false);
                    }}
                  >
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {item.student_name ? item.student_name.charAt(0).toUpperCase() : 'S'}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {item.student_name}
                      </Text>
                      <Text style={styles.studentDetails}>
                        {item.roll} • Grade {item.grade_id} - {item.section_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No students found matching your search criteria
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MentorDisciplineLog;
