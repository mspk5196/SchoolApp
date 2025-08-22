import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, ScrollView, ActivityIndicator, Alert, TouchableWithoutFeedback, TextInput } from 'react-native';
import BackIcon from "../../../../assets/CoordinatorPage/MentorList/leftarrow";
import Numdays from '../../../../assets/CoordinatorPage/MentorList/numdays.svg';
import Clock from '../../../../assets/CoordinatorPage/MentorList/clock.svg';
import Leaveday from '../../../../assets/CoordinatorPage/MentorList/leaveday.svg';
import Pen from '../../../../assets/CoordinatorPage/MentorList/pen.svg';
import Eye from '../../../../assets/CoordinatorPage/MentorList/Group.svg';
import Assign from '../../../../assets/CoordinatorPage/MentorList/assign.svg';
import Tickicon from '../../../../assets/CoordinatorPage/MentorList/tickicon.svg';
import Tick from '../../../../assets/CoordinatorPage/MentorList/tick.svg';
import Tickbox from '../../../../assets/CoordinatorPage/MentorList/tickbox.svg';
import Roundhome from '../../../../assets/CoordinatorPage/MentorList/roundhome.svg';
import { API_URL } from '../../../../utils/env.js'
import { Calendar } from 'react-native-calendars';
import styles from './MentorListDetailsStyles';
import Nodata from '../../../../components/General/Nodata';
const Staff = require('../../../../assets/CoordinatorPage/MentorList/staff.png');

const CoordinatorMentorListDetails = ({ route, navigation }) => {
  const { mentor = {} } = route.params || {};
  // console.log(mentor);
  
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // New state variables for session and faculty modals
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
    console.log(date,mentor.id);
    
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getMentorSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          date: date
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
        body: JSON.stringify({ phone: mentor.phone }),
      });

      const issuesData = await issuesResponse.json();

      // console.log("Assignments data", sectionData); 

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
        await fetch(`${API_URL}/api/coordinator/substitute-mentor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduleId: session.id,
            newMentorId: newMentorId
          }),
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
      const response = await fetch(`${API_URL}/api/coordinator/mentor/available-substitute-mentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: mentor.section_id,
          date: formattedDate,
          startTime: selectedSession.start_time,
          endTime: selectedSession.end_time,
          currentMentorId: mentor.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAvailableMentors(data.availableMentors);
      }
    } catch (error) {
      console.error('Error fetching available mentors:', error);
    }
  };

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
            {/* <TouchableOpacity
              style={styles.penicon}
              onPress={() => setShowSubjectModal(true)}
            >
              <Assign width={12} height={15} />
            </TouchableOpacity> */}
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
          <View style={styles.dateNavigation}>
            <View style={styles.todayIndicator} />
            <Text style={styles.todayText}>Today</Text>
            <View style={styles.dateNavigationControls}>
              <TouchableOpacity onPress={goToPreviousDay}>
                <Text style={styles.dateNavArrow}>{"<"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendarModal(true)}
              >
                <Text style={styles.dateText}>{selectedDate}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={goToNextDay}>
                <Text style={styles.dateNavArrow}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => setShowSessionModal(true)}
            >
              <Assign width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {mentorSchedule.length > 0 ? (
            mentorSchedule.map((cls, index) => (
              <View key={index} style={styles.classItem}>
                <View>
                  <Text style={styles.subjectText}>{cls.subject_name}</Text>
                  <Text style={styles.gradeText}>Grade {cls.grade_id} - Section {cls.section_name}</Text>
                  <Text style={styles.typeText}>{cls.activity_name}</Text>
                </View>
                <Text style={styles.timeText}>
                  {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                </Text>
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

      {/* Session Modal */}
      <Modal
        visible={showSessionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sessionModalContent}>
            <View style={styles.sessionModalHeader}>
              <BackIcon
                width={20}
                height={20}
                onPress={() => setShowSessionModal(false)}
              />
              <Text style={styles.sessionModalTitle}>Substitute allocation</Text>
            </View>

            <ScrollView style={styles.sessionList}>
              {mentorSchedule.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionItem}
                  onPress={() => handleSessionSelect(session)}
                >
                  <View style={styles.checkboxContainer}>
                    {selectedSessions.some(s => s.id === session.id) ? (
                      <Tickbox width={20} height={20} />
                    ) : (
                      <Tick width={20} height={20} />
                    )}
                  </View>
                  <Text style={styles.sessionText}>
                    {session.subject_name} ({formatTime(session.start_time)} - {formatTime(session.end_time)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.allotButton}
              onPress={() => {
                if (selectedSessions.length > 0) {
                  setShowSessionModal(false);
                  setShowFacultyModal(true);
                }
              }}
            >
              <Text style={styles.allotButtonText}>Allot substitute</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Faculty Selection Modal */}
      <Modal
        visible={showFacultyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFacultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.facultyModalContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchBox}
                placeholder="Search faculty"
                value={searchText}
                onChangeText={text => setSearchText(text)}
              />
            </View>

            <FlatList
              data={availableMentors?.filter(mentor =>
                mentor.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    selectedFaculties.includes(item.id) && styles.selectedFacultyItem,
                  ]}
                  onPress={() => toggleFacultySelection(item.id)}
                >
                  <View style={styles.facultyDetails}>
                    <View style={styles.staffName}>
                      <Oneperson width={20} height={20} />
                      <Text style={styles.facultyName}>{item.name}</Text>
                    </View>
                    <View style={styles.hatContainer}>
                      <Hat width={20} height={20} />
                      <Text style={styles.facultySpec}>
                        {item.specification}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedFaculties.includes(item.id) ? (
                      <Tickbox width={20} height={20} />
                    ) : (
                      <Tick width={20} height={20} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              style={styles.facultyList}
            />

            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleAllotSubstitute}
            >
              <Text style={styles.selectButtonText}>
                Assign Substitute <Tickicon width={16} height={16} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.homeButtonContainer} onPress={() => navigation.navigate('CoordinatorMain')}>
        <Roundhome width={50} height={50} />
      </TouchableOpacity>
    </View>
  );
};

export default CoordinatorMentorListDetails;
