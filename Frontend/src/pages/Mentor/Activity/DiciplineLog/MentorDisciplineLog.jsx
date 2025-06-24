import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Alert, Linking } from "react-native";
import styles from "./DisciplineLogsty";
import Back from "../../../../assets/MentorPage/entypo_home.svg";
import Add from "../../../../assets/MentorPage/Add.svg";
import SearchIcon from "../../../../assets/MentorPage/search.svg";
import Call from "../../../../assets/MentorPage/call.svg";
import Message from "../../../../assets/MentorPage/text.svg";
import { API_URL } from '../../../../utils/env.js'
const Staff = '../../../../assets/AdminPage/StudentHome/Issuelog/staff.png'

const MentorDisciplineLog = ({ navigation, route }) => {

  const { mentorData } = route.params;

  const [disciplineData, setDisciplineData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [reason, setReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchStudent();
  }, [])

  const handleAddComplaint = async () => {
    if (!selectedStudent || !reason.trim()) {
      Alert.alert('Error', 'Please select student and enter reason');
      return;
    }

    try {
      // console.log(mentorData[0].phone);
      const response = await fetch(`${API_URL}/api/coordinator/student/addStudentComplaint`, {
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

      const data = await response.json();


      if (response.ok) {
        fetchDisciplineData(mentorData[0].section_id); // Refresh the list
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
  // Fetch student list
  const fetchStudent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/student/getStudentList`);
      const data = await response.json();
      if (response.ok) {
        setStudentList(data.student);

      } else {
        console.error('Failed to fetch student:', data.message);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const filteredStudent = studentList.filter(student =>
    student.student_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.roll?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  //Fetching logs
  useEffect(() => {
    if (mentorData) {
      fetchDisciplineData(mentorData[0].section_id);
    }
  }, [mentorData]);

  useEffect(() => {
    // console.log(disciplineData);

    const filtered = disciplineData.filter(item =>
      item.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.roll?.toLowerCase().includes(searchText.toLowerCase())

    );
    setFilteredData(filtered);
  }, [searchText, disciplineData]);

  const fetchDisciplineData = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/discipline-issues`);
      const data = await response.json();
      if (data.success) {
        // console.log(data.issues);

        setDisciplineData(data.issues);
      }
    } catch (error) {
      console.error('Error fetching discipline data:', error);
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
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Discipline log</Text>
      </View>

      <View style={styles.searchView}>
        <View style={styles.searchBar}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#767676"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id}
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
              <Text style={styles.date}>{new Date(item.registered_at).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.reasonTitle}>Reason</Text>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{item.complaint}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Text style={styles.registeredText}>Registered by {item.registered_by_name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <View width={40} height={40} style={styles.callButton}>
                  <TouchableOpacity onPress={() => handleCallPress(item.registered_by_phone)}>
                    <Call />
                  </TouchableOpacity>
                </View>
                <View width={40} height={40} style={styles.chatButton}>
                  <TouchableOpacity onPress={() => handleMessagePress(item)}>
                    <Message />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.activityIcons}>
        <View style={styles.AddIcon}>
          <TouchableOpacity onPress={() => setModalVisible(true)}><Add /></TouchableOpacity>
        </View>
      </View>

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
                      value={mentorData[0].name}
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
    </View>
  );
};

export default MentorDisciplineLog;
