import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, ScrollView, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Picker } from '@react-native-picker/picker';
import BackIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Back.svg';
import BookIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Book.svg';
import FrequencyIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Repeat.svg';
import TimeIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Time.svg';
import AddIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Add.svg';
import MenuIcon from '../../../../assets/CoordinatorPage/ExamSchedule/Menu.svg';
import styles, { modalStyles, frequencyStyles } from './ExamScheduleStyle';
import { ExamProvider, useExams } from './ExamContext';
import ConflictResolutionModal from './ConflictResolutionModal';
import { API_URL } from "../../../../utils/env.js";

const CoordinatorExamSchedule = ({ navigation, route }) => {
  const { activeGrade } = route.params;
  const { sessions, loading, addSession, updateSession, deleteSession, handleConflictResolution } = useExams();
  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [customDays, setCustomDays] = useState([]);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("Don't Repeat");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('start');
  const [selectedTime, setSelectedTime] = useState({
    hour: '09',
    minute: '00',
    period: 'AM',
  });

  // Conflict resolution state
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictData, setConflictData] = useState({
    conflicts: [],
    sessionData: null
  });

  // Time picker data
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const frequencyOptions = ["Don't Repeat", 'Daily', 'Every Mon', 'Every Tue', 'Every Wed', 'Every Thu', 'Every Fri', 'Every Sat', 'Every Sun', 'Mon,Wed', 'Tue,Thu', 'Thu,Sat'];

  // Fetch subjects when component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiFetch(`/coordinator/getGradeSubject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gradeID: activeGrade }),
        });
        const data = response
        if (data.success) {
          setSubjects(data.gradeSubjects);
          if (data.gradeSubjects.length > 0) {
            setSelectedSubject(data.gradeSubjects[0].subject_id);
          }
        } else {
          Alert.alert("Error", "Failed to fetch subjects");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        Alert.alert("Error", "Failed to fetch subjects");
      }
    };

    fetchSubjects();
  }, [activeGrade]);

  // Open time modal
  const openTimeModal = (type) => {
    setSelectedTimeType(type);

    if (type === 'start' && startTime) {
      const [timeValue, period] = startTime.split(' ');
      const [hour, minute] = timeValue.split(':');
      setSelectedTime({
        hour: hour,
        minute: minute,
        period: period,
      });
    } else if (type === 'end' && endTime) {
      const [timeValue, period] = endTime.split(' ');
      const [hour, minute] = timeValue.split(':');
      setSelectedTime({
        hour: hour,
        minute: minute,
        period: period,
      });
    } else {
      // Default time
      setSelectedTime({
        hour: '09',
        minute: '00',
        period: 'AM',
      });
    }

    setShowTimeModal(true);
  };

  // Confirm time selection
  const confirmTimeSelection = () => {
    const newTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;

    if (selectedTimeType === 'start') {
      setStartTime(newTime);
    } else {
      setEndTime(newTime);
    }

    setShowTimeModal(false);
  };

  // Show frequency modal
  const showFrequencyModal = () => {
    if (selectedSubject && selectedDate && startTime && endTime) {
      setFrequencyModalVisible(true);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedSubject(subjects.length > 0 ? subjects[0].subject_id : null);
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setSelectedFrequency("Don't Repeat");
    setCustomDays([]);
    setIsEditing(false);
    setEditingId(null);
  };

  // Handle edit session
  const handleEditSession = (id) => {
    const sessionToEdit = sessions.find(session => session.id === id);
    if (!sessionToEdit) return;

    setIsEditing(true);
    setEditingId(id);

    // Parse the session data
    setSelectedSubject(sessionToEdit.subject_id);
    setSelectedDate(sessionToEdit.date);

    // Parse the time string to extract start and end times
    const timeRange = sessionToEdit.time.split(' - ');
    setStartTime(timeRange[0]);
    setEndTime(timeRange[1]);

    // Set frequency
    const frequency = sessionToEdit.frequency === 'Only Once' ? "Don't Repeat" : sessionToEdit.frequency;
    setSelectedFrequency(frequency);

    // Open the modal
    setModalVisible(true);
  };

  const [isLoading, setLoading] = useState(false)
  // Add or update session handler
  const handleAddSession = async () => {
    // Find subject name for the selected subject_id
    const subjectObj = subjects.find(sub => sub.subject_id === selectedSubject);
    const subjectName = subjectObj ? subjectObj.subject_name : 'Subject';

    const newSession = {
      subject_id: selectedSubject,
      subject: subjectName,
      date: selectedDate,
      time: `${startTime} - ${endTime}`,
      frequency: selectedFrequency === "Don't Repeat" ? 'Only Once' : selectedFrequency,
    };

    let result;
    if (isEditing && editingId) {
      setLoading(true);
      result = await updateSession(editingId, newSession);
      setLoading(false);
    } else {
      setLoading(true);
      result = await addSession(newSession);
      setLoading(false);
      
      // Check if there were conflicts
      if (result && result.hasConflicts) {
        setConflictData({
          conflicts: result.conflicts,
          sessionData: newSession
        });
        setConflictModalVisible(true);
        return;
      }
    }

    if (result && (result.success || result === true)) {
      // Reset form and close modals
      setFrequencyModalVisible(false);
      setModalVisible(false);
      resetForm();
    } else if (result && result.message) {
      Alert.alert('Error', result.message);
    }
  };

  // Handle conflict resolution
  const handleConflictDelete = async () => {
    setLoading(true);
    const result = await handleConflictResolution(conflictData.sessionData, true);
    setLoading(false);
    
    if (result && result.success) {
      setConflictModalVisible(false);
      setFrequencyModalVisible(false);
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Exam schedule created and conflicting schedules deleted');
    } else {
      Alert.alert('Error', result?.message || 'Failed to create exam schedule');
    }
  };

  const handleConflictCancel = () => {
    setConflictModalVisible(false);
    setConflictData({ conflicts: [], sessionData: null });
  };

  // Handle delete session
  const handleDeleteSession = async (id) => {
    const success = await deleteSession(id);
    if (!success) {
      Alert.alert('Error', 'Failed to delete session');
    }
  };

  // Get marked dates for calendar
  const markedDates = sessions.reduce((acc, session) => {
    try {
      const dateObj = parseISO(session.date);
      const dateKey = format(dateObj, 'yyyy-MM-dd');
      acc[dateKey] = { selected: true, selectedColor: session.color };
    } catch (error) {
      console.error('Error processing date:', session.date, error);
    }
    return acc;
  }, {});
  
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = { marked: true, dotColor: '#2196F3' };
  } 

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading exam schedules...</Text>
      </SafeAreaView>
    );
  }

  return (
    <MenuProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Exam Schedule</Text>
        </View>
        <ScrollView nestedScrollEnabled={true}>
          {/* Calendar */}
          <View style={styles.calendercontainer}>
            <Calendar
              style={styles.calender}
              current={new Date().toISOString().split('T')[0]}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setModalVisible(true);
              }}
            />
          </View>

          {/* Upcoming Exams */}
          <View>
            <Text style={styles.UpcomingExamTxt}>Upcoming Exam</Text>
          </View>

          {/* List of Sessions */}
          <View>
            {sessions.length === 0 ? (
              <Text style={styles.noSessionsText}>No exam schedules found</Text>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[styles.card, { borderLeftColor: item.color }]}>
                    <Text style={styles.date}>
                      {new Date(item.date).getDate()} {'\n'}
                      {new Date(item.date).toLocaleString('default', { month: 'short' })}
                    </Text>
                    <View style={styles.cardContent}>
                      <View>
                        <View style={styles.cardRow}>
                          <BookIcon
                            width={styles.BookIcon.width}
                            height={styles.BookIcon.height}
                          />
                          <Text style={styles.subject}>{item.subject}</Text>
                        </View>
                        <View style={styles.cardRow}>
                          <TimeIcon
                            width={styles.TimeIcon.width}
                            height={styles.TimeIcon.height}
                          />
                          <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <View style={styles.cardRow}>
                          <FrequencyIcon
                            width={styles.FrequencyIcon.width}
                            height={styles.FrequencyIcon.height}
                          />
                          <Text style={styles.frequency}>{item.frequency}</Text>
                        </View>
                      </View>
                    </View>
                    <Menu style={{ zIndex: 1000 }}>
                      <MenuTrigger customStyles={{ triggerWrapper: { padding: 5 } }}>
                        <MenuIcon
                          width={styles.MenuIcon.width}
                          height={styles.MenuIcon.height}
                        />
                      </MenuTrigger>
                      <MenuOptions customStyles={styles.menuOptions}>
                        <MenuOption onSelect={() => handleEditSession(item.id)}>
                          <Text style={styles.menuOptionText}>Edit</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => handleDeleteSession(item.id)}>
                          <Text style={styles.menuOptionDeleteText}>Delete</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                )}
              />
            )}
          </View>

          {/* Add Session Button */}
          <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
            <AddIcon
              width={styles.AddIcon.width}
              height={styles.AddIcon.height}
            />

            <Text style={styles.addButtonText}> Add more session</Text>
          </Pressable>
        </ScrollView>

        {/* Add/Edit Session Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}>
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              <Text style={modalStyles.modalTitle}>
                {isEditing ? 'Edit Exam Session' : 'Add New Exam Session'}
              </Text>
              <ScrollView>
                {/* Subject Dropdown */}
                <Text style={modalStyles.inputLabel}>Subject</Text>
                <View style={modalStyles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSubject}
                    style={modalStyles.picker}
                    dropdownIconColor='black'
                    onValueChange={(itemValue) => setSelectedSubject(itemValue)}>
                    {subjects.map((subject) => (
                      <Picker.Item
                        key={subject.subject_id}
                        label={subject.subject_name}
                        value={subject.subject_id}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Date Picker */}
                <Text style={modalStyles.inputLabel}>Date</Text>
                <View style={modalStyles.calendarContainer}>
                  <Calendar
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={
                      selectedDate
                        ? {
                          [selectedDate]: {
                            selected: true,
                            selectedColor: '#3f51b5',
                          },
                        }
                        : {}
                    }
                    style={modalStyles.calendar}
                  />
                </View>

                {/* Time Pickers */}
                <View style={modalStyles.timeContainer}>
                  <View style={modalStyles.timeInputContainer}>
                    <Text style={modalStyles.inputLabel}>Start Time</Text>
                    <Pressable
                      style={modalStyles.timeInput}
                      onPress={() => openTimeModal('start')}>
                      <Text style={{ color: 'grey' }}>{startTime || 'Select Start Time'}</Text>
                    </Pressable>
                  </View>

                  <View style={modalStyles.timeInputContainer}>
                    <Text style={modalStyles.inputLabel}>End Time</Text>
                    <Pressable
                      style={modalStyles.timeInput}
                      onPress={() => openTimeModal('end')}>
                      <Text style={{ color: 'grey' }}>{endTime || 'Select End Time'}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={modalStyles.buttonContainer}>
                  <Pressable
                    style={[modalStyles.button, modalStyles.buttonCancel]}
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}>
                    <Text style={modalStyles.buttonTextCancel}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={[modalStyles.button, modalStyles.buttonSave]}
                    onPress={showFrequencyModal}>

                    <Text style={modalStyles.buttonTextSave}>Continue</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Frequency Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={frequencyModalVisible}
          onRequestClose={() => setFrequencyModalVisible(false)}>
          <View style={modalStyles.RepeatedcenteredView}>
            <View style={modalStyles.RepeatedmodalView}>
              <Text style={modalStyles.RepeatedmodalTitle}>
                Select Repeat Schedule
              </Text>

              <ScrollView style={frequencyStyles.container}>
                {frequencyOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      frequencyStyles.radioOption,
                      selectedFrequency === option &&
                      frequencyStyles.radioOptionSelected,
                    ]}
                    onPress={() => setSelectedFrequency(option)}>
                    <View style={frequencyStyles.radioCircle}>
                      {selectedFrequency === option && (
                        <View style={frequencyStyles.selectedRb} />
                      )}
                    </View>
                    <Text style={frequencyStyles.radioText}>{option}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Action Buttons */}
              <View style={modalStyles.buttonContainer}>
                <Pressable
                  style={[modalStyles.button, modalStyles.buttonCancel]}
                  onPress={() => setFrequencyModalVisible(false)}>
                  <Text style={modalStyles.buttonTextCancel}>Back</Text>
                </Pressable>

                <Pressable
                  style={[modalStyles.button, modalStyles.buttonSave]}
                  onPress={handleAddSession}>
                  {isLoading ?
                    <ActivityIndicator size="small" color="#0000ff" /> : <Text style={modalStyles.buttonTextSave}>Save</Text>
                  }

                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time Selection Modal */}
        <Modal
          transparent={true}
          visible={showTimeModal}
          animationType="slide"
          onRequestClose={() => setShowTimeModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimeModal(false)}>
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
                        selectedTime.hour === item && styles.selectedTimePickerItem,
                      ]}
                      onPress={() =>
                        setSelectedTime({ ...selectedTime, hour: item })
                      }>
                      <Text
                        style={[
                          styles.timePickerText,
                          selectedTime.hour === item && styles.selectedTimePickerText,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.timePickerColumn}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={
                    hours.indexOf(selectedTime.hour) !== -1
                      ? hours.indexOf(selectedTime.hour)
                      : 0
                  }
                  getItemLayout={(data, index) => ({
                    length: 40,
                    offset: 40 * index,
                    index,
                  })}
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
                        selectedTime.minute === item && styles.selectedTimePickerItem,
                      ]}
                      onPress={() =>
                        setSelectedTime({ ...selectedTime, minute: item })
                      }>
                      <Text
                        style={[
                          styles.timePickerText,
                          selectedTime.minute === item && styles.selectedTimePickerText,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.timePickerColumn}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={
                    minutes.indexOf(selectedTime.minute) !== -1
                      ? minutes.indexOf(selectedTime.minute)
                      : 0
                  }
                  getItemLayout={(data, index) => ({
                    length: 40,
                    offset: 40 * index,
                    index,
                  })}
                />

                {/* AM/PM */}
                <View style={styles.periodPickerColumn}>
                  {['AM', 'PM'].map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodPickerItem,
                        selectedTime.period === period && styles.selectedPeriodPickerItem,
                      ]}
                      onPress={() =>
                        setSelectedTime({ ...selectedTime, period })
                      }>
                      <Text
                        style={[
                          styles.periodPickerText,
                          selectedTime.period === period && styles.selectedPeriodPickerText,
                        ]}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowTimeModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={confirmTimeSelection}>
                  <Text style={styles.saveButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Conflict Resolution Modal */}
        <ConflictResolutionModal
          visible={conflictModalVisible}
          conflicts={conflictData.conflicts}
          sessionData={conflictData.sessionData}
          onCancel={handleConflictCancel}
          onDeleteAndCreate={handleConflictDelete}
        />
      </SafeAreaView>
    </MenuProvider>
  );
};

// Wrap the component with the provider
export default ({ navigation, route }) => (
  <ExamProvider gradeId={route.params.activeGrade}>
    <CoordinatorExamSchedule navigation={navigation} route={route} />
  </ExamProvider>
);