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
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import { API_URL } from '../../../../utils/env';
import styles from './AcademicScheduleSty';
import TimeBasedActivityCreator from '../../../../components/Coordinator/TimeBasedActivityCreator';

const CoordinatorAcademicSchedule = ({ navigation, route }) => {
  const { activeGrade } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlySchedule, setMonthlySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimeBasedModal, setShowTimeBasedModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodActivities, setPeriodActivities] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [sections, setSections] = useState([]);

  // New state for inline editing
  const [expandedPeriod, setExpandedPeriod] = useState(null); // Stores a key like "periodId-dateString"
  const [calendarMinimized, setCalendarMinimized] = useState(false);

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
          // Set the first section as active by default, or remember previous
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
    setLoading(true); // Indicate loading when fetching schedule
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/monthly/${activeGrade}/${activeSection}/${month}/${year}`
      );

      const result = await response.json();
      if (result.success) {
        setMonthlySchedule(result.data);
      } else {
        setMonthlySchedule([]);
      }
    } catch (error) {
      console.error('Error fetching monthly schedule:', error);
      setMonthlySchedule([]);
    } finally {
      setLoading(false); // Done loading schedule
    }
  };

  const fetchPeriodActivities = async (periodId, date) => {
    setPeriodActivities([]); // Clear previous activities while loading new ones
    setLoading(true); // Indicate loading when fetching activities
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
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch activities.');
      }
    } catch (error) {
      console.error('Error fetching period activities:', error);
      setPeriodActivities([]);
      Alert.alert('Error', 'Failed to fetch activities.');
    } finally {
      setLoading(false); // Done loading activities
    }
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
        'This will create student wise schedules from daily templates for the next 7 days. Continue?',
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
                const response = await fetch(`${API_URL}/api/coordinator/generate-student-wise-schedules-manual`, {
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
      if (selectedPeriod && expandedPeriod) { // If an inline editor is open, refresh its activities too
        await fetchPeriodActivities(selectedPeriod.id, selectedPeriod.date);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, activeGrade, selectedPeriod, expandedPeriod]);

  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
    setCalendarMinimized(true); // Minimize calendar on month change
    setExpandedPeriod(null); // Close any expanded period
  };

  // Handle date selection - minimize calendar
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setCalendarMinimized(true);
    setExpandedPeriod(null); // Close any expanded period when date changes
  };

  // Handle period card click - expand inline
  const handlePeriodClick = async (period, daySchedule) => {
    const periodKey = `${period.id}-${formatDateToString(new Date(daySchedule.date))}`; // Ensure date is formatted consistently

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
      try {
        await fetchPeriodActivities(period.id, daySchedule.date);
      } catch (error) {
        Alert.alert('Error', 'Failed to load period activities');
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
            {/* <Icon name="chevron-left" size={28} color={styles.chevronIcon.color} /> */}
            <Text style={styles.chevronIcon}>{"◀️"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            {/* <Icon name="chevron-right" size={28} color={styles.chevronIcon.color} /> */}
            <Text style={styles.chevronIcon}>{"▶️"}</Text>
          </TouchableOpacity>
          {calendarMinimized && (
            <TouchableOpacity
              onPress={() => {
                setCalendarMinimized(false);
                setExpandedPeriod(null);
              }}
              style={styles.expandButton}
            >
              {/* <Icon name="chevron-down" size={16} color={styles.expandIcon.color} /> */}
              <Text style={styles.expandIcon}>{"⬇️"}</Text>
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
              scrollEnabled={false}
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

  const renderDaySchedule = () => {
    const selectedDateString = formatDateToString(selectedDate);
    const daySchedule = monthlySchedule.find(
      schedule => schedule.date === selectedDateString
    );

    if (!daySchedule || daySchedule.periods.length === 0) {
      return (
        <View style={styles.noScheduleContainer}>
          <Text style={styles.noScheduleText}>No schedule available for this date.</Text>
          <Text style={styles.noScheduleSubtext}>Tap "Generate" to create schedules from templates, or switch to a date with a pre-existing schedule.</Text>
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

        {daySchedule.periods.map((item) => {
          const periodKey = `${item.id}-${daySchedule.date}`;
          const isExpanded = expandedPeriod === periodKey;

          return (
            <View key={item.id} style={styles.periodCardContainer}>
              <TouchableOpacity
                style={[
                  styles.periodCard,
                  isExpanded && styles.expandedPeriodCard
                ]}
                onPress={() => handlePeriodClick(item, daySchedule)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.periodTime}>
                    <Text style={styles.timeText}>{String(item.timeStart || '')}</Text>
                    <Text style={styles.timeSeparator}>-</Text>
                    <Text style={styles.timeText}>{String(item.timeEnd || '')}</Text>
                  </View>

                  <View style={styles.periodInfo}>
                    <Text style={styles.subjectName}>{String(item.subject_name || '')}</Text>
                    <Text style={styles.venueText}>{String(item.venue_name || '')}</Text>
                    <Text style={styles.sectionText}>Section {String(item.section_name || '')}</Text>
                  </View>
                </View>

                <View style={styles.periodActions}>
                  {/* <Icon
                    name="chevron-down"
                    size={22}
                    color={styles.expandIndicator.color}
                    style={isExpanded && styles.expandIndicatorRotated}
                  /> */}
                  <Text style={isExpanded && styles.expandIndicatorRotated}>{"⬇️"}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.periodEditorContentContainer}>
                  <View style={styles.inlineEditorHeader}>
                    <Text style={styles.inlineEditorTitle}>
                      Period Activities: {String(item.subject_name || '')}
                    </Text>
                    {/* <TouchableOpacity
                      onPress={() => {
                        setExpandedPeriod(null);
                        setSelectedPeriod(null);
                      }}
                      style={styles.closeInlineButton}
                    >
                      <Icon name="close-circle" size={24} color={styles.closeInlineIcon.color} />
                      <Text style={styles.closeInlineIcon}>{"❌"}</Text>
                    </TouchableOpacity> */}
                  </View>

                  <ScrollView
                    style={styles.inlineEditorScrollContent}
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <View style={styles.activitiesSection}>
                      <Text style={styles.activitiesSectionTitle}>Current Activities</Text>
                      {periodActivities.length === 0 ? (
                        loading ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <Text style={styles.noActivitiesText}>No activities created yet</Text>
                        )
                      ) : (
                        <>
                          {periodActivities.map((activity) => (
                            <View key={activity.id} style={styles.activityItem}>
                              <View style={styles.activityHeader}>
                                <Text style={styles.activityType}>{String(activity.activity_type || 'Unknown')}</Text>
                                <Text style={styles.activityDuration}>{String(activity.start_time || '')} - {String(activity.end_time || '')}</Text>
                                {activity.duration && <Text style={styles.activityDuration}>{String(activity.duration)} min</Text>}
                              </View>
                              {activity.batch_number ? <Text style={styles.activityBatch}>Batch {String(activity.batch_number)}</Text> : null}
                              {activity.mentor_name ? <Text style={styles.activityMentor}>Mentor: {String(activity.mentor_name)}</Text> : null}
                              {/* Using 'item' for venue_name if needed, assuming activity doesn't have it directly */}
                              {item.venue_name ? <Text style={styles.venueText}>Venue: {String(item.venue_name)}</Text> : null}
                              {activity.topic_name ? (
                                <Text style={styles.activityTopic}>
                                  Topic: {activity.topic_hierarchy_path && activity.topic_hierarchy_path !== null
                                    ? `${String(activity.topic_name || '')} (${String(activity.topic_hierarchy_path || '')})`
                                    : String(activity.topic_name || '')}
                                </Text>
                              ) : null}
                              {activity.has_assessment ? (
                                <Text style={styles.assessmentBadge}>
                                  {String(activity.assessment_type || 'Assessment')} ({String(activity.total_marks || 0)} marks)
                                </Text>
                              ) : null}
                            </View>
                          ))}
                        </>
                      )}
                    </View>

                    <View style={styles.quickActionsContainer}>
                      <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                          setShowTimeBasedModal(true);
                        }}
                      >
                        {/* <Icon name="clock" size={16} color={styles.quickActionIcon.color} style={styles.quickActionIcon} /> */}
                        <Text style={styles.quickActionIcon}>{"🕒"}</Text>
                        <Text style={styles.quickActionText}>Time-Based Creator</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </View>
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
                Section {String(section.section_name || '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && (!monthlySchedule.length && !refreshing) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          scrollEnabled={!expandedPeriod}
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