import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useRef, useState } from 'react';
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
  FlatList,
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
import { API_URL } from '../../../../../utils/env.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import MentorSelectModal from './MentorSelectModal';

const AdminStudentDetails = ({ navigation, route }) => {
  const { student } = route.params || {};
  const [studentDetails, setStudentDetails] = useState(null);
  const [achievementData, setAchievementData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [issueLogData, setIssueLogData] = useState(null);
  const [homeworkIssue, setHomeworkIssue] = useState(null);
  const [mentorsData, setMentorsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [adminData, setAdminData] = useState()

  const [modalVisible, setModalVisible] = useState(false)

  const fetchAllDetails = async () => {
    fetchAdminData();
    if (student && student.id) {
      fetchStudentDetails(student.id);
      // fetchAchievements(student.id);
      fetchAttendance(student.roll);
      // fetchIssueLog(student.id);
      fetchSubjectMentors(student.id);
      // fetchSubjectsProgress(student.id);
      fetchIssueLog(student.roll)
    }
  }


  useEffect(() => {
    fetchAllDetails();
  }, [student]);

  const fetchAdminData = async () => {
    const storedData = await AsyncStorage.getItem('adminData');
    if (storedData) {
      setAdminData(storedData)
    }
  }

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await apiFetch(`/admin/students/${studentId}`);
      const data = response
      if (data.success) {
        setStudentDetails(data.student);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchAttendance = async (roll) => {
    try {
      const response = await apiFetch(`/admin/students/${roll}/attendance`);
      const data = response
      if (data.success) {
        setAttendanceData(data.studentAttendance);
        // console.log(data.studentAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchIssueLog = async (roll) => {
    try {
      const response = await apiFetch(`/admin/students/getStudentIssueLogs/${roll}`);
      const data = response
      if (data.studentIssueCount || data.studentRedoCount) {
        setIssueLogData(data.studentIssueCount);
        setHomeworkIssue(data.studentRedoCount);
        // console.log(data.studentRedoCount);
      }
    } catch (error) {
      console.error('Error fetching issue log:', error);
    }
  };

  const fetchSubjectMentors = async () => {
    try {
      const response = await apiFetch(`/admin/students/getSubjectMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: student.section_id }),
      });

      const data = response
      // console.log('Subjects mentors Data API Response:', data);

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

  if (!studentDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color='rgb(0, 89, 255)' size='large' />
        <Text>Loading...</Text>
      </View>
    );
  }

 const authTokenRef = useRef(null);
  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    // console.log(authTokenRef.current);
    
    // console.log('Profile Path:', profilePath);
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const uri = `${API_URL}/${normalizedPath}`;
      // return { uri: fullImageUrl };
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
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
                  {/* <Text style={styles.performanceTag}>Good performer</Text> */}
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
              <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                <PenIcon width={15} height={15} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.detailItem}>
              <Grade width={15} height={15} />
              <Text style={styles.detailText}>Class: {studentDetails.grade_name} - {studentDetails.section_name}</Text>
            </View>
          </View>
        </View>

        <PerformanceGraph student={studentDetails} />


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
            <Text style={styles.issueLogText}>Home work : {homeworkIssue}</Text>
          </View>
          <View style={styles.issueLogItem}>
            <Text style={styles.issueLogText}>Discipline : {issueLogData}</Text>
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
      <MentorSelectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={() => {
          setModalVisible(false);
          fetchAllDetails();
        }}
        gradeId={studentDetails.grade_id}
        studentId={studentDetails.id}
      />

      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain', { adminData })}>
        <Homeicon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentDetails;