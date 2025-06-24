import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Back.svg';
import EditIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Edit.svg';
import BookIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Book.svg';
import UserIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/User.svg';
import ActivityIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Activity.svg';
import LocationIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Location.svg';
import Tick2Icon from '../../../../assets/CoordinatorPage/WeeklySchedule/tick2.svg';
import DeleteIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/delete-icon.svg';
import Add2Icon from '../../../../assets/CoordinatorPage/WeeklySchedule/Add.svg';
import styles from './WeeklyScheduleStyle';
import { API_URL } from '../../../../utils/env.js';

const CoordinatorWeeklySchedule = ({ navigation, route }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [venues, setVenues] = useState([])

  const { activeGrade } = route.params;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);

  // New activity data
  const [newActivity, setNewActivity] = useState({
    id: null,
    timeStart: '09:40:00',
    timeEnd: '10:30:00',
    subject: 'Select Subject',
    subject_id: null,
    faculty: 'Select Faculty',
    faculty_id: null,
    activity: null, // Changed from '1' to null
    activity_id: null, // New field for activity ID
    activity_name: 'Lecture',
    venue: 'Select Venue',
    venue_id: null // New field for venue ID
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch sections for the grade
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeGrade })
        });

        const data = await response.json();

        if (data.success) {
          setSections(data.gradeSections);
          if (data.gradeSections.length > 0) {
            setActiveSection(data.gradeSections[0].id);
          }
        } else {
          Alert.alert('No Sections Found', data.message || 'No section is associated with this grade');
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        Alert.alert('Error', 'Failed to fetch sections data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, [activeGrade]);

  // Fetch schedule when section or day changes
  useEffect(() => {
    if (activeSection) {
      fetchSchedule();
      fetchSubjects();
    }
  }, [activeSection, activeDay]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/coordinator/weekly-schedule/getWeeklySchedule?sectionId=${activeSection}&day=${activeDay}`
      );

      const data = await response.json();

      if (data.success) {
        setScheduleItems(data.scheduleItems.map(item => ({
          ...item,
          timeStart: formatTime(item.start_time),
          timeEnd: formatTime(item.end_time),
          faculty: item.mentor_name || 'Not assigned',
          faculty_id: item.mentors_id,
          activity_name: item.activity_name,
          activity: item.activity,
          venue_id:item.venue_id,
          venue:item.venue_name,
        })));
        // console.log(data.scheduleItems);

      } else {
        setScheduleItems([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Failed to fetch schedule data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSection })
      });
      const data = await response.json();
      if (response.ok) {
        setSubjects(data.subjects);
        fetchVenues();
      } else {
        throw new Error(data.message || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  // Fetch venues for the current grade
  const fetchVenues = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/coordinator/enrollment/getVenuesByGrade?gradeId=${activeGrade}`
      );
      const data = await response.json();
      if (data.success) {
        setVenues(data.venues); 
        console.log(data.venues);
        
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  // Call this when component mounts or grade changes
  useEffect(() => {
    if (activeGrade) {
      fetchVenues();
    }
  }, [activeGrade]);

  const formatTime = (timeString) => {
    if (!timeString) return '';

    // Handle cases where timeString might already be in 12-hour format
    if (timeString.includes('AM') || timeString.includes('PM') || timeString.includes('am') || timeString.includes('pm')) {
      return timeString; // Already formatted, return as is
    }

    // Parse 24-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const parseTimeTo24Hr = (timeStr) => {
    if (!timeStr) return '09:40:00'; // default time

    // If already in 24-hour format with seconds (HH:MM:SS)
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    // Handle AM/PM format (HH:MM AM/PM)
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if ((period === 'PM' || period === 'pm') && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    // Ensure hours are two digits
    hours = hours.toString().padStart(2, '0');

    // Add seconds if not present
    if (!minutes) minutes = '00';

    return `${hours}:${minutes}:00`;
  };

  const handleDaySelect = (day) => {
    setActiveDay(day);
  };

  const handleAddActivity = () => {
    setNewActivity({
      id: null,
      timeStart: '09:40 AM',
      timeEnd: '10:30 AM',
      subject: 'Select Subject',
      subject_id: null,
      faculty: 'Select Faculty',
      faculty_id: null,
      activity: null,
      activity_id: null,
      activity_name: 'Select Activity',
      venue: 'Select Venue',
      venue_id: null
    });
    setShowAddModal(true);
  };

  const handleEditActivity = (item) => {
    setNewActivity({
      id: item.id,
      timeStart: item.timeStart,
      timeEnd: item.timeEnd,
      subject: item.subject_name,
      subject_id: item.subject_id,
      faculty: item.faculty,
      faculty_id: item.faculty_id,
      activity: item.activity_name,
      activity_id: item.activity,
      activity_name: item.activity_name || 'Select Activity',
      venue: item.venue || 'Room 101', // Assuming your API returns venue_name
      venue_id: item.venue_id // This should be the venue ID
    });
    fetchMentors(item.subject_id);
    setShowAddModal(true);
  };

  const saveNewActivity = async () => {
    try {
      const conflictCheck = await fetch(
        `${API_URL}/api/coordinator/weekly-schedule/checkTimeConflict?` +
        new URLSearchParams({
          sectionId: activeSection,
          day: activeDay,
          startTime: parseTimeTo24Hr(newActivity.timeStart),
          endTime: parseTimeTo24Hr(newActivity.timeEnd),
          excludeId: newActivity.id || ''
        })
      );

      const conflictData = await conflictCheck.json();

      if (conflictData.hasConflict) {
        Alert.alert('Time Conflict', 'This time slot already has a scheduled activity');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/coordinator/weekly-schedule/addOrUpdateWeeklySchedule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newActivity.id,
            sectionId: activeSection,
            day: activeDay,
            startTime: parseTimeTo24Hr(newActivity.timeStart),
            endTime: parseTimeTo24Hr(newActivity.timeEnd),
            subjectId: newActivity.subject_id,
            mentorsId: newActivity.faculty_id,
            activity: newActivity.activity_id, // Send activity ID
            venue: newActivity.venue_id // Send venue ID
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchSchedule();
        setShowAddModal(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save schedule');
    }
  };

  const deleteActivity = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/deleteWeeklySchedule/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchSchedule(); // Refresh the schedule
      } else {
        Alert.alert('Error', data.message || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity');
    }
  };

  const fetchMentors = async (subjectId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/coordinator/weekly-schedule/getAvailableMentors?subjectId=${subjectId}&activeSection=${activeSection}`
      );
      // console.log(subjectId, activeSection);

      const data = await response.json();

      if (data.success) {
        setMentors(data.mentors);
        fetchActivities(subjectId, activeSection);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchActivities = async (subjectId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/getSectionSubjectActivities?subjectId=${subjectId}&activeSection=${activeSection}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        setActivities(data.activity_types);
        console.log(data.activity_types);

      }
    } catch (error) {
      console.error('Error fetching activity titles:', error);
    }
  };

  const selectSubject = (subject) => {
    setNewActivity(prev => ({
      ...prev,
      subject: subject.subject_name,
      subject_id: subject.id,
      faculty: 'Select Faculty',
      faculty_id: null
    }));
    // console.log(subject.id);
    fetchMentors(subject.id);
    // console.log(subject.id, activeSection);

    setShowSubjectModal(false);
  };

  const selectFaculty = (mentor) => {
    setNewActivity(prev => ({
      ...prev,
      faculty: mentor.name,
      faculty_id: mentor.id
    }));
    setShowFacultyModal(false);
  };

  // Time picker logic (same as before)
  const [selectedTimeType, setSelectedTimeType] = useState('start');
  const [selectedTime, setSelectedTime] = useState({
    hour: '09',
    minute: '40',
    period: 'AM'
  });

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const openTimeModal = (type) => {
    setSelectedTimeType(type);
    const timeString = type === 'start' ? newActivity.timeStart : newActivity.timeEnd;
    const [timeValue, period] = timeString.split(' ');
    const [hour, minute] = timeValue.split(':');

    setSelectedTime({
      hour: hour,
      minute: minute,
      period: period
    });
    setShowTimeModal(true);
  };

  const confirmTimeSelection = () => {
    const newTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
    setNewActivity(prev => ({
      ...prev,
      [selectedTimeType === 'start' ? 'timeStart' : 'timeEnd']: newTime
    }));
    setShowTimeModal(false);
  };

  const selectActivity = (activity_id, activity_name) => {
    setNewActivity(prev => ({
      ...prev,
      activity_id,
      activity_name
    }));
    setShowActivityModal(false);
  };

  const selectVenue = (venue) => {
    setNewActivity(prev => ({
      ...prev,
      venue: venue.name,
      venue_id: venue.id
    }));
    setShowVenueModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackIcon width={20} height={20} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color='#0C36FF' size='large' />
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Section Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionTabsContainer}
          >
            {sections.map(section => (
              <TouchableOpacity
                key={section.id}
                style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>
                  Section {section.section_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Days Navigation */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayItem,
                  activeDay === day && styles.activeDayItem
                ]}
                onPress={() => handleDaySelect(day)}
              >
                <Text style={styles.dayText}>{day.substring(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Schedule Timeline */}
          <View style={styles.scheduleContainer}>
            {scheduleItems.length > 0 ? (
              scheduleItems.map((item, index) => (
                <TouchableOpacity
                  key={`item-${item.id}`}
                  style={styles.scheduleItem}
                  onPress={() => handleEditActivity(item)}
                >
                  {/* Time */}
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.timeStart} - {item.timeEnd}</Text>
                    <View style={styles.timeIndicator}>
                      <View style={styles.timeCircle} />
                      {index < scheduleItems.length - 1 && <View style={styles.timeLine} />}
                    </View>
                  </View>

                  {/* Schedule Details */}
                  <View style={styles.detailsContainer}>
                    {/* Subject */}
                    <View style={styles.detailRow}>
                      <BookIcon width={16} height={16} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{item.subject_name}</Text>
                    </View>

                    {/* Faculty */}
                    <View style={styles.detailRow}>
                      <UserIcon width={16} height={16} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{item.faculty}</Text>
                    </View>

                    {/* Activity */}
                    <View style={styles.detailRow}>
                      <ActivityIcon width={16} height={16} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{item.activity_name || 'Acadamics'}</Text>
                    </View>

                    {/* Venue */}
                    <View style={styles.detailRow}>
                      <LocationIcon width={16} height={16} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{item.venue || 'Room 101'}</Text>
                    </View>

                    {/* Delete button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteActivity(item.id)}
                    >
                      <DeleteIcon width={18} height={18} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noScheduleText}>No schedule items for this day</Text>
            )}
          </View>
        </ScrollView>
      )}
      {/* Add activity button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <Add2Icon width={18} height={18} />
        <Text style={styles.addButtonText}>Add activity</Text>
      </TouchableOpacity>
      {/* Add/Edit Activity Modal */}
      <Modal
        transparent={true}
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {newActivity.id ? 'Edit Activity' : 'Add New Activity'}
            </Text>
            <ScrollView>
              {/* Time Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Time</Text>

                <View style={styles.timeInputRow}>
                  <Text style={styles.timeLabel}>From:</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => openTimeModal('start')}
                  >
                    <Text style={styles.timeInputText}>{newActivity.timeStart}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeInputRow}>
                  <Text style={styles.timeLabel}>To:</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => openTimeModal('end')}
                  >
                    <Text style={styles.timeInputText}>{newActivity.timeEnd}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subject Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Subject</Text>
                <TouchableOpacity
                  style={styles.selectionInput}
                  onPress={() => setShowSubjectModal(true)}
                >
                  <BookIcon width={16} height={16} style={styles.selectionIcon} />
                  <Text style={styles.selectionText}>{newActivity.subject}</Text>
                </TouchableOpacity>
              </View>

              {/* Faculty Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Faculty</Text>
                <TouchableOpacity
                  style={styles.selectionInput}
                  onPress={() => newActivity.subject_id && setShowFacultyModal(true)}
                  disabled={!newActivity.subject_id}
                >
                  <UserIcon width={16} height={16} style={styles.selectionIcon} />
                  <Text style={styles.selectionText}>{newActivity.faculty}</Text>
                </TouchableOpacity>
              </View>

              {/* Activity Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Activity</Text>
                <TouchableOpacity
                  style={styles.selectionInput}
                  onPress={() => setShowActivityModal(true)}
                >
                  <ActivityIcon width={16} height={16} style={styles.selectionIcon} />
                  <Text style={styles.selectionText}>{newActivity.activity_name}</Text>
                </TouchableOpacity>
              </View>

              {/* Venue Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Venue</Text>
                <TouchableOpacity
                  style={styles.selectionInput}
                  onPress={() => setShowVenueModal(true)}
                >
                  <LocationIcon width={16} height={16} style={styles.selectionIcon} />
                  <Text style={styles.selectionText}>{newActivity.venue}</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveNewActivity}
                >
                  <Text style={styles.saveButtonText}>
                    {newActivity.id ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal (same as before) */}
      <Modal
        transparent={true}
        visible={showTimeModal}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.timeModalContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.timeModalTitle}>
              Select {selectedTimeType === 'start' ? 'Start' : 'End'} Time
            </Text>

            <View style={styles.timePickerContainer}>
              {/* Hour */}
              <FlatList
                data={hours}
                keyExtractor={(item) => `hour-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.hour === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({ ...selectedTime, hour: item })}
                  >
                    <Text
                      style={[
                        styles.timePickerText,
                        selectedTime.hour === item ? styles.selectedTimePickerText : styles.unselectedTimePickerText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.timePickerColumn}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={hours.indexOf(selectedTime.hour) !== -1 ? hours.indexOf(selectedTime.hour) : 0}
                getItemLayout={(data, index) => (
                  { length: 40, offset: 40 * index, index }
                )}
              />

              <Text style={styles.timeSeparator}>:</Text>

              {/* Minutes */}
              <FlatList
                data={minutes}
                keyExtractor={(item) => `minute-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.minute === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({ ...selectedTime, minute: item })}
                  >
                    <Text
                      style={[
                        styles.timePickerText,
                        selectedTime.minute === item ? styles.selectedTimePickerText : styles.unselectedTimePickerText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.timePickerColumn}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={minutes.indexOf(selectedTime.minute) !== -1 ? minutes.indexOf(selectedTime.minute) : 0}
                getItemLayout={(data, index) => (
                  { length: 40, offset: 40 * index, index }
                )}
              />

              {/* AM/PM */}
              <View style={styles.periodPickerColumn}>
                {['AM', 'PM'].map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodPickerItem,
                      selectedTime.period === period && styles.selectedPeriodPickerItem
                    ]}
                    onPress={() => setSelectedTime({ ...selectedTime, period })}
                  >
                    <Text
                      style={[
                        styles.periodPickerText,
                        selectedTime.period === period ? styles.selectedPeriodPickerText : styles.unselectedPeriodPickerText
                      ]}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={confirmTimeSelection}
              >
                <Text style={styles.saveButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        transparent={true}
        visible={showSubjectModal}
        animationType="fade"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectModal(false)}
        >
          <View style={styles.listModalContainer}>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={styles.listModalItem}
                onPress={() => selectSubject(subject)}
              >
                <Text style={styles.listModalItemText}>{subject.subject_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Faculty Selection Modal */}
      <Modal
        transparent={true}
        visible={showFacultyModal}
        animationType="fade"
        onRequestClose={() => setShowFacultyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFacultyModal(false)}
        >
          <View style={styles.listModalContainer}>
            {mentors.length > 0 ? (
              mentors.map(mentor => (
                <TouchableOpacity
                  key={mentor.id}
                  style={styles.listModalItem}
                  onPress={() => selectFaculty(mentor)}
                >
                  <Text style={styles.listModalItemText}>{mentor.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noMentorsText}>No mentors available for this subject</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Activity Type Selection Modal */}
      <Modal
        transparent={true}
        visible={showActivityModal}
        animationType="fade"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.listModalContainer}>
            {activities.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.listModalItem}
                onPress={() => selectActivity(item.id, item.activity_name)}
              >
                <Text style={styles.listModalItemText}>{item.activity_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Venue Selection Modal */}
      <Modal
        transparent={true}
        visible={showVenueModal}
        animationType="fade"
        onRequestClose={() => setShowVenueModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVenueModal(false)}
        >
          <View style={styles.listModalContainer}>
            {venues.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.listModalItem}
                onPress={() => selectVenue(item)} // Pass the whole venue object
              >
                <Text style={styles.listModalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorWeeklySchedule;