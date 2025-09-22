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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import styles from './EnhancedStudentDashboardStyles';
import { API_URL } from '../../../utils/env.js';

const { width } = Dimensions.get('window');

const EnhancedStudentDashboard = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState(null);

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const activeUser = await AsyncStorage.getItem('activeUser');
      
      if (!storedPhone || !activeUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);
      
      // Fetch enhanced dashboard data
      const dashboardResponse = await apiFetch(`${API_URL}/student/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult);
        setSubjectProgress(dashboardResult.subjectProgress || []);
      }

      // Fetch today's schedule
      const scheduleResponse = await apiFetch(`${API_URL}/student/schedule/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (scheduleResponse.ok) {
        const scheduleResult = await scheduleResponse.json();
        setTodaySchedule(scheduleResult.schedule || []);
      }

      // Fetch performance analytics
      const analyticsResponse = await apiFetch(`${API_URL}/student/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        setPerformanceAnalytics(analyticsResult);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleRequestAssessment = async (topicId, subjectId) => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`${API_URL}/student/assessment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
        body: JSON.stringify({
          topic_id: topicId,
          subject_id: subjectId,
          assessment_type: 'Topic_Assessment'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Assessment request submitted successfully');
        fetchDashboardData(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Failed to submit assessment request');
      }
    } catch (error) {
      console.error('Error requesting assessment:', error);
      Alert.alert('Error', 'Failed to submit assessment request');
    }
  };

  const renderSubjectCard = (subject) => (
    <View key={subject.subject_id} style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectName}>{subject.subject_name}</Text>
        <View style={styles.batchInfo}>
          <Text style={styles.batchText}>Batch: {subject.current_batch}</Text>
          <View style={[styles.batchLevelIndicator, { backgroundColor: getBatchColor(subject.batch_level) }]}>
            <Text style={styles.batchLevel}>{subject.batch_level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <Progress.Bar
          progress={subject.overall_progress / 100}
          width={width - 80}
          height={8}
          color="#4CAF50"
          unfilledColor="#E0E0E0"
          borderWidth={0}
        />
        <Text style={styles.progressText}>{subject.overall_progress.toFixed(1)}%</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subject.topics_completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subject.topics_in_progress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subject.pending_homework}</Text>
          <Text style={styles.statLabel}>Pending HW</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => navigation.navigate('SubjectProgress', { subjectId: subject.subject_id })}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScheduleItem = (item, index) => (
    <View key={index} style={styles.scheduleItem}>
      <View style={styles.timeSlot}>
        <Text style={styles.timeText}>{item.start_time}</Text>
        <Text style={styles.timeText}>-</Text>
        <Text style={styles.timeText}>{item.end_time}</Text>
      </View>
      <View style={styles.scheduleContent}>
        <Text style={styles.subjectName}>{item.subject_name}</Text>
        <Text style={styles.activityName}>{item.activity_name}</Text>
        <Text style={styles.venueText}>{item.venue_name}</Text>
      </View>
      <View style={styles.scheduleStatus}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
    </View>
  );

  const getBatchColor = (level) => {
    switch (level) {
      case 1: return '#4CAF50'; // Green for top batch
      case 2: return '#2196F3'; // Blue for second batch
      case 3: return '#FF9800'; // Orange for third batch
      case 4: return '#F44336'; // Red for bottom batch
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Progress Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track your learning journey</Text>
        </View>

        {/* Performance Summary */}
        {performanceAnalytics && (
          <View style={styles.performanceSummary}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{performanceAnalytics.overall_grade || 'N/A'}</Text>
                <Text style={styles.metricLabel}>Overall Grade</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{performanceAnalytics.homework_completion_rate?.toFixed(1) || 0}%</Text>
                <Text style={styles.metricLabel}>Homework Rate</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{performanceAnalytics.assessment_success_rate?.toFixed(1) || 0}%</Text>
                <Text style={styles.metricLabel}>Assessment Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WeeklySchedule')}>
              <Text style={styles.viewAllText}>View Week</Text>
            </TouchableOpacity>
          </View>
          {todaySchedule.length > 0 ? (
            todaySchedule.map((item, index) => renderScheduleItem(item, index))
          ) : (
            <Text style={styles.emptyText}>No classes scheduled for today</Text>
          )}
        </View>

        {/* Subject Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          {subjectProgress.map(subject => renderSubjectCard(subject))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('HomeworkStatus')}
            >
              <Text style={styles.actionTitle}>Homework</Text>
              <Text style={styles.actionSubtitle}>View pending assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AssessmentQueue')}
            >
              <Text style={styles.actionTitle}>Assessments</Text>
              <Text style={styles.actionSubtitle}>Request assessments</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('ProgressAnalytics')}
            >
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionSubtitle}>Detailed progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('BatchHistory')}
            >
              <Text style={styles.actionTitle}>Batch History</Text>
              <Text style={styles.actionSubtitle}>View batch changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EnhancedStudentDashboard;
