import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import BackIcon from "../../../../assets/CoordinatorPage/MentorList/leftarrow";
import Numdays from '../../../../assets/CoordinatorPage/MentorList/numdays.svg';
import Clock from '../../../../assets/CoordinatorPage/MentorList/clock.svg';
import Leaveday from '../../../../assets/CoordinatorPage/MentorList/leaveday.svg';
import Pen from '../../../../assets/CoordinatorPage/MentorList/pen.svg';
import Eye from '../../../../assets/CoordinatorPage/MentorList/Group.svg';
import Roundhome from '../../../../assets/CoordinatorPage/MentorList/roundhome.svg';
import { API_URL } from '@env'
import { Calendar } from 'react-native-calendars';
import styles from './MentorListDetailsStyles';
const Staff = require('../../../../assets/CoordinatorPage/MentorList/staff.png');

const CoordinatorMentorListDetails = ({ route, navigation }) => {
  const { mentor = {} } = route.params || {};
  // console.log(mentor);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(mentor.subject || '');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('23/12/24');
  const [formattedDate, setFormattedDate] = useState('2024-12-23');

  const [mentorSchedule, setMentorSchedule] = useState([]);

  // Available subjects to choose from
  const subjects = [
    "Maths, Social",
    "Science, English",
    "English, Social",
    "Science, Maths",
    "Hindi, English",
    "Maths, Science",
    "Social, Hindi",
    "English, Maths",
    "Science, Social",
    "Hindi, Science"
  ];

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
  };

  const [attendanceData, setAttendanceData] = useState({
    total_days: 0,
    present_days: 0,
    leave_days: 0,
    attendance_percentage: 0
  });
  const [mentorDetails, setMentorDetails] = useState({
    subjects: [],
    grades: [],
    section: '',
    issues: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch mentor schedule
  const fetchScheduleForDate = async (date) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getMentorSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          date: date // Send the formatted date (YYYY-MM-DD)
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMentorSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  // Main function to fetch all mentor details
  const fetchMentorDetails = async () => {
    try {
      // Fetch subjects and grades handled by mentor
      const assignmentsResponse = await fetch(`${API_URL}/api/coordinator/getMentorAssignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentor.id }),
      });

      const assignmentsData = await assignmentsResponse.json();

      // Fetch section information
      const sectionResponse = await fetch(`${API_URL}/api/coordinator/getMentorSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentor.id }),
      });

      const sectionData = await sectionResponse.json();

      // Fetch issues count (you'll need to implement this endpoint)
      const issuesResponse = await fetch(`${API_URL}/api/coordinator/getMentorIssues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentor.id }),
      });

      const issuesData = await issuesResponse.json();

      console.log("Assignments data", assignmentsData);

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

  // Update the formatSubjects and formatGrades functions
  const formatSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return 'None';
    return subjects.map(sub => sub.subject_name).join(', ');
  };

  const formatGrades = (grades) => {
    if (!grades || grades.length === 0) return 'None';
    return grades.map(grade => grade.grade_id).join(', ');
  };
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getAttendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mentor.phone }),
      });

      const data = await response.json();
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
    fetchMentorDetails();
    fetchAttendanceData();
    fetchScheduleForDate(formattedDate);
  }, [mentor]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  // Handle date selection
  const handleDateSelect = (date) => {
    const dateParts = date.dateString.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;

    setSelectedDate(formattedDate);
    setFormattedDate(date.dateString);
    setShowCalendarModal(false);

    // Fetch schedule for the selected date
    fetchScheduleForDate(date.dateString);
  };

  // Render item for subject list
  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() => handleSubjectSelect(item)}
    >
      <Text style={styles.subjectItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Mentor List</Text>
      </View>

      <View style={styles.MentorDayDetails}>
        <View style={styles.profileSection}>
          {/* <Image source={require('../../../../assets/CoordinatorPage/MentorList/staff.png')} style={styles.avatar} /> */}
          {mentor.photo_url ? (
            <Image source={getProfileImageSource(mentor.photo_url)} style={styles.avatar} />
          ) : (
            <Image source={Profile} style={styles.avatar} />
          )}
          <View style={styles.mentorInfo}>
            <Text style={styles.infoLabel}>Name : {mentor.name || 'N/A'}</Text>
            <Text style={styles.infoLabel}>Mentor ID : {mentor.roll || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox]}>
            <Numdays width={40} />
            <View style={styles.totalText}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{attendanceData.total_days || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Clock />
            <View>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={styles.statValue}>{attendanceData.present_days || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Leaveday />
            <View>
              <Text style={styles.statLabel}>Leave</Text>
              <Text style={styles.statValue}>{attendanceData.leave_days || '0'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Subject:</Text>
            <Text style={styles.infoValue}>{formatSubjects(mentorDetails.subjects)}</Text>
            <TouchableOpacity
              style={styles.penicon}
              onPress={() => setShowSubjectModal(true)}
            >
              <Pen width={12} height={15} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Mentor For:</Text>
            <Text style={styles.infoValue}>{'Section ' + mentorDetails.section || 'NA'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Issues: {mentorDetails.issues}</Text>
            <TouchableOpacity style={styles.eyeicon}>
              <Eye width={15} height={15} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Handling:</Text>
            <Text style={styles.infoValue}>Grade {formatGrades(mentorDetails.grades)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.shedulesContainer}>
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Schedules</Text>
          <View style={styles.dateSelector}>
            <Text style={styles.todayText}>Today</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={styles.dateText}> {selectedDate} </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {mentorSchedule.length > 0 ? (
            mentorSchedule.map((cls, index) => (
              <View key={index} style={styles.classItem}>
                <View>
                  <Text style={styles.subjectText}>{cls.subject_name}</Text>
                  <Text style={styles.gradeText}>{cls.grade_name} - {cls.section_name}</Text>
                  <Text style={styles.typeText}>{cls.activity_name}</Text>
                </View>
                <Text style={styles.timeText}>
                  {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noClassesText}>No classes scheduled for this day</Text>
          )}
        </ScrollView>
      </View>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <FlatList
              data={subjects}
              renderItem={renderSubjectItem}
              keyExtractor={(item) => item}
              style={styles.subjectList}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCalendarModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Calendar
                current={formattedDate}
                markedDates={{
                  [formattedDate]: { selected: true, selectedColor: '#0066CC' }
                }}
                onDayPress={handleDateSelect}
                theme={{
                  selectedDayBackgroundColor: '#0066CC',
                  todayTextColor: '#0066CC',
                  arrowColor: '#0066CC',
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity style={styles.homeButtonContainer} onPress={() => navigation.navigate('CoordinatorMain')}>
        <Roundhome width={50} height={50} />
      </TouchableOpacity>
    </View>
  );
};

export default CoordinatorMentorListDetails;
