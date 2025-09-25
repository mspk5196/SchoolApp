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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import styles from './ProgressAnalyticsStyles';
import { API_URL } from '../../../utils/env.js';

const { width } = Dimensions.get('window');

const ProgressAnalytics = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // week, month, semester
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe, selectedSubject]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`/student/analytics?timeframe=${selectedTimeframe}&subject=${selectedSubject}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        const result = response;
        setAnalyticsData(result);
      } else {
        Alert.alert('Error', 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': return '#4CAF50';
      case 'B+': case 'B': return '#8BC34A';
      case 'C+': case 'C': return '#FF9800';
      case 'D+': case 'D': return '#FF5722';
      case 'F': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  const renderPerformanceOverview = () => {
    if (!analyticsData?.performance_overview) return null;

    const overview = analyticsData.performance_overview;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={[styles.overviewValue, { color: getGradeColor(overview.overall_grade) }]}>
              {overview.overall_grade || 'N/A'}
            </Text>
            <Text style={styles.overviewLabel}>Overall Grade</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>{overview.gpa?.toFixed(2) || 'N/A'}</Text>
            <Text style={styles.overviewLabel}>GPA</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>{overview.class_rank || 'N/A'}</Text>
            <Text style={styles.overviewLabel}>Class Rank</Text>
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>{overview.total_subjects || 0}</Text>
            <Text style={styles.overviewLabel}>Subjects</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProgressTrend = () => {
    if (!analyticsData?.progress_trend?.length) return null;

    const data = {
      labels: analyticsData.progress_trend.map(item => item.period),
      datasets: [
        {
          data: analyticsData.progress_trend.map(item => item.progress_percentage),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Trend</Text>
        <LineChart
          data={data}
          width={width - 50}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderSubjectPerformance = () => {
    if (!analyticsData?.subject_performance?.length) return null;

    const data = {
      labels: analyticsData.subject_performance.map(item => item.subject_name.substring(0, 8)),
      datasets: [
        {
          data: analyticsData.subject_performance.map(item => item.average_score),
        },
      ],
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        <BarChart
          data={data}
          width={width - 50}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisSuffix="%"
        />
      </View>
    );
  };

  const renderBatchHistory = () => {
    if (!analyticsData?.batch_history?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Movement History</Text>
        {analyticsData.batch_history.map((item, index) => (
          <View key={index} style={styles.batchHistoryItem}>
            <View style={styles.batchInfo}>
              <Text style={styles.subjectName}>{item.subject_name}</Text>
              <Text style={styles.batchMovement}>
                Batch {item.from_batch_level} → Batch {item.to_batch_level}
              </Text>
              <Text style={styles.movementDate}>{new Date(item.allocation_date).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.movementIndicator, { 
              backgroundColor: item.to_batch_level < item.from_batch_level ? '#4CAF50' : '#F44336' 
            }]}>
              <Icon 
                name={item.to_batch_level < item.from_batch_level ? 'trending-up' : 'trending-down'} 
                size={20} 
                color="white" 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAssessmentAnalytics = () => {
    if (!analyticsData?.assessment_analytics) return null;

    const analytics = analyticsData.assessment_analytics;

    const pieData = [
      {
        name: 'Passed',
        population: analytics.passed_count || 0,
        color: '#4CAF50',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: 'Failed',
        population: analytics.failed_count || 0,
        color: '#F44336',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: 'Pending',
        population: analytics.pending_count || 0,
        color: '#FF9800',
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assessment Analytics</Text>
        
        <View style={styles.analyticsStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.total_assessments || 0}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.success_rate?.toFixed(1) || 0}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.average_score?.toFixed(1) || 0}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        <PieChart
          data={pieData}
          width={width - 50}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    );
  };

  const renderHomeworkAnalytics = () => {
    if (!analyticsData?.homework_analytics) return null;

    const homework = analyticsData.homework_analytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Homework Analytics</Text>
        
        <View style={styles.analyticsStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homework.total_assigned || 0}</Text>
            <Text style={styles.statLabel}>Total Assigned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homework.completed_count || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homework.completion_rate?.toFixed(1) || 0}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
        </View>

        <View style={styles.homeworkBreakdown}>
          <View style={styles.breakdownItem}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.breakdownLabel}>On Time: {homework.on_time_count || 0}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.breakdownLabel}>Late: {homework.late_count || 0}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.breakdownLabel}>Missing: {homework.missing_count || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Progress Analytics</Text>
          <Text style={styles.headerSubtitle}>Detailed performance insights</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Timeframe:</Text>
          <View style={styles.filterOptions}>
            {['week', 'month', 'semester'].map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.filterOption, selectedTimeframe === option && styles.activeFilter]}
                onPress={() => setSelectedTimeframe(option)}
              >
                <Text style={[styles.filterText, selectedTimeframe === option && styles.activeFilterText]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Analytics Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderPerformanceOverview()}
        {renderProgressTrend()}
        {renderSubjectPerformance()}
        {renderAssessmentAnalytics()}
        {renderHomeworkAnalytics()}
        {renderBatchHistory()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressAnalytics;
