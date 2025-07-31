import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
// Import SVG assets
// Note: Keeping your original imports, but they would need to be properly configured
import Grade from '../../../../assets/ParentPage/Profilepageicons/grade.svg';
import Mentorimg from '../../../../assets/ParentPage/Profilepageicons/mentor2.svg';
import Numdays from '../../../../assets/ParentPage/Profilepageicons/numdays.svg';
import Clock from '../../../../assets/ParentPage/Profilepageicons/clock.svg';
import Leaveday from '../../../../assets/ParentPage/Profilepageicons/leaveday.svg';
import BackIcon from '../../../../assets/ParentPage/Profilepageicons/leftarrow.svg';
import Profile from '../../../../assets/ParentPage/Profilepageicons/profile.png'; // Default profile image
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useState } from 'react';
import styles from './ProfileStyles'; // Import your styles
import {API_URL} from '../../../../utils/env.js'
import robustProfileImageHandler from '../../../../utils/robustProfileImageHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nodata from '../../../../components/General/Nodata';
import PerformanceGraph from '../../../../components/Admin/performancegraph/Performancegraph';

const StudentProfile = ({ navigation }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [issueLogData, setIssueLogData] = useState(null);
  const [homeworkIssue, setHomeworkIssue] = useState(null);
  const [mentorsData, setMentorsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [studentData, setStudentData] = useState(null);

  const fetchAllDetails = async () => {
    console.log(studentData);
    
    if (studentData && studentData.student_id) {
      fetchStudentDetails(studentData.student_id);
      // fetchAchievements(student.id);
      fetchAttendance(studentData.roll);
      // fetchIssueLog(student.id);
      fetchSubjectMentors(studentData.student_id);
      // fetchSubjectsProgress(student.id);
      fetchIssueLog(studentData.roll)
    }
  }


  useEffect(() => {
    fetchAllDetails();
  }, [studentData]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${studentId}`);
      const data = await response.json();
      if (data.success) {
        setStudentDetails(data.student);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchAttendance = async (roll) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${roll}/attendance`);
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.studentAttendance);
        // console.log(data.studentAttendance);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchIssueLog = async (roll) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/students/getStudentIssueLogs/${roll}`);
      const data = await response.json();
      if (data.studentIssueCount || data.studentRedoCount) {
        setIssueLogData(data.studentIssueCount);
        setHomeworkIssue(data.studentRedoCount);
        // console.log(data.studentRedoCount);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching issue log:', error);
    }
  };

  const fetchSubjectMentors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/students/getSubjectMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: studentData.section_id }),
      });

      const data = await response.json();
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
        setLoading(false);
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
        {/* <ActivityIndicator color='rgb(0, 89, 255)' size='large' />
        <Text>Loading...</Text> */}
        <Nodata/>
      </View>
    );
  }

  if(loading){
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color='rgb(0, 89, 255)' size='large' />
        <Text style={{textAlign:'center'}}>Loading...</Text>
      </View>
    );
  }


  const getProfileImageSource = (profilePath) => {
    return robustProfileImageHandler(profilePath, Profile, API_URL);
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
      
    </SafeAreaView>
  );
};

export default StudentProfile;