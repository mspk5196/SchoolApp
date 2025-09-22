import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from 'react-native-responsive-screen';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import Profile from '../../../../assets/MentorPage/staff.png';
import Total from '../../../../assets/MentorPage/total.svg';
import Present from '../../../../assets/MentorPage/present.svg';
import Leave from '../../../../assets/MentorPage/leave.png';
import Home from '../../../../assets/MentorPage/home.svg';
import Leave2 from '../../../../assets/MentorPage/leave2.svg';
import Grade from '../../../../assets/MentorPage/grade.svg';
import styles from './mentordetailssty';
import { API_URL } from '../../../../utils/env.js'

const MentorProfileDetails = ({ navigation, route }) => {
  const { mentorData } = route.params;

  const [attendanceData, setAttendanceData] = useState([]);
  const [mentorDetails, setMentorDetails] = useState({
    subjects: [],
    grades: [],
    section: '',
    issues: 0
  });

  const uniqueMentorData = mentorData.filter(
    (mentor, index, self) =>
      index === self.findIndex((m) => m.id === mentor.id)
  );
  console.log('Unique Mentor Data:', uniqueMentorData);


  const fetchAttendanceData = async () => {
    try {
      const response = await apiFetch(`/mentor/getMentorAttendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: uniqueMentorData[0].phone }),
      });

      const data = response
      console.log('Mentor Attendance Data API Response:', data);

      if (data.success && data.attendanceData) {
        setAttendanceData(data.attendanceData);
      } else {
        Alert.alert('No Mentor Attendance Found', 'No mentor attendance data is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching mentor attendance data:', error);
      Alert.alert('Error', 'Failed to fetch mentor attendance data');
    }
  }

  const fetchMentorDetails = async () => {
    try {
      // Fetch subjects and grades handled by mentor
      const assignmentsResponse = await apiFetch(`/mentor/getMentorAssignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: uniqueMentorData[0].id }),
      });

      const assignmentsData = await assignmentsResponse.json();

      // Fetch section information
      const sectionResponse = await apiFetch(`/mentor/getMentorSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: uniqueMentorData[0].id }),
      });

      const sectionData = await sectionResponse.json();

      // Fetch issues count (you'll need to implement this endpoint)
      const issuesResponse = await apiFetch(`/mentor/getMentorIssues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: uniqueMentorData[0].id }),
      });

      const issuesData = await issuesResponse.json();

      setMentorDetails({
        subjects: assignmentsData.subjects || [],
        grades: assignmentsData.grades || [],
        section: sectionData.section || '',
        issues: issuesData.count || 0
      });

    } catch (error) {
      console.error('Error fetching mentor details:', error);
      Alert.alert('Error', 'Failed to fetch mentor details');
    }
  }

  useEffect(() => {
    fetchAttendanceData();
    fetchMentorDetails();
  }, [mentorData]);

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

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('8%')} height={wp('8%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mentor Details</Text>
      </View>
      <View style={styles.headerBorder} />

      <View style={styles.card}>
        <View style={styles.profileContainer}>
          {uniqueMentorData[0].file_path ? (
            <Image source={getProfileImageSource(uniqueMentorData[0].file_path)} style={styles.profileImage} />
          ) : (
            <Image source={Profile} style={styles.profileImage} />
          )}
        </View>
        {uniqueMentorData.map((mentor, index) => (
          <View style={styles.details} key={mentor.id}>
            <Text style={styles.name}>{mentor.name}</Text>
            <Text style={styles.phone}>{mentor.roll}</Text>
            <View style={styles.gradeContainer}>
              <Grade />
              <Text style={styles.grade}> Grade : {mentor.grade_id} - {mentor.section_name}</Text>
            </View>
          </View>
        ))}
      </View>

      {attendanceData && (
        <View style={styles.attendanceCard}>
          <Text style={styles.attendanceTitle}>Attendance</Text>
          <Text style={{ ...styles.percentValue, fontSize: wp('8%') }}>
            {Math.round(attendanceData.attendance_percentage)}%
          </Text>

          <View style={styles.attendanceDetails}>
            <View style={styles.attendanceItem}>
              <Total width={wp('9%')} height={wp('9%')} />
              <View style={styles.attendanceTextContainer}>
                <Text style={styles.attendanceText}>Total</Text>
                <Text style={styles.attendanceNumber}>{attendanceData.total_days}</Text>
              </View>
            </View>
            <View style={styles.attendanceItem}>
              <Present width={wp('9%')} height={wp('9%')} />
              <View style={styles.attendanceTextContainer}>
                <Text style={styles.attendanceText}>Present</Text>
                <Text style={styles.attendanceNumber}>{attendanceData.present_days}</Text>
              </View>
            </View>
            <View style={styles.attendanceItem}>
              <Image source={Leave} style={styles.attendanceIcon} />
              <View style={styles.attendanceTextContainer}>
                <Text style={styles.attendanceText}>Leave</Text>
                <Text style={styles.attendanceNumber}>{attendanceData.leave_days}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.leftColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Subjects:</Text> {formatSubjects(mentorDetails.subjects)}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Issues:</Text> {mentorDetails.issues}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Mentor For:</Text> Section {mentorDetails.section}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Handling:</Text> {formatGrades(mentorDetails.grades)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={() => navigation.navigate("MentorLeaveApply", { mentorData })}>
        <Leave2 width={wp('8%')} height={wp('8%')} />
        <Text style={styles.leaveButtonText}>Leave Apply</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("MentorMain", { mentorData })}
        style={{
          ...styles.homeButton,
          width: wp('17.5%'),
          height: wp('17.5%'),
        }}>
        <Home width={wp('9%')} height={wp('9%')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MentorProfileDetails;