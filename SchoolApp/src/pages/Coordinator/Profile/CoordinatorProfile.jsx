import { apiFetch } from "../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Profile/Back.svg';
import ProfileIcon from '../../../assets/CoordinatorPage/Profile/profile.png';
import Total from '../../../assets/CoordinatorPage/Profile/total.svg';
import Present from '../../../assets/CoordinatorPage/Profile/present.svg';
import Leave from '../../../assets/CoordinatorPage/Profile/leave.svg';
import Home from '../../../assets/CoordinatorPage/Profile/home.svg';
import Leave2 from '../../../assets/CoordinatorPage/Profile/leave2.svg';
import Grade from '../../../assets/CoordinatorPage/Profile/grade.svg';
import styles from './ProfileStyle';
import { API_URL } from '../../../utils/env.js';

const CoordinatorProfile = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params;

  const [attendanceData, setAttendanceData] = useState({
    total_days: 0,
    present_days: 0,
    leave_days: 0,
    attendance_percentage: 0
  });
  const [coordinatorDetails, setCoordinatorDetails] = useState({
    subjects: [],
    grades: [],
    section: '',
    issues: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCoordinatorDetails = async () => {
    try {
      // Fetch subjects and grades handled by mentor
      const assignmentsResponse = await apiFetch(`/coordinator/getCoordinatorAssignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId: coordinatorData.id }),
      });

      const assignmentsData = await assignmentsResponse.json();

      // Fetch section information
      const sectionResponse = await apiFetch(`/coordinator/getCoordinatorSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: uniqueMentorData[0].id }),
      });

      const sectionData = await sectionResponse.json();

      // Fetch issues count (you'll need to implement this endpoint)
      const issuesResponse = await apiFetch(`/coordinator/getCoordinatorIssues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId: coordinatorData.id }),
      });

      const issuesData = await issuesResponse.json();

      setCoordinatorDetails({
        subjects: assignmentsData.subjects || [],
        grades: assignmentsData.grades || [],
        section: sectionData.section || '',
        issues: issuesData.count || 0
      });

    } catch (error) {
      // console.error('Error fetching coordinator details:', error);
      console.log('Error fetching coordinator details:', error);
      // Alert.alert('Error', 'Failed to fetch coordinator details');
    }
  }
  const fetchAttendanceData = async () => {
    try {
      const response = await apiFetch(`/coordinator/getAttendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: coordinatorData.phone }),
      });

      const data = response
      if (data.success) {
        setAttendanceData(data.attendanceData);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorDetails();
    fetchAttendanceData();
    console.log(coordinatorGrades);

  }, [coordinatorData]);

  // Helper function to format subjects list
  const formatSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return 'None';
    return subjects.map(sub => sub.subject_name).join(', ');
  };

  // Helper function to format grades list
  const formatGrades = (grades) => {
    if (!grades || grades.length === 0) return 'None';
    return grades.map(grade => `Grade ${grade.grade_id}`).join(', ');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return ProfileIcon;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileContainer}>

          {coordinatorData.file_path ? (
            <Image source={getProfileImageSource(coordinatorData.file_path)} style={styles.profileImage} />
          ) : (
            <Image source={ProfileIcon} style={styles.profileImage} />
          )}
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{coordinatorData.name}</Text>
          <Text style={styles.phone}>{coordinatorData.roll}</Text>
          <View style={styles.gradeContainer}>
            <Grade width={18} height={18} />
            <Text style={styles.grade}> {coordinatorData.grade_name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.attendanceCard}>
        <Text style={styles.attendanceTitle}>Attendance</Text>
        <Text style={{ ...styles.percentValue, fontSize: 30 }}>
          {Math.round(attendanceData.attendance_percentage)}%
        </Text>

        <View style={styles.attendanceDetails}>
          <View style={styles.attendanceItem}>
            <Total width={36} height={36} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Total</Text>
              <Text style={styles.attendanceNumber}>{attendanceData.total_days}</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Present width={36} height={36} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Present</Text>
              <Text style={styles.attendanceNumber}>{attendanceData.present_days}</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Leave width={36} height={36} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Leave</Text>
              <Text style={styles.attendanceNumber}>{attendanceData.leave_days}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* <View style={styles.infoCard}>
        <View style={styles.leftColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Role:</Text> Coordinator
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Phone:</Text> {coordinatorData.phone}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Mentor For:</Text> {coordinatorData.grade_name}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>User Type:</Text> {coordinatorData.user_type}
          </Text>
        </View>
      </View> */}

      <View style={styles.infoCard}>
        <View style={styles.leftColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Subjects:</Text> {formatSubjects(coordinatorDetails.subjects)}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Issues:</Text> {coordinatorDetails.issues}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.infoText}>

            <Text style={styles.bold}>Mentor For:</Text> {formatGrades(coordinatorGrades)}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Handling:</Text> {formatGrades(coordinatorDetails.grades)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.leaveButton}
        onPress={() => navigation.navigate('CoordinatorLeaveApply', { coordinatorData })}
      >
        <Leave2 width={32} height={32} />
        <Text style={styles.leaveButtonText}>Leave Apply</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('CoordinatorMain', { coordinatorData })}>
        <Home width={30} height={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CoordinatorProfile;