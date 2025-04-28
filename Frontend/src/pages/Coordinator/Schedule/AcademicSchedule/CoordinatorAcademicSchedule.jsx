import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  SafeAreaView,
  Alert  
} from 'react-native'; 
import BackIcon from '../../../../assets/CoordinatorPage/AcademicSchedule/Back.svg';
import Tick2Icon from '../../../../assets/CoordinatorPage/AcademicSchedule/tick2.svg';
import Add2Icon from '../../../../assets/CoordinatorPage/AcademicSchedule/Add2.svg';
import Time2Icon from '../../../../assets/CoordinatorPage/AcademicSchedule/Time2.svg';
import Book2Icon from '../../../../assets/CoordinatorPage/AcademicSchedule/Book2.svg';
import EditIcon from '../../../../assets/CoordinatorPage/AcademicSchedule/Edit.svg';
import styles from './AcademicScheduleStyle';
import { API_URL } from '@env';

const CoordinatorAcademicSchedule = ({ navigation, route }) => {
  const [activeSection, setActiveSection] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');
  const [sessions, setSessions] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [activeTimeType, setActiveTimeType] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const { activeGrade } = route.params; 

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Fetch sections for the active grade
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/academic-schedule/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeGrade }),
        });

        const data = await response.json();
        console.log('Grade Sections Data API Response:', data);

        if (data.success) {
          setSections(data.gradeSections);
          if (data.gradeSections.length > 0) {
            setActiveSection(data.gradeSections[0].id);
          }
        } else {
          Alert.alert('No Sections Found', 'No section is associated with this grade');
        }
      } catch (error) {
        console.error('Error fetching sections data:', error);
        Alert.alert('Error', 'Failed to fetch sections data');
      }
    };

    fetchSections();
  }, [activeGrade]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/academic-schedule/subjects`);
        const data = await response.json();
        if (response.ok) {
          setSubjects(data.subjects);
        } else {
          throw new Error(data.message || 'Failed to fetch subjects');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    };

    fetchSubjects();
  }, []);

  // Fetch schedule when section or day changes
  useEffect(() => {
    if (activeSection && activeDay) {
      fetchSchedule();
    }
  }, [activeSection, activeDay]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/academic-schedule/getShedule/${activeSection}/${activeDay}`);
      const data = await response.json();

      if (response.ok) {
        if (data.sessions.length > 0) {
          setSessions(data.sessions);
          setIsEditMode(true);
        } else {
          setSessions([{
            id: null,
            session_number: 1,
            start_time: '09:00 AM',
            end_time: '09:40 AM',
            subject_id: null,
            subject_name: 'Subject'
          }]);
          setIsEditMode(false);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Failed to fetch schedule');
    }
  };

  const handleAddSession = () => {
    const newSession = {
      id: `session-${Date.now()}`, // Unique ID for each session
      session_number: sessions.length + 1,
      start_time: '09:00 AM',
      end_time: '09:40 AM',
      subject_id: null,
      subject_name: 'Subject',
    };
    setSessions([...sessions, newSession]);
  };
  

  const toggleEditMode = async () => {
    if (!isEditMode) {
      // Validate before saving
      const invalidSessions = sessions.filter(session =>
        !session.subject_id || session.subject_name === 'Subject'
      );

      if (invalidSessions.length > 0) {
        Alert.alert(
          "Missing Information",
          "Please select a subject for all sessions before creating the schedule.",
          [{ text: "OK" }]
        );
        return;
      }

      // Validate time slots
      for (let i = 0; i < sessions.length; i++) {
        const current = sessions[i];
        const next = sessions[i + 1];

        if (next) {
          const currentEnd = convertTimeToDate(current.end_time);
          const nextStart = convertTimeToDate(next.start_time);

          if (currentEnd > nextStart) {
            Alert.alert(
              "Invalid Time Slots",
              `Session ${current.session_number} end time must be before Session ${next.session_number} start time.`,
              [{ text: "OK" }]
            );
            return;
          }
        }
      }

      // Prepare data for API
      const scheduleData = {
        section_id: activeSection,
        day: activeDay,
        sessions: sessions.map(session => ({
          session_number: session.session_number,
          start_time: convertTo24HourFormat(session.start_time),
          end_time: convertTo24HourFormat(session.end_time),
          subject_id: session.subject_id
        }))
      };

      try {
        const response = await fetch(`${API_URL}/api/coordinator/academic-schedule/schedule-add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData)
        });

        const data = await response.json();

        if (response.ok) {
          setIsEditMode(true);
          Alert.alert('Success', 'Schedule saved successfully');
        } else {
          throw new Error(data.message || 'Failed to save schedule');
        }
      } catch (error) {
        console.error('Error saving schedule:', error);
        Alert.alert('Error', 'Failed to save schedule');
      }
    } else {
      setIsEditMode(false);
    }
  };

  const openSubjectModal = (session) => {
    if (!isEditMode) {
      setSelectedSession(session);
      setShowSubjectModal(true);
    }
  };

  const selectSubject = (subject) => {
    const updatedSessions = sessions.map((session) =>
      session.id === selectedSession.id
        ? { ...session, subject_id: subject.id, subject_name: subject.subject_name }
        : session
    );
    setSessions(updatedSessions);
    setShowSubjectModal(false);
  };
  

  const openTimeModal = (session, type) => {
    if (!isEditMode) {
      setSelectedSession(session);
      setActiveTimeType(type);

      const timeString = type === 'start' ? session.start_time : session.end_time;
      const [timeValue, period] = timeString.split(' ');
      const [hour, minute] = timeValue.split(':');

      setSelectedTime({
        hour: hour,
        minute: minute,
        period: period
      });

      setShowTimeModal(true);
    }
  };

  const confirmTimeSelection = () => {
    const newTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
    const updatedSessions = sessions.map((session) =>
      session.id === selectedSession.id
        ? activeTimeType === 'start'
          ? { ...session, start_time: newTime }
          : { ...session, end_time: newTime }
        : session
    );
    setSessions(updatedSessions);
    setShowTimeModal(false);
  };
  

  // Helper functions
  const convertTo24HourFormat = (time12h) => {
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours}:${minutes}:00`;
  };

  const convertTimeToDate = (time12h) => {
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    return date;
  };

  return (
    <SafeAreaView flexgrow={1} flex={1}>
      <View style={styles.header}>
        <BackIcon width={styles.BackIcon.width} height={styles.BackIcon.height} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTxt}>Academics Schedule</Text>
      </View>

      <ScrollView nestedScrollEnabled={true} contentContainerStyle={styles.scrollViewContent}>
        {/* Section Tabs */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContent}
          style={styles.sectionTabs}
        >
          {sections.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionTab, activeSection === section.id && styles.activeTab]}
              onPress={() => setActiveSection(section.id)}
            >
              <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeTabText]}>
                Section {section.section_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Days */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysTabsContent}
          style={styles.daysTabs}
        >
          {days.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, activeDay === day && styles.activeDay]}
              onPress={() => setActiveDay(day)}
            >
              <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sessions */}
        <View style={styles.sessionsContainer}>
          {sessions.map((session, index) => (
            <View key={session.id || index} style={styles.sessionItem}>
              <View style={styles.sessionTimes}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>From :</Text>
                  <TouchableOpacity
                    style={[
                      styles.timeValue,
                      isEditMode && styles.disabledTimeValue
                    ]}
                    onPress={() => openTimeModal(session, 'start')}
                    disabled={isEditMode}
                  >
                    <Text style={[
                      styles.timeText,
                      isEditMode && styles.disabledText
                    ]}>
                      {session.start_time}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.timeIcon,
                      isEditMode && styles.disabledIcon
                    ]}
                    disabled={isEditMode}
                  >
                    <View style={styles.circle} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.clockIcon,
                      isEditMode && styles.disabledIcon
                    ]}
                    disabled={isEditMode}
                  >
                    <Time2Icon
                      width={styles.Time2Icon.width}
                      height={styles.Time2Icon.height}
                      opacity={isEditMode ? 0.5 : 1}
                    />
                  </TouchableOpacity>
                  <View style={styles.sessionNameContainer}>
                    <Text style={styles.sessionName}>Session - {session.session_number}</Text>
                  </View>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>To :</Text>
                  <TouchableOpacity
                    style={[
                      styles.timeValue,
                      isEditMode && styles.disabledTimeValue
                    ]}
                    onPress={() => openTimeModal(session, 'end')}
                    disabled={isEditMode}
                  >
                    <Text style={[
                      styles.timeText,
                      isEditMode && styles.disabledText
                    ]}>
                      {session.end_time}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.subjectContainer}>
                <TouchableOpacity
                  style={[
                    styles.subjectButton,
                    isEditMode && styles.disabledSubjectButton
                  ]}
                  onPress={() => openSubjectModal(session)}
                  disabled={isEditMode}
                >
                  <Book2Icon
                    width={styles.Book2Icon.width}
                    height={styles.Book2Icon.height}
                    marginRight={5}
                    opacity={isEditMode ? 0.5 : 1}
                  />
                  <Text style={[
                    styles.subjectText,
                    isEditMode && styles.disabledText
                  ]}>
                    {session.subject_name}
                  </Text>
                </TouchableOpacity>
              </View>

              {index < sessions.length - 1 && (
                <View style={styles.verticalLine} />
              )}
            </View>
          ))}

          {/* Add session button - only show if not in edit mode */}
          {!isEditMode && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddSession}>
              <Add2Icon width={styles.Add2Icon.width} height={styles.Add2Icon.height} />
              <Text style={styles.addButtonText}>Add more session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create/Edit Schedule Button */}
        <View style={styles.createButtonContainer}>
          {isEditMode ? (
            // Show Edit button when in created mode
            <TouchableOpacity style={[styles.editButton]} onPress={() => setIsEditMode(false)}>
              <EditIcon width={styles.EditIcon.width} height={styles.EditIcon.height} />
            </TouchableOpacity>
          ) : (
            // Show Create button when in edit mode
            <TouchableOpacity style={styles.createButton} onPress={toggleEditMode}>
              <Text style={styles.createButtonText}>Create Schedule timing</Text>
              <Tick2Icon width={styles.Tick2Icon.width} height={styles.Tick2Icon.height} />
            </TouchableOpacity>
          )}
        </View>

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
            <View style={styles.subjectModalContainer}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectModalItem}
                  onPress={() => selectSubject(subject)}
                >
                  <Text style={styles.subjectModalText}>{subject.subject_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Time Picker Modal */}
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
                Select {activeTimeType === 'start' ? 'Starting' : 'Ending'} time for Session {selectedSession?.session_number}
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
                  style={styles.selectButton}
                  onPress={confirmTimeSelection}
                >
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoordinatorAcademicSchedule;