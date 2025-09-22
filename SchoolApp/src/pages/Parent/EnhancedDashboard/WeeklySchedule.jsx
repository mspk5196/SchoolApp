import { apiFetch } from "../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './WeeklyScheduleStyles';
import { API_URL } from '../../../utils/env.js';

const WeeklySchedule = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(null);

  useEffect(() => {
    const weekStart = getWeekStart(selectedWeek);
    setCurrentWeekStart(weekStart);
    fetchWeeklySchedule(weekStart);
  }, [selectedWeek]);

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const fetchWeeklySchedule = async (weekStart) => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);
      const weekStartStr = formatDate(weekStart);

      const response = await apiFetch(`${API_URL}/student/schedule/weekly?weekStart=${weekStartStr}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setWeeklySchedule(result.schedule || {});
      } else {
        Alert.alert('Error', 'Failed to load weekly schedule');
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      Alert.alert('Error', 'Failed to load weekly schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeeklySchedule(currentWeekStart);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'Assessment': return '#F44336';
      case 'Academic_Material': return '#2196F3';
      case 'One_Member_Activity': return '#4CAF50';
      case 'Group_Activity': return '#FF9800';
      case 'Practical': return '#9C27B0';
      case 'Discussion': return '#00BCD4';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In_Progress': return '#2196F3';
      case 'Scheduled': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const renderActivityCard = (activity, dayDate) => {
    const isToday = formatDate(new Date()) === formatDate(dayDate);
    const isPast = dayDate < new Date() && !isToday;

    return (
      <View 
        key={activity.id} 
        style={[
          styles.activityCard,
          { borderLeftColor: getActivityColor(activity.activity_type) },
          isPast && styles.pastActivity
        ]}
      >
        <View style={styles.activityHeader}>
          <Text style={styles.activityTime}>
            {activity.start_time} - {activity.end_time}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(activity.status) }]}>
            <Text style={styles.statusText}>{activity.status}</Text>
          </View>
        </View>

        <Text style={styles.subjectName}>{activity.subject_name}</Text>
        <Text style={styles.activityName}>{activity.activity_name}</Text>
        
        {activity.topic_name && (
          <Text style={styles.topicName}>Topic: {activity.topic_name}</Text>
        )}

        <View style={styles.activityDetails}>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.detailText}>{activity.venue_name}</Text>
          </View>
          
          {activity.mentor_name && (
            <View style={styles.detailItem}>
              <Icon name="person" size={14} color="#666" />
              <Text style={styles.detailText}>{activity.mentor_name}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Icon name="schedule" size={14} color="#666" />
            <Text style={styles.detailText}>{activity.duration} min</Text>
          </View>
        </View>

        {activity.activity_type === 'Assessment' && activity.assessment_weightage && (
          <View style={styles.assessmentInfo}>
            <Icon name="assignment" size={16} color="#F44336" />
            <Text style={styles.assessmentText}>
              Assessment - {activity.assessment_weightage}% weightage
            </Text>
          </View>
        )}

        {activity.activity_instructions && (
          <Text style={styles.instructions} numberOfLines={2}>
            {activity.activity_instructions}
          </Text>
        )}
      </View>
    );
  };

  const renderDaySchedule = (dayDate, daySchedule) => {
    const dayName = getDayName(dayDate);
    const isToday = formatDate(new Date()) === formatDate(dayDate);
    const formattedDate = dayDate.toLocaleDateString();

    return (
      <View key={formatDate(dayDate)} style={styles.dayContainer}>
        <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
          <Text style={[styles.dayName, isToday && styles.todayText]}>{dayName}</Text>
          <Text style={[styles.dayDate, isToday && styles.todayText]}>{formattedDate}</Text>
        </View>

        {daySchedule && daySchedule.length > 0 ? (
          daySchedule.map(activity => renderActivityCard(activity, dayDate))
        ) : (
          <View style={styles.noActivitiesContainer}>
            <Icon name="event-busy" size={30} color="#ccc" />
            <Text style={styles.noActivitiesText}>No activities scheduled</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading weekly schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    weekDays.push(day);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Weekly Schedule</Text>
          <Text style={styles.headerSubtitle}>
            Week of {currentWeekStart?.toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek(-1)}
        >
          <Icon name="chevron-left" size={24} color="#2196F3" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.todayButton}
          onPress={() => setSelectedWeek(new Date())}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek(1)}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <Icon name="chevron-right" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Assessment</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Academic</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Individual</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Group</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.legendText}>Practical</Text>
          </View>
        </ScrollView>
      </View>

      {/* Weekly Schedule */}
      <ScrollView
        style={styles.scheduleContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {weekDays.map(day => 
          renderDaySchedule(day, weeklySchedule[formatDate(day)])
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeeklySchedule;
