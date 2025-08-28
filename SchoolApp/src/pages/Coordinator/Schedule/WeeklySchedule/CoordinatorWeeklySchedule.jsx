import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Back.svg';
import BookIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Book.svg';
import UserIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/User.svg';
import LocationIcon from '../../../../assets/CoordinatorPage/WeeklySchedule/Location.svg';
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
  const [venues, setVenues] = useState([])

  const { activeGrade } = route.params;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);

  // Time Picker States
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('start');
  const [timePickerDate, setTimePickerDate] = useState(new Date());

  // New activity data
  const [newActivity, setNewActivity] = useState({
    id: null,
    timeStart: '09:40 AM',
    timeEnd: '10:30 AM',
    subject: 'Select Subject',
    subject_id: null,
    // faculty: 'Select Faculty',
    // faculty_id: null,
    venue: 'Select Venue',
    venue_id: null
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // --- DATA FETCHING ---
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
        if (data.success && data.gradeSections.length > 0) {
          setSections(data.gradeSections);
          setActiveSection(data.gradeSections[0].id);
        } else {
          Alert.alert('No Sections Found', data.message || 'No sections are associated with this grade.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch sections data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, [activeGrade]);

  useEffect(() => {
    if (activeSection) {
      fetchSchedule();
      fetchSubjects();
    }
  }, [activeSection, activeDay]);

  useEffect(() => {
    if (activeGrade) fetchVenues();
  }, [activeGrade]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/getWeeklySchedule?sectionId=${activeSection}&day=${activeDay}`);
      const data = await response.json();
      setScheduleItems(data.success ? data.scheduleItems.map(item => ({
        ...item,
        timeStart: formatTime(item.start_time),
        timeEnd: formatTime(item.end_time),
        faculty: item.mentor_name || 'Not assigned',
        faculty_id: item.mentors_id,
        venue_id: item.venue_id,
        venue: item.venue_name,
      })) : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch schedule data.');
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
      if (response.ok) setSubjects(data.subjects);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subjects.');
    }
  };

  const fetchVenues = async () => {
    if (!activeGrade) return;
    try {
      const response = await fetch(`${API_URL}/api/coordinator/enrollment/getVenuesByGrade?gradeId=${activeGrade}`);
      const data = await response.json();
      if (data.success) setVenues(data.venues);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchMentors = async (subjectId) => {
    if (!subjectId) return;
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/getAvailableMentors?subjectId=${subjectId}&activeSection=${activeSection}`);
      const data = await response.json();
      if (data.success) setMentors(data.mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };
  // --- END DATA FETCHING ---


  // --- TIME FORMATTING ---
  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const parseTimeTo24Hr = (timeStr, fallback = '09:40:00') => {
    if (!timeStr) return fallback;

    // Normalize unicode (e.g., full-width digits), collapse all spaces, remove dots in a.m./p.m.
    let s = String(timeStr).normalize('NFKC').trim();
    s = s.replace(/\s+/g, ' ').replace(/\./g, '');

    // Try formats like "hh:mm[:ss] AM/PM" or "hh.mm AM/PM"
    let m = s.match(/^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*[:.]\s*(\d{2}))?\s*(AM|PM)$/i);

    // If no colon/dot, allow "hhmm AM/PM" (e.g., "1030 AM")
    if (!m) {
      const m2 = s.match(/^(\d{1,2})(\d{2})\s*(AM|PM)$/i);
      if (!m2) return fallback;
      const [, h, mm, per] = m2;
      return to24(h, mm, '00', per);
    }

    const [, h, mm, ssMaybe, per] = m;
    return to24(h, mm, ssMaybe ?? '00', per);
  };

  function to24(hh, mm, ss, period) {
    let hours = parseInt(hh, 10);
    let minutes = parseInt(mm, 10);
    let seconds = parseInt(ss, 10);

    if (/pm/i.test(period) && hours !== 12) hours += 12;
    if (/am/i.test(period) && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // --- END TIME FORMATTING ---


  // --- HANDLERS ---
  const handleDaySelect = (day) => setActiveDay(day);

  const handleAddActivity = () => {
    setNewActivity({
      id: null, timeStart: '09:40 AM', timeEnd: '10:30 AM', subject: 'Select Subject',
      subject_id: null,
      venue: 'Select Venue', venue_id: null
    });
    // setNewActivity({
    //   id: null, timeStart: '09:40 AM', timeEnd: '10:30 AM', subject: 'Select Subject',
    //   subject_id: null, faculty: 'Select Faculty', faculty_id: null,
    //   venue: 'Select Venue', venue_id: null
    // });
    setShowAddModal(true);
  };

  const handleEditActivity = (item) => {
    setNewActivity({
      id: item.id, timeStart: item.timeStart, timeEnd: item.timeEnd,
      subject: item.subject_name, subject_id: item.subject_id,
      faculty: item.faculty, faculty_id: item.faculty_id,
      venue: item.venue || 'Select Venue', venue_id: item.venue_id
    });
    fetchMentors(item.subject_id);
    setShowAddModal(true);
  };

  const saveNewActivity = async () => {
    console.log({
      id: newActivity.id,
      sectionId: activeSection,
      day: activeDay,
      startTime: parseTimeTo24Hr(newActivity.timeStart),
      endTime: newActivity.timeEnd,
      subjectId: newActivity.subject_id,
      venueId: newActivity.venue_id
    });

    const payload = {
      id: newActivity.id || null,
      sectionId: activeSection,
      day: activeDay,
      startTime: parseTimeTo24Hr(newActivity.timeStart),
      endTime: parseTimeTo24Hr(newActivity.timeEnd),
      subjectId: newActivity.subject_id,
      // mentorsId: newActivity.faculty_id,
      venue: newActivity.venue_id
    };

    try {
      const conflictCheck = await fetch(`${API_URL}/api/coordinator/weekly-schedule/checkTimeConflict?` +
        new URLSearchParams({ sectionId: activeSection, day: activeDay, startTime: payload.startTime, endTime: payload.endTime, excludeId: newActivity.id || '' }));
      const conflictData = await conflictCheck.json();
      if (conflictData.hasConflict) {
        Alert.alert('Time Conflict', 'This time slot already has a scheduled activity.');
        console.log({ sectionId: activeSection, day: activeDay, startTime: payload.startTime, endTime: payload.endTime, excludeId: newActivity.id });
        return;
      }
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/addOrUpdateWeeklySchedule`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        fetchSchedule();
        setShowAddModal(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to save schedule.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save schedule.');
    }
  };

  const deleteActivity = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/deleteWeeklySchedule/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchSchedule();
      else Alert.alert('Error', data.message || 'Failed to delete activity.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete activity.');
    }
  };

  const selectSubject = (subject) => {
    setNewActivity(prev => ({ ...prev, subject: subject.subject_name, subject_id: subject.id, faculty: 'Select Faculty', faculty_id: null }));
    fetchMentors(subject.id);
    setShowSubjectModal(false);
  };

  const selectFaculty = (mentor) => {
    setNewActivity(prev => ({ ...prev, faculty: mentor.name, faculty_id: mentor.id }));
    setShowFacultyModal(false);
  };

  const selectVenue = (venue) => {
    setNewActivity(prev => ({ ...prev, venue: venue.name, venue_id: venue.id }));
    setShowVenueModal(false);
  };

  const openTimeModal = (type) => {
    setSelectedTimeType(type);
    const timeToParse = type === 'start' ? newActivity.timeStart : newActivity.timeEnd;
    const date = new Date(`2024-01-01T${parseTimeTo24Hr(timeToParse)}`);
    setTimePickerDate(date);
    setShowTimeModal(true);
  };

  const onTimeChange = (event, selectedDate) => {
    // Always hide picker on Android after selection/dismissal
    if (Platform.OS === 'android') {
      setShowTimeModal(false);
    }

    if (event.type === 'set' && selectedDate) {
      const newTime = selectedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      setNewActivity(prev => ({
        ...prev,
        [selectedTimeType === 'start' ? 'timeStart' : 'timeEnd']: newTime
      }));

      // For iOS, the picker is inside a modal, so we just update the time displayed
      if (Platform.OS === 'ios') {
        setTimePickerDate(selectedDate);
      }
    }
  };

  // For iOS only, to confirm selection from the modal
  const confirmIosTime = () => {
    setShowTimeModal(false);
  }

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
      </View>

      {isLoading && !sections.length ? (
        <View style={styles.loadingContainer}><ActivityIndicator color='#0C36FF' size='large' /></View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Section Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabsContainer}>
              {sections.map(section => (
                <TouchableOpacity key={section.id} style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]} onPress={() => setActiveSection(section.id)}>
                  <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>Section {section.section_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Days Navigation */}
            <View style={styles.daysContainer}>
              {days.map(day => (
                <TouchableOpacity key={day} style={[styles.dayItem, activeDay === day && styles.activeDayItem]} onPress={() => handleDaySelect(day)}>
                  <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>{day.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Schedule Timeline */}
            <View style={styles.scheduleContainer}>
              {isLoading ? (<ActivityIndicator color="#0C36FF" style={{ marginTop: 20 }} />
              ) : scheduleItems.length > 0 ? (
                scheduleItems.map((item, index) => (
                  <View key={`item-${item.id}`} style={styles.scheduleItem}>
                    <View style={styles.timeContainer}><Text style={styles.timeText}>{item.timeStart} - {item.timeEnd}</Text></View>
                    <View style={styles.timeIndicator}><View style={styles.timeCircle} /><View style={styles.timeLine} /></View>
                    <TouchableOpacity style={styles.detailsContainer} onPress={() => handleEditActivity(item)}>
                      <View style={styles.detailRow}><BookIcon width={18} height={18} style={styles.detailIcon} /><Text style={styles.detailText}>{item.subject_name}</Text></View>
                      {/* <View style={styles.detailRow}><UserIcon width={18} height={18} style={styles.detailIcon} /><Text style={styles.detailText}>{item.faculty}</Text></View> */}
                      <View style={styles.detailRow}><LocationIcon width={18} height={18} style={styles.detailIcon} /><Text style={styles.detailText}>{item.venue || 'Not Set'}</Text></View>
                      <TouchableOpacity style={styles.deleteButton} onPress={(e) => { e.stopPropagation(); deleteActivity(item.id); }}>
                        <DeleteIcon width={20} height={20} color="#D32F2F" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noScheduleText}>No schedule for this day.</Text>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}><Add2Icon width={24} height={24} color="#FFFFFF" /></TouchableOpacity>
        </>
      )}

      {/* --- MODALS --- */}

      {/* Add/Edit Activity Modal */}
      <Modal transparent={true} visible={showAddModal} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{newActivity.id ? 'Edit Activity' : 'Add New Activity'}</Text>
            <ScrollView>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Time</Text>
                <View style={styles.timeInputRow}><Text style={styles.timeLabel}>From:</Text><TouchableOpacity style={styles.timeInput} onPress={() => openTimeModal('start')}><Text style={styles.timeInputText}>{newActivity.timeStart}</Text></TouchableOpacity></View>
                <View style={styles.timeInputRow}><Text style={styles.timeLabel}>To:</Text><TouchableOpacity style={styles.timeInput} onPress={() => openTimeModal('end')}><Text style={styles.timeInputText}>{newActivity.timeEnd}</Text></TouchableOpacity></View>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Subject</Text><TouchableOpacity style={styles.selectionInput} onPress={() => setShowSubjectModal(true)}><BookIcon width={20} height={20} style={styles.selectionIcon} /><Text style={styles.selectionText}>{newActivity.subject}</Text></TouchableOpacity>
              </View>
              <View style={styles.modalSection}>
                {/* <Text style={styles.modalSectionTitle}>Faculty</Text><TouchableOpacity style={styles.selectionInput} onPress={() => newActivity.subject_id && setShowFacultyModal(true)} disabled={!newActivity.subject_id}><UserIcon width={20} height={20} style={styles.selectionIcon} /><Text style={styles.selectionText}>{newActivity.faculty}</Text></TouchableOpacity> */}
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Venue</Text><TouchableOpacity style={styles.selectionInput} onPress={() => setShowVenueModal(true)}><LocationIcon width={20} height={20} style={styles.selectionIcon} /><Text style={styles.selectionText}>{newActivity.venue}</Text></TouchableOpacity>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveNewActivity}><Text style={styles.saveButtonText}>{newActivity.id ? 'Update' : 'Save'}</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Selection - Android */}
      {showTimeModal && Platform.OS === 'android' && (
        <DateTimePicker
          value={timePickerDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Time Selection - iOS */}
      {showTimeModal && Platform.OS === 'ios' && (
        <Modal transparent={true} visible={showTimeModal} animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowTimeModal(false)}>
            <View style={styles.timeModalContainer}>
              <View style={styles.listModalHeader}><Text style={styles.listModalHeaderText}>Select {selectedTimeType === 'start' ? 'Start' : 'End'} Time</Text></View>
              <DateTimePicker value={timePickerDate} mode="time" is24Hour={false} display="spinner" onChange={onTimeChange} />
              <View style={[styles.modalActions, { padding: 20 }]}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTimeModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={confirmIosTime}><Text style={styles.saveButtonText}>Select</Text></TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Subject Selection Modal */}
      <Modal transparent={true} visible={showSubjectModal} animationType="fade" onRequestClose={() => setShowSubjectModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowSubjectModal(false)}>
          <View style={styles.listModalContainer}>
            <View style={styles.listModalHeader}><Text style={styles.listModalHeaderText}>Select Subject</Text></View>
            <ScrollView style={styles.listModalScroll}>
              {subjects.map(subject => <TouchableOpacity key={subject.id} style={styles.listModalItem} onPress={() => selectSubject(subject)}><Text style={styles.listModalItemText}>{subject.subject_name}</Text></TouchableOpacity>)}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Faculty Selection Modal */}
      {/* <Modal transparent={true} visible={showFacultyModal} animationType="fade" onRequestClose={() => setShowFacultyModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowFacultyModal(false)}>
          <View style={styles.listModalContainer}>
            <View style={styles.listModalHeader}><Text style={styles.listModalHeaderText}>Select Faculty</Text></View>
            <ScrollView style={styles.listModalScroll}>
              {mentors.length > 0 ? (mentors.map(mentor => <TouchableOpacity key={mentor.id} style={styles.listModalItem} onPress={() => selectFaculty(mentor)}><Text style={styles.listModalItemText}>{mentor.name}</Text></TouchableOpacity>)) : (<Text style={styles.noMentorsText}>No mentors for this subject.</Text>)}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal> */}

      {/* Venue Selection Modal */}
      <Modal transparent={true} visible={showVenueModal} animationType="fade" onRequestClose={() => setShowVenueModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowVenueModal(false)}>
          <View style={styles.listModalContainer}>
            <View style={styles.listModalHeader}><Text style={styles.listModalHeaderText}>Select Venue</Text></View>
            <ScrollView style={styles.listModalScroll}>
              {venues.map(item => <TouchableOpacity key={item.id} style={styles.listModalItem} onPress={() => selectVenue(item)}><Text style={styles.listModalItemText}>{item.name}</Text></TouchableOpacity>)}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorWeeklySchedule; 