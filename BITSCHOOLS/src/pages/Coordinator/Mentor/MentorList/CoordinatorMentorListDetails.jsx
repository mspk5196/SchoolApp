import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import styles from './MentorListDetailsStyles';
import Nodata from '../../../../components/General/Nodata';
const Staff = require('../../../../assets/General/staff.png');
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from '../../../../utils/ApiService';
import { API_URL } from '../../../../config/env';
import FooterHome from '../../../../components/General/FooterHome/FooterHome';
import { Header } from '../../../../components';

const CoordinatorMentorListDetails = ({ route, navigation }) => {
  const { mentor = {} } = route.params || {};
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData, selectedGrade } = params;
  console.log(selectedGrade, userData);
  
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [mentorSchedule, setMentorSchedule] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);

  // Function to parse date in dd/mm/yy format to a Date object
  const parseDate = (dateString) => {
    const [day, month, yearShort] = dateString.split('/');
    const year = '20' + yearShort; // Assuming 20xx for the year
    return new Date(year, month - 1, day); // month is 0-indexed in JS Date
  };

  // Function to format Date object to dd/mm/yy
  const formatDisplayDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  // Function to format Date object to yyyy-mm-dd for internal use
  const formatISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to check if selected date is today
  const isToday = () => {
    const today = new Date();
    const todayISO = formatISODate(today);
    return formattedDate === todayISO;
  };

  // Function to get day label
  const getDayLabel = () => {
    if (isToday()) {
      return 'Today';
    }

    const selectedDateObj = new Date(formattedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (formatISODate(selectedDateObj) === formatISODate(yesterday)) {
      return 'Yesterday';
    } else if (formatISODate(selectedDateObj) === formatISODate(tomorrow)) {
      return 'Tomorrow';
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[selectedDateObj.getDay()];
    }
  };

  const today = new Date();
  const defaultDisplayDate = formatDisplayDate(today); // dd/mm/yy
  const defaultISODate = formatISODate(today);         // yyyy-mm-dd

  const [selectedDate, setSelectedDate] = useState(defaultDisplayDate);
  const [formattedDate, setFormattedDate] = useState(defaultISODate);

  // Function to navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = parseDate(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);

    setSelectedDate(formatDisplayDate(currentDate));
    setFormattedDate(formatISODate(currentDate));

    fetchScheduleForDate(formatISODate(currentDate));
  };

  // Function to navigate to next day
  const goToNextDay = () => {
    const currentDate = parseDate(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);

    setSelectedDate(formatDisplayDate(currentDate));
    setFormattedDate(formatISODate(currentDate));

    fetchScheduleForDate(formatISODate(currentDate));
  };

  // Handle faculty selection
  const toggleFacultySelection = id => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter(item => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
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
    // console.log('Fetching schedule for date:', date, 'mentor ID:', mentor.id);

    try {
      const data = await ApiService.post('/coordinator/mentor/getMentorSchedule', {
        mentorId: mentor.id,
        date: date
      });
      console.log('Schedule API response:', data);
      if (data.success) {
        setMentorSchedule(data.schedule);
        console.log('Updated mentorSchedule state:', data.schedule);
      } else {
        console.log('API returned success: false', data.message || 'No message');
        setMentorSchedule([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setMentorSchedule([]);
    }
  };

  // Main function to fetch all mentor details
  const fetchMentorDetails = async () => {
    try {
      const data = await ApiService.post('/coordinator/mentor/getMentorDetails', {
        mentorId: mentor.id
      });

      console.log('Mentor details response:', data);

      if (data.success) {
        setMentorDetails({
          subjects: data.details.subjects || [],
          grades: data.details.grades || [],
          sections: data.details.sections || [],
          issues: 0
        });
        
        // Update attendance data from the same response
        if (data.details.attendance) {
          setAttendanceData(data.details.attendance);
        }
      }

      // Fetch issue count separately
      const issueData = await ApiService.post('/coordinator/mentor/getFacultyIssueCount', {
        facultyId: mentor.faculty_id
      });

      if (issueData.success) {
        setMentorDetails(prev => ({ ...prev, issues: issueData.count }));
      }
    } catch (error) {
      console.error('Error fetching mentor details:', error);
      Alert.alert('Error', 'Failed to fetch mentor details');
    }
  }

  // Update the formatSubjects and formatGrades functions
  const formatSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return 'None';
    // Handle if subjects is array of strings
    if (typeof subjects[0] === 'string') {
      return subjects.join(', ');
    }
    // Handle if subjects is array of objects with subject_name
    return subjects.map(sub => sub.subject_name).join(', ');
  };

  const formatGrades = (grades) => {
    if (!grades || grades.length === 0) return 'None';
    // Handle if grades is array of strings
    if (typeof grades[0] === 'string') {
      return grades.join(', ');
    }
    // Handle if grades is array of objects with grade_name
    return grades.map(grade => grade.grade_name).join(', ');
  };

  const formatSections = (sections) => {
    if (!sections || sections.length === 0) return 'None';
    // Handle if sections is array of strings
    if (typeof sections[0] === 'string') {
      return sections.join(', ');
    }
    // Handle if sections is array of objects with section_name
    return sections.map(sec => sec.section_name).join(', ');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchMentorDetails();
      await fetchScheduleForDate(formattedDate);
      setLoading(false);
    };
    fetchData();
  }, [mentor]);

  //Substitute Mentor

  // Modify the handleAllotSubstitute function
  const handleAllotSubstitute = async () => {
    try {
      if (selectedFaculties.length === 0) {
        Alert.alert('Error', 'Please select at least one faculty');
        return;
      }

      if (selectedSessions.length === 0) {
        Alert.alert('Error', 'Please select at least one session');
        return;
      }

      const newMentorId = selectedFaculties[0];

      for (const session of selectedSessions) {
        await ApiService.post('/coordinator/substitute-mentor', {
          scheduleId: session.id,
          newMentorId: newMentorId
        });
      }

      Alert.alert('Success', 'Mentor substituted for all selected sessions');
      setShowFacultyModal(false);
      setSelectedSessions([]);
      setSelectedFaculties([]);
      fetchScheduleForDate(formattedDate);

    } catch (error) {
      console.error('Error substituting mentor:', error);
      Alert.alert('Error', 'Failed to substitute mentor');
    }
  };


  // Update the session selection handler
  const handleSessionSelect = (selectedSession) => {
    const alreadySelected = selectedSessions.find(s => s.id === selectedSession.id);
    if (alreadySelected) {
      setSelectedSessions(prev => prev.filter(s => s.id !== selectedSession.id));
    } else {
      setSelectedSessions(prev => [...prev, selectedSession]);
    }

    // Fetch available mentors only once (or update if necessary)
    fetchAvailableMentors(selectedSession);
  };


  // Add the fetchAvailableMentors function
  const fetchAvailableMentors = async (selectedSession) => {
    try {
      const data = await ApiService.post('/coordinator/mentor/available-substitute-mentors', {
        sectionId: mentor.section_id,
        date: formattedDate,
        startTime: selectedSession.start_time,
        endTime: selectedSession.end_time,
        currentMentorId: mentor.id
      });

      if (data.success) {
        setAvailableMentors(data.availableMentors);
      }
    } catch (error) {
      console.error('Error fetching available mentors:', error);
    }
  };

  const authTokenRef = useRef(null);
  
  useEffect(() => {
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const uri = `${normalizedPath}`;
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
    } else {
      return Staff;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title={'Mentor Details'} navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading mentor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateParts = date.dateString.split('-');
    const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;

    setSelectedDate(displayDate);
    setFormattedDate(date.dateString);
    setShowCalendarModal(false);

    // Fetch schedule for the selected date (use date.dateString directly)
    fetchScheduleForDate(date.dateString);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title={'Mentor Details'} navigation={navigation} />

      <View style={styles.MentorDayDetails}>
        <View style={styles.profileSection}>
          {mentor.photo_url ? (
            <Image source={getProfileImageSource(mentor.photo_url)} style={styles.avatar} />
          ) : (
            <Image source={Staff} style={styles.avatar} />
          )}
          <View style={styles.mentorInfo}>
            <Text style={styles.infoLabel}>Name : {mentor.name || 'N/A'}</Text>
            <Text style={styles.infoLabel}>Mentor ID : {mentor.roll || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox]}>
            <MaterialCommunityIcons name="lock-reset" color="#000" size={24} />
            <View style={styles.totalText}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{attendanceData.total_days || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <MaterialCommunityIcons name="clock" color="#000" size={24} />
            <View>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={styles.statValue}>{attendanceData.present_days || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <MaterialCommunityIcons name="logout" color="#ff0000ff" size={24} />
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
            {/* <TouchableOpacity
              style={styles.penicon}
              onPress={() => setShowSubjectModal(true)}
            >
              <Assign width={12} height={15} />
            </TouchableOpacity> */}
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoTitle1}>Mentor For:</Text>
            </View>
            <Text style={styles.infoValue}>Section(s): {formatSections(mentorDetails.sections)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Issues: {mentorDetails.issues}</Text>
            <TouchableOpacity 
              style={styles.eyeicon}
              onPress={() => navigation.navigate('CoordinatorMentorIssueLog', {
                data: {
                  userData,
                  selectedGrade: selectedGrade
                }
              })}
            >
              <MaterialCommunityIcons name="eye" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Handling:</Text>
            <Text style={styles.infoValue}>{formatGrades(mentorDetails.grades)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.shedulesContainer}>
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Schedules</Text>
          <View style={styles.dateNavigation}>
            <View style={styles.todayIndicator} />
            <Text style={styles.todayText}>{getDayLabel()}</Text>
            <View style={styles.dateNavigationControls}>
              <TouchableOpacity onPress={goToPreviousDay}>
                <Icon name="chevron-back" size={20} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendarModal(true)}
              >
                <Text style={styles.dateText}>{selectedDate}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={goToNextDay}>
                <Icon name="chevron-forward" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
        <ScrollView>
          {mentorSchedule.length > 0 ? (
            mentorSchedule.map((cls, index) => (
              <View key={index} style={styles.classItem}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionMainInfo}>
                    <Text style={styles.subjectText}>{cls.subject_name || 'N/A'}</Text>
                    <Text style={styles.gradeText}>{cls.grade_name} - Section {cls.section_name}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
                    <Text style={styles.timeText}>
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionDetails}>
                  {cls.session_type && (
                    <View style={styles.sessionBadge}>
                      <Text style={styles.sessionBadgeText}>{cls.session_type}</Text>
                    </View>
                  )}
                  {cls.venue_name && (
                    <View style={styles.venueBadge}>
                      <MaterialCommunityIcons name="map-marker" size={14} color="#059669" />
                      <Text style={styles.venueBadgeText}>{cls.venue_name}</Text>
                    </View>
                  )}
                </View>
                {cls.topic_name && (
                  <View style={styles.topicRow}>
                    <MaterialCommunityIcons name="book-open-variant" size={14} color="#64748B" />
                    <Text style={styles.topicText}>{cls.topic_name}</Text>
                  </View>
                )}
                {cls.activity_name && (
                  <View style={styles.activityRow}>
                    <MaterialCommunityIcons name="clipboard-text" size={14} color="#64748B" />
                    <Text style={styles.activityText}>{cls.activity_name}</Text>
                  </View>
                )}
                {cls.batch_names && (
                  <View style={styles.batchRow}>
                    <MaterialCommunityIcons name="account-group" size={14} color="#64748B" />
                    <Text style={styles.batchText}>{cls.batch_names}</Text>
                  </View>
                )}
                {cls.status && (
                  <View style={[styles.statusBadge, cls.status === 'completed' && styles.statusCompleted]}>
                    <Text style={[styles.statusText, cls.status === 'completed' && styles.statusTextCompleted]}>
                      {cls.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Nodata />
          )}
        </ScrollView>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
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
      </Modal>

      <FooterHome navigation={navigation} homeRoute="CoordinatorHome" />
    </SafeAreaView>
  );
};

export default CoordinatorMentorListDetails;
