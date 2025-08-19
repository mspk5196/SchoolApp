import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  TextInput,
  Switch,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import styles from './CoordinatorAcademicScheduleStyles';
import BackIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import { API_URL } from '../../../../utils/env';
import styles from './AcademicScheduleSty'
import TimeBasedActivityCreator from '../../../../components/TimeBasedActivityCreator';

const CoordinatorAcademicSchedule = ({ navigation, route }) => {
  const { activeGrade } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlySchedule, setMonthlySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTimeBasedModal, setShowTimeBasedModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodActivities, setPeriodActivities] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    activity_type: 'Academic',
    duration_minutes: 30,
    batch_number: 1,
    mentor_id: null,
    topic_id: null,
    has_assessment: false,
    assessment_type: 'Quiz',
    total_marks: 100,
  });

  const activityTypes = [
    'Academic', 'Quiz', 'Assessment', 'Project Discussion',
    'Practical', 'Assignment Review', 'Doubt Clearing',
    'Presentation', 'Group Discussion'
  ];

  useEffect(() => {
    loadInitialData();
  }, [activeGrade, selectedPeriod]);

  useEffect(() => {
    if (activeGrade) {
      fetchMonthlySchedule();
    }
  }, [activeGrade, selectedDate]);

  const loadInitialData = async () => {
    try {
      if (activeGrade && selectedPeriod) {
        await fetchMentors();
        await fetchTopics();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getGradeMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade })
      });
      const result = await response.json();
      if (result.success) {
        // console.log(result.gradeMentors);
        setMentors(result.gradeMentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchTopics = async () => {
    // console.log('selected',selectedPeriod.subject_id);

    try {
      const response = await fetch(`${API_URL}/api/coordinator/topics/grade/${activeGrade}/${selectedPeriod.subject_id}`);
      const result = await response.json();
      if (result.success) {
        setTopics(result.data);
        // console.log('Fetched topics:', result.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchMonthlySchedule = async () => {
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/monthly/${activeGrade}/${month}/${year}`
      );

      const result = await response.json();
      if (result.success) {
        setMonthlySchedule(result.data);
        // console.log('Monthly schedule data:', result.data[0]);
      } else {
        console.log('Monthly schedule response:', result);
        setMonthlySchedule([]);
      }
    } catch (error) {
      console.error('Error fetching monthly schedule:', error);
      setMonthlySchedule([]);
    }
  };

  const openPeriodActivities = async (period, daySchedule) => {
    setSelectedPeriod({ ...period, date: daySchedule.date });
    setShowActivityModal(true);
    await fetchPeriodActivities(period.id, daySchedule.date);
  };

  const fetchPeriodActivities = async (periodId, date) => {
    try {
      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/period-activities/${periodId}/${date}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const result = await response.json();
      if (result.success) {
        setPeriodActivities(result.data);
        console.log('Fetched period activities:', result);
      }
    } catch (error) {
      console.error('Error fetching period activities:', error);
      setPeriodActivities([]);
    }
  };

  const createActivity = async () => {
    try {
      if (!selectedPeriod || !activityForm.mentor_id) {
        Alert.alert('Error', 'Please select mentor and fill all required fields');
        return;
      }

      const payload = {
        period_id: selectedPeriod.id,
        date: selectedPeriod.date,
        activity_type: activityForm.activity_type,
        duration_minutes: activityForm.duration_minutes,
        batch_number: activityForm.batch_number,
        mentor_id: activityForm.mentor_id,
        topic_id: activityForm.topic_id,
        has_assessment: activityForm.has_assessment,
        assessment_type: activityForm.assessment_type,
        total_marks: activityForm.total_marks,
      };

      const response = await fetch(`${API_URL}/api/coordinator/academic-schedule/create-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Activity created successfully');
        fetchPeriodActivities(selectedPeriod.id, selectedPeriod.date);
        resetActivityForm();
      } else {
        Alert.alert('Error', result.message || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', 'Failed to create activity');
    }
  };

  const resetActivityForm = () => {
    setActivityForm({
      activity_type: 'Academic',
      duration_minutes: 30,
      batch_number: 1,
      mentor_id: null,
      topic_id: null,
      has_assessment: false,
      assessment_type: 'Quiz',
      total_marks: 100,
    });
  };

  // Helper function to format date without timezone issues
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateDailySchedulesManually = async () => {
    try {
      setIsGenerating(true);
      Alert.alert(
        'Generate Schedules',
        'This will create daily schedules from weekly templates for the next 7 days. Continue?',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setIsGenerating(false)
          },
          {
            text: 'Generate',
            onPress: async () => {
              try {
                const response = await fetch(`${API_URL}/api/coordinator/generate-daily-schedules-manual`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    gradeId: activeGrade,
                    days: 7,
                    includeToday: true
                  })
                });

                const result = await response.json();
                if (result.success) {
                  Alert.alert('Success', `Generated ${result.totalCreated} daily schedules from ${result.weeklySchedulesFound} weekly templates`);
                  fetchMonthlySchedule(); // Refresh the calendar
                } else {
                  Alert.alert('Error', result.message || 'Failed to generate schedules');
                }
              } catch (error) {
                console.error('Error generating schedules:', error);
                Alert.alert('Error', 'Failed to generate schedules');
              } finally {
                setIsGenerating(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      setIsGenerating(false);
      console.error('Error:', error);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMonthlySchedule();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, activeGrade]);

  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const today = new Date();
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const startDay = startOfMonth.getDay(); // 0 = Sunday

    // Create array of all calendar cells (empty + dates)
    const calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      calendarDays.push({ empty: true, key: `empty-${i}` });
    }

    // Add actual dates
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateString = formatDateToString(date);
      const daySchedule = monthlySchedule.find(schedule => schedule.date === dateString);

      calendarDays.push({
        date,
        day,
        dateString,
        hasSchedule: daySchedule && daySchedule.periods.length > 0,
        key: `date-${day}`
      });
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text style={styles.chevronIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Week day headers */}
        <View style={styles.weekDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <FlatList
          data={calendarDays}
          keyExtractor={(item) => item.key}
          numColumns={7}
          renderItem={({ item }) => {
            if (item.empty) {
              return <View style={styles.dateCell} />;
            }

            return (
              <TouchableOpacity
                style={[
                  styles.dateCell,
                  item.date.toDateString() === today.toDateString() && styles.todayCell,
                  item.date.toDateString() === selectedDate.toDateString() && styles.selectedDateCell
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text style={[
                  styles.dateText,
                  item.date.toDateString() === today.toDateString() && styles.todayText,
                  item.date.toDateString() === selectedDate.toDateString() && styles.selectedDateText
                ]}>
                  {item.day}
                </Text>
                {item.hasSchedule && (
                  <View style={styles.periodIndicator} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderDaySchedule = () => {
    const selectedDateString = formatDateToString(selectedDate);
    // console.log('Selected date string (formatted):', selectedDateString);
    // console.log('Available schedule dates:', monthlySchedule.map(s => s.date));

    const daySchedule = monthlySchedule.find(
      schedule => schedule.date === selectedDateString
    );

    // console.log('Found day schedule:', daySchedule ? 'Yes' : 'No');
    // console.log('Selected date object:', selectedDate);

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <View style={styles.noScheduleContainer}>
          <Text style={styles.noScheduleText}>No schedule available for this date</Text>
          <Text style={styles.noScheduleSubtext}>Selected: {selectedDateString}</Text>
          <Text style={styles.noScheduleSubtext}>Available: {monthlySchedule.map(s => s.date).join(', ')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.dayScheduleContainer}>
        <Text style={styles.dayScheduleTitle}>
          Schedule for {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        <FlatList
          data={daySchedule.periods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.periodCard}
              onPress={() => openPeriodActivities(item, daySchedule)}
            >
              <View style={{flexDirection:'column'}}>
                <View style={styles.periodTime && {alignItems: 'center', flexDirection: 'row'}}>
                  <Text style={styles.timeText}>{item.timeStart}</Text>
                  <Text style={styles.timeSeparator}>-</Text>
                  <Text style={styles.timeText}>{item.timeEnd}</Text>
                </View>

                <View style={styles.periodInfo}>
                  <Text style={styles.subjectName}>{item.subject_name}</Text>
                  <Text style={styles.venueText}>{item.venue_name}</Text>
                  <Text style={styles.sectionText}>Section {item.section_name}</Text>
                </View>
              </View>

              <View style={styles.periodActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedPeriod({ ...item, ...daySchedule });
                    setShowTimeBasedModal(true);
                  }}
                >
                  <Text style={styles.actionIcon}>🕐</Text>
                  <Text style={styles.actionText}>Time-Based</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openPeriodActivities(item, daySchedule)}
                >
                  <Text style={styles.actionIcon}>✂️</Text>
                  <Text style={styles.actionText}>Quick Split</Text>
                </TouchableOpacity> */}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderActivityModal = () => {
    return (
      <Modal visible={showActivityModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Period Activities: {selectedPeriod?.subject_name}
            </Text>
            <TouchableOpacity onPress={() => setShowActivityModal(false)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Existing Activities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Activities</Text>
              {periodActivities.length === 0 ? (
                <Text style={styles.noActivitiesText}>No activities created yet</Text>
              ) : (
                <FlatList
                  data={periodActivities}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.activityItem}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityType}>{item.activity_type || 'Unknown'}</Text>
                        <Text style={styles.activityDuration}>{item.start_time} - {item.end_time || 0}</Text>
                        <Text style={styles.activityDuration}>{item.duration || 0} min</Text>
                      </View>
                      <Text style={styles.activityBatch}>Batch {item.batch_number || 1}</Text>
                      <Text style={styles.activityMentor}>{item.mentor_name || 'No mentor assigned'}</Text>
                      {item.topic_name && (
                        <Text style={styles.activityTopic}>
                          Topic: {item.topic_hierarchy_path && item.topic_hierarchy_path !== null
                            ? `${item.topic_name} (${item.topic_hierarchy_path})`
                            : item.topic_name}
                        </Text>
                      )}
                      {item.has_assessment && (
                        <Text style={styles.assessmentBadge}>Assessment ({item.total_marks || 0} marks)</Text>
                      )}
                    </View>
                  )}
                />
              )}
            </View>

            {/* Create New Activity Form */}
            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create New Activity</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Activity Type</Text>
                <Picker
                  selectedValue={activityForm.activity_type}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, activity_type: value }))}
                  style={styles.picker}
                >
                  {activityTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={activityForm.duration_minutes.toString()}
                    onChangeText={(text) => setActivityForm(prev => ({
                      ...prev,
                      duration_minutes: parseInt(text) || 30
                    }))}
                    keyboardType="numeric"
                    placeholder="30"
                  />
                </View>

                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Batch Number</Text>
                  <TextInput
                    style={styles.input}
                    value={activityForm.batch_number.toString()}
                    onChangeText={(text) => setActivityForm(prev => ({
                      ...prev,
                      batch_number: parseInt(text) || 1
                    }))}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Mentor</Text>
                <Picker
                  selectedValue={activityForm.mentor_id}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, mentor_id: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Mentor" value={null} />
                  {mentors.map(mentor => (
                    <Picker.Item
                      key={mentor.id}
                      label={mentor.name}
                      value={mentor.id}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Topic</Text>
                <Picker
                  selectedValue={activityForm.topic_id}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, topic_id: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Topic" value={null} />
                  {topics.map(topic => {
                    // Build the hierarchy path display
                    const displayName = topic.hierarchy_path
                      ? `${topic.topic_name} (${topic.hierarchy_path})`
                      : topic.topic_name;

                    return (
                      <Picker.Item
                        key={topic.id}
                        label={displayName}
                        value={topic.id}
                      />
                    );
                  })}
                </Picker>
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Has Assessment</Text>
                <Switch
                  value={activityForm.has_assessment}
                  onValueChange={(value) => setActivityForm(prev => ({ ...prev, has_assessment: value }))}
                />
              </View>

              {activityForm.has_assessment && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Assessment Type</Text>
                    <Picker
                      selectedValue={activityForm.assessment_type}
                      onValueChange={(value) => setActivityForm(prev => ({ ...prev, assessment_type: value }))}
                      style={styles.picker}
                    >
                      <Picker.Item label="Quiz" value="Quiz" />
                      <Picker.Item label="Test" value="Test" />
                      <Picker.Item label="Assignment" value="Assignment" />
                      <Picker.Item label="Practical" value="Practical" />
                    </Picker>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Total Marks</Text>
                    <TextInput
                      style={styles.input}
                      value={activityForm.total_marks.toString()}
                      onChangeText={(text) => setActivityForm(prev => ({
                        ...prev,
                        total_marks: parseInt(text) || 100
                      }))}
                      keyboardType="numeric"
                      placeholder="100"
                    />
                  </View>
                </>
              )}

              <TouchableOpacity style={styles.createButton} onPress={createActivity}>
                <Text style={styles.createButtonText}>Create Activity</Text>
              </TouchableOpacity>
            </View> */}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Academic Schedule</Text>
          <Text style={styles.subtitle}>Grade {activeGrade}</Text>
        </View>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateDailySchedulesManually}
          disabled={loading || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
          {renderCalendar()}
          {renderDaySchedule()}
        </ScrollView>
      )}

      {renderActivityModal()}

      <TimeBasedActivityCreator
        visible={showTimeBasedModal}
        onClose={() => setShowTimeBasedModal(false)}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        activeGrade={activeGrade}
        sectionID={selectedPeriod?.section_id}
        onActivityCreated={() => {
          setShowTimeBasedModal(false);
          fetchPeriodActivities(selectedPeriod?.id);
          fetchMonthlySchedule();
        }}
      />
    </SafeAreaView>
  );
};


export default CoordinatorAcademicSchedule;
