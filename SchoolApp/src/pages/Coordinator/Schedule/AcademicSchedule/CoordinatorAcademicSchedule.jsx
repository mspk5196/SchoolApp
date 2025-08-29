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
  TouchableWithoutFeedbackComponent,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import styles from './CoordinatorAcademicScheduleStyles';
import BackIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import { API_URL } from '../../../../utils/env';
import styles from './AcademicScheduleSty'
import TimeBasedActivityCreator from '../../../../components/TimeBasedActivityCreator';
import { TouchableWithoutFeedback } from 'react-native';

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
  const [activeSection, setActiveSection] = useState(null);
  const [sections, setSections] = useState([]);
  
  // New state for inline editing
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [calendarMinimized, setCalendarMinimized] = useState(false);

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
    if (activeGrade && activeSection) {
      fetchMonthlySchedule();
    }
  }, [activeGrade, selectedDate, activeSection]);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };
    fetchSections();
  }, [activeGrade]);

  const fetchMonthlySchedule = async () => {
    setMonthlySchedule([]);
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/monthly/${activeGrade}/${activeSection}/${month}/${year}`
      );

      const result = await response.json();
      if (result.success) {
        setMonthlySchedule(result.data);
        console.log('Monthly schedule data:', result.data);
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
    setPeriodActivities([]);
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

  // Handle date selection - minimize calendar
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setCalendarMinimized(true);
    setExpandedPeriod(null); // Close any expanded period
  };

  // Handle period card click - expand inline
  const handlePeriodClick = async (period, daySchedule) => {
    const periodKey = `${period.id}-${daySchedule.date}`;
    
    if (expandedPeriod === periodKey) {
      // If clicking the same period, collapse it
      setExpandedPeriod(null);
      setSelectedPeriod(null);
      setPeriodActivities([]);
    } else {
      // Expand new period
      setExpandedPeriod(periodKey);
      setSelectedPeriod({ ...period, date: daySchedule.date });
      
      // Fetch activities for this period
      setLoading(true);
      try {
        await fetchPeriodActivities(period.id, daySchedule.date);
      } catch (error) {
        Alert.alert('Error', 'Failed to load period activities');
      } finally {
        setLoading(false);
      }
    }
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
      <View style={[
        styles.calendarContainer,
        calendarMinimized && styles.calendarMinimized
      ]}>
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
          {calendarMinimized && (
            <TouchableOpacity 
              onPress={() => {
                setCalendarMinimized(false);
                setExpandedPeriod(null);
              }}
              style={styles.expandButton}
            >
              <Text style={styles.expandIcon}>⬇</Text>
            </TouchableOpacity>
          )}
        </View>

        {!calendarMinimized && (
          <>
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
                    onPress={() => handleDateSelection(item.date)}
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
          </>
        )}

        {calendarMinimized && (
          <View style={styles.minimizedCalendarInfo}>
            <Text style={styles.selectedDateDisplay}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderInlinePeriodEditor = (period, daySchedule) => {
    const periodKey = `${period.id}-${daySchedule.date}`;
    const isExpanded = expandedPeriod === periodKey;

    if (!isExpanded) return null;

    return (
      <View style={styles.inlineEditorContainer}>
        <View style={styles.inlineEditorHeader}>
          <Text style={styles.inlineEditorTitle}>
            Period Activities: {period.subject_name}
          </Text>
          <TouchableOpacity 
            onPress={() => setExpandedPeriod(null)}
            style={styles.closeInlineButton}
          >
            <Text style={styles.closeInlineIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.inlineEditorContent} nestedScrollEnabled={true}>
          {/* Existing Activities */}
          <View style={styles.activitiesSection}>
            <Text style={styles.activitiesSectionTitle}>Current Activities</Text>
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

          {/* Quick Action Buttons */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setShowTimeBasedModal(true);
              }}
            >
              <Text style={styles.quickActionIcon}>🕐</Text>
              <Text style={styles.quickActionText}>Time-Based Creator</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDaySchedule = () => {
    const selectedDateString = formatDateToString(selectedDate);
    const daySchedule = monthlySchedule.find(
      schedule => schedule.date === selectedDateString
    );

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <View style={styles.noScheduleContainer}>
          <Text style={styles.noScheduleText}>No schedule available for this date</Text>
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
          renderItem={({ item }) => {
            const periodKey = `${item.id}-${daySchedule.date}`;
            const isExpanded = expandedPeriod === periodKey;
            
            return (
              <View style={styles.periodCardContainer}>
                <TouchableOpacity
                  style={[
                    styles.periodCard,
                    isExpanded && styles.expandedPeriodCard
                  ]}
                  onPress={() => handlePeriodClick(item, daySchedule)}
                >
                  <View style={{ flexDirection: 'column' }}>
                    <View style={styles.periodTime && { alignItems: 'center', flexDirection: 'row' }}>
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
                    <Text style={[
                      styles.expandIndicator,
                      isExpanded && styles.expandIndicatorRotated
                    ]}>
                      ▼
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Inline Period Editor */}
                {renderInlinePeriodEditor(item, daySchedule)}
              </View>
            );
          }}
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

      {/* Section Selector */}
      <View style={styles.sectionSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContentContainer}
        >
          {sections.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionTab,
                activeSection === section.id && styles.activeSectionTab
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Text style={[
                styles.sectionTabText,
                activeSection === section.id && styles.activeSectionTabText
              ]}>
                Section {section.section_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        periodActivities={periodActivities}
        onActivityCreated={() => {
          setShowTimeBasedModal(false);
          if (selectedPeriod) {
            fetchPeriodActivities(selectedPeriod.id, selectedPeriod.date);
          }
          fetchMonthlySchedule();
        }}
      />
    </SafeAreaView>
  );
};

export default CoordinatorAcademicSchedule;