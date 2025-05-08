import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Grade from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/grade.svg';
import Mentorimg from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/mentor2.svg';
import Numdays from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/numdays.svg';
import Clock from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/clock.svg';
import Leaveday from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/leaveday.svg';
import Exchange from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/exchange.svg';
import BackIcon from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/leftarrow.svg';
import styles from './StudentDetailsStyles';
import PerformanceGraph from '../../../../../components/Admin/performancegraph/Performancegraph';
import Homeicon from '../../../../../assets/AdminPage/Basicimg/Home.svg';
import EditIcon from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/edit.svg'
import PenIcon from '../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/pen.svg';
const Staff = require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png');
import { API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminStudentDetails = ({ navigation, route }) => {
  const { student } = route.params || {};
  const [studentDetails, setStudentDetails] = useState(null);
  const [achievementData, setAchievementData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [issueLogData, setIssueLogData] = useState(null);
  const [mentorsData, setMentorsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [adminData, setAdminData] = useState()
  const [newMentor, setNewMentor] = useState('');

  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    fetchAdminData();
    if (student && student.id) {
      fetchStudentDetails(student.id);
      // fetchAchievements(student.id);
      fetchAttendance(student.roll);
      // fetchIssueLog(student.id);
      fetchSubjectMentors(student.id);
      // fetchSubjectsProgress(student.id);
    }
  }, [student]);

  const fetchAdminData = async () => {
    const storedData = await AsyncStorage.getItem('adminData');
    if (storedData) {
      setAdminData(storedData)
    }
  }
  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${studentId}`);
      const data = await response.json();
      if (data.success) {
        setStudentDetails(data.student);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchAttendance = async (roll) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${roll}/attendance`);
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.studentAttendance);
        console.log(data.studentAttendance);

      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // const fetchIssueLog = async (studentId) => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/admin/students/${studentId}/issues`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setIssueLogData(data.issues);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching issue log:', error);
  //   }
  // };

  const fetchSubjectMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students/getSubjectMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: student.section_id }),
      });

      const data = await response.json();
      console.log('Subjects mentors Data API Response:', data);

      if (data.success) {
        const initializedSubjects = data.subjectMentors.map(subject => ({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          facultyName: subject.sectionMentorName || 'No faculty alloted',
          facultyId: subject.sectionMentorRoll || '-',
          sectionMentorPhoto: subject.sectionMentorPhoto,
          selectedStaff: null
        }));
        setMentorsData(initializedSubjects);
      } else {
        Alert.alert('No Subject Found', 'No subject is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching subjects data:', error);
      Alert.alert('Error', 'Failed to fetch subject data');
    }
  };

  const handleChangeMentor = async() =>{

  }

  if (!studentDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color='rgb(0, 89, 255)' size='large'/>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSaveMentor = () => {
    if (newMentorName.trim() !== '') {
      setMentor(newMentorName);
      setNewMentorName('');
    }
    setModalVisible(false);
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


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Student Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.Subcard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Image source={getProfileImageSource(studentDetails?.profile_photo)} style={styles.profileImage} />
                <View style={styles.nameSection}>
                  <Text style={styles.name}>{studentDetails.name}</Text>
                  <Text style={styles.id}>{studentDetails.roll}</Text>
                  <Text style={styles.performanceTag}>Good performer</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreOptions}>⋮</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Mentorimg width={15} height={15} />
              <Text style={styles.detailText}>Mentor: {studentDetails.mentor_name || 'Not assigned'}</Text>
              <TouchableOpacity style={styles.editButton}>
                <PenIcon width={15} height={15} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.detailItem}>
              <Grade width={15} height={15} />
              <Text style={styles.detailText}>Class: {studentDetails.grade_name} - {studentDetails.section_name}</Text>
            </View>
          </View>
        </View>

        {subjectsData.length > 0 && (
          <PerformanceGraph
            subjectsData={subjectsData}
            targetLevel={TARGET_LEVEL}
            today={TODAY}
          />
        )}

        {attendanceData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attendance</Text>
            <Text style={styles.attendancePercentage}>{Math.round(attendanceData[0].attendance_percentage)}%</Text>

            <View style={styles.attendanceDetails}>
              <View style={styles.attendanceItem}>
                <View style={[styles.attendanceIcon, styles.totalIcon]}>
                  <Numdays width={40} height={40} color="#fff" />
                </View>
                <View>
                  <Text style={styles.attendanceLabel}>Total</Text>
                  <Text style={styles.attendanceCount}>{Math.round(attendanceData[0].total_days)}</Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <View style={[styles.attendanceIcon, styles.presentIcon]}>
                  <Clock width={40} height={40} />
                </View>
                <View>
                  <Text style={styles.attendanceLabel}>Present</Text>
                  <Text style={styles.attendanceCount}>{Math.round(attendanceData[0].present_days)}</Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <View style={[styles.attendanceIcon, styles.leaveIcon]}>
                  <Leaveday width={40} height={40} color="#fff" />
                </View>
                <View>
                  <Text style={styles.attendanceLabel}>Leave</Text>
                  <Text style={styles.attendanceCount}>{Math.round(attendanceData[0].leave_days)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* {issueLogData && ( */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue log count</Text>
          <View style={styles.issueLogItem}>
            <Text style={styles.issueLogText}>Home work : {issueLogData?.issue_hw || 0}</Text>
          </View>
          <View style={styles.issueLogItem}>
            <Text style={styles.issueLogText}>Discipline : {issueLogData?.issue_dc || 0}</Text>
          </View>
        </View>
        {/* )} */}

        {mentorsData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subject Mentors list</Text>
            {mentorsData.map((mentor, index) => (
              <View key={index} style={styles.mentorItem}>
                <View style={styles.mentorBar} />
                <View style={styles.mentorContent}>
                  {/* <Image
                    source={mentor.profile_photo ? { uri: mentor.profile_photo } :
                      require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png')}
                    style={styles.mentorImage}
                  /> */}
                  <Image source={getProfileImageSource(mentor.sectionMentorPhoto)} style={styles.profileImage} />
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorSubject}>{mentor.subject_name}</Text>
                    <Text style={styles.mentorName}>{mentor.facultyName}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Mentor Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Mentor</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mentor Name:</Text>
              <TextInput
                style={styles.textInput}
                value={newMentor}
                onChangeText={setNewMentor}
                placeholder="Enter mentor name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveMentor}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain', { adminData })}>
        <Homeicon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentDetails;