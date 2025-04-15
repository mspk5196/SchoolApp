import React, { useState } from 'react';
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
import BackIcon from '../../../assets/AcademicSchedule/Back.svg';
import Tick2Icon from '../../../assets/AcademicSchedule/tick2.svg';
import Add2Icon from '../../../assets/AcademicSchedule/Add2.svg';
import Time2Icon from '../../../assets/AcademicSchedule/Time2.svg';
import Book2Icon from '../../../assets/AcademicSchedule/Book2.svg';
import EditIcon from '../../../assets/AcademicSchedule/Edit.svg';
import styles from './AcademicScheduleStyle';

const AcademicScheduler = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('A');
  const [activeDay, setActiveDay] = useState('Mon');
  const [sessions, setSessions] = useState([
    { id: 1, startTime: '09:00 AM', endTime: '09:40 AM', name: 'Session - 1', subject: 'Subject' }
  ]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ hour: '02', minute: '33', period: 'AM' });
  const [activeTimeType, setActiveTimeType] = useState('');
  // New state to track if we're in edit mode or create mode
  const [isEditMode, setIsEditMode] = useState(false);

  const sections = ['A', 'B', 'C', 'D','E','F','G'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun'];
  const subjects = ['Tamil', 'English', 'Math', 'Science', 'Social'];
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleAddSession = () => {
    const newSession = {
      id: sessions.length + 1,
      startTime: '09:00 AM',
      endTime: '09:40 AM',
      name: `Session - ${sessions.length + 1}`,
      subject: 'Subject'
    };
    setSessions([...sessions, newSession]);
  };

  // Toggle between edit and create mode with validation
  const toggleEditMode = () => {
    // If in create mode, validate before saving
    if (!isEditMode) {
      // Check if any session has default subject value
      const invalidSessions = sessions.filter(session => 
        session.subject === 'Subject'
      );

      if (invalidSessions.length > 0) {
        // Show alert for missing subject selections
        Alert.alert(
          "Missing Information",
          "Please select a subject for all sessions before creating the schedule.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    
    setIsEditMode(!isEditMode);
  };

  const openSubjectModal = (session) => {
    // Only open subject modal if not in edit mode
    if (!isEditMode) {
      setSelectedSession(session);
      setShowSubjectModal(true);
    }
  };

  const selectSubject = (subject) => {
    const updatedSessions = sessions.map(session => 
      session.id === selectedSession.id ? { ...session, subject } : session
    );
    setSessions(updatedSessions);
    setShowSubjectModal(false);
  };
  
  const openTimeModal = (session, type) => {
    // Only open time modal if not in edit mode
    if (!isEditMode) {
      setSelectedSession(session);
      setActiveTimeType(type);
      
      // Parse current time to set in picker
      const timeString = type === 'start' ? session.startTime : session.endTime;
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
    const updatedSessions = sessions.map(session => {
      if (session.id === selectedSession.id) {
        if (activeTimeType === 'start') {
          return { ...session, startTime: newTime };
        } else {
          return { ...session, endTime: newTime };
        }
      }
      return session;
    });
    setSessions(updatedSessions);
    setShowTimeModal(false);
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
        key={section}
        style={[styles.sectionTab, activeSection === section && styles.activeTab]}
        onPress={() => setActiveSection(section)}
      >
        <Text style={[styles.sectionTabText, activeSection === section && styles.activeTabText]}>
          Section {section}
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
          {day}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

      {/* Sessions */}
      <View style={styles.sessionsContainer}>
        {sessions.map((session, index) => (
          <View key={session.id} style={styles.sessionItem}>
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
                    {session.startTime}
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
                  <Text style={styles.sessionName}>{session.name}</Text>
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
                    {session.endTime}
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
                  {session.subject}
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
                key={subject}
                style={styles.subjectModalItem}
                onPress={() => selectSubject(subject)}
              >
                <Text style={styles.subjectModalText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal - Updated to match WeeklySchedule's time modal */}
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
              Select {activeTimeType === 'start' ? 'Starting' : 'Ending'} time for {selectedSession?.name}
            </Text>
            
            <View style={styles.timePickerContainer}>
              {/* Hour */}
              <FlatList
                data={hours}
                keyExtractor={(item) => `hour-${item}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.hour === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({...selectedTime, hour: item})}
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
                  {length: 40, offset: 40 * index, index}
                )}
              />
              
              <Text style={styles.timeSeparator}>:</Text>
              
              {/* Minutes */}
              <FlatList
                data={minutes}
                keyExtractor={(item) => `minute-${item}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.minute === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({...selectedTime, minute: item})}
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
                  {length: 40, offset: 40 * index, index}
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
                    onPress={() => setSelectedTime({...selectedTime, period})}
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

export default AcademicScheduler;