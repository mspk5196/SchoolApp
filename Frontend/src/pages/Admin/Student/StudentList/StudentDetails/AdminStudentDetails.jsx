import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
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
import { API_URL } from '@env'

const AdminStudentDetails = ({ navigation, route }) => {
  const { student } = route.params || {};
  const [studentDetails, setStudentDetails] = useState(null);
  const [achievementData, setAchievementData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [issueLogData, setIssueLogData] = useState(null);
  const [mentorsData, setMentorsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);

  useEffect(() => {
    if (student && student.id) {
      fetchStudentDetails(student.id);
      // fetchAchievements(student.id);
      fetchAttendance(student.roll);
      // fetchIssueLog(student.id);
      // fetchMentors(student.id);
      // fetchSubjectsProgress(student.id);
    }
  }, [student]);

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

  // const fetchAchievements = async (studentId) => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/admin/students/${studentId}/achievements`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setAchievementData(data.achievements);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching achievements:', error);
  //   }
  // };

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

  // const fetchMentors = async (studentId) => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/admin/students/${studentId}/mentors`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setMentorsData(data.mentors);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching mentors:', error);
  //   }
  // };

  // const fetchSubjectsProgress = async (studentId) => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/admin/students/${studentId}/progress`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setSubjectsData(data.progress);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching subjects progress:', error);
  //   }
  // };

  if (!studentDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Calculate achievement progress if data exists
  let achievementProgress = 0;
  let pointsRemaining = 0;
  if (achievementData) {
    achievementProgress = (achievementData.currentPoints / achievementData.nextLevelPoints) * 100;
    pointsRemaining = achievementData.nextLevelPoints - achievementData.currentPoints;
  }

  const TARGET_LEVEL = 20;
  const TODAY = new Date();

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
                {/* <Image
                  source={studentDetails.profile_photo ? { uri: studentDetails.profile_photo } :
                    require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png')}
                  style={styles.profileImage}
                /> */}
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
            </View>
            <View style={styles.detailItem}>
              <Grade width={15} height={15} />
              <Text style={styles.detailText}>Class: {studentDetails.grade_name} - {studentDetails.section_name}</Text>
            </View>
          </View>
        </View>

        {/* {achievementData && (
          <View style={styles.card}>
            <View style={styles.achievementHeader}>
              <Text style={styles.cardTitle}>Achievements</Text>
              <Text style={styles.achievementLevel}>
                Level {achievementData.currentLevel}
              </Text>
            </View>

            <View style={styles.progressInfoRow}>
              <Text style={styles.progressLeftText}>
                {achievementData.currentPoints} Rp
              </Text>
              <Text style={styles.progressRightText}>
                {achievementData.nextLevelPoints} Rp
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFilled,
                    { width: `${achievementProgress}%` },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.progressText}>
              Score {pointsRemaining} more Rp to achieve level{' '}
              {achievementData.currentLevel + 1}
            </Text>
          </View>
        )} */}

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
                  <Image
                    source={mentor.profile_photo ? { uri: mentor.profile_photo } :
                      require('../../../../../assets/AdminPage/StudentHome/StudentProfileDetails/staff.png')}
                    style={styles.mentorImage}
                  />
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorSubject}>{mentor.subject}</Text>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                  </View>
                  <TouchableOpacity style={styles.refreshButton}>
                    <Exchange width={20} height={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentDetails;