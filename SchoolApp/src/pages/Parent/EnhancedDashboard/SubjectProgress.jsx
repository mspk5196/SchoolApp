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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './SubjectProgressStyles';
import { API_URL } from '../../../utils/env.js';

const SubjectProgress = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjectData, setSubjectData] = useState(null);
  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  useEffect(() => {
    fetchSubjectProgress();
  }, [subjectId]);

  const fetchSubjectProgress = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`/student/progress/${subjectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        const result = response;
        setSubjectData(result.subjectData);
        setTopicHierarchy(result.topicHierarchy);
      } else {
        Alert.alert('Error', 'Failed to load subject progress');
      }
    } catch (error) {
      console.error('Error fetching subject progress:', error);
      Alert.alert('Error', 'Failed to load subject progress');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubjectProgress();
  };

  const toggleTopicExpansion = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleRequestAssessment = async (topicId) => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`/student/assessment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: topicId,
          subject_id: subjectId,
          assessment_type: 'Topic_Assessment'
        }),
      });

      const result = response;
      
      if (response) {
        Alert.alert('Success', 'Assessment request submitted successfully');
        fetchSubjectProgress(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Failed to submit assessment request');
      }
    } catch (error) {
      console.error('Error requesting assessment:', error);
      Alert.alert('Error', 'Failed to submit assessment request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#2196F3';
      case 'Failed': return '#F44336';
      case 'Not Started': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return 'check-circle';
      case 'In Progress': return 'schedule';
      case 'Failed': return 'error';
      case 'Not Started': return 'radio-button-unchecked';
      default: return 'radio-button-unchecked';
    }
  };

  const renderTopic = (topic, level = 0) => {
    const hasChildren = topic.children && topic.children.length > 0;
    const isExpanded = expandedTopics.has(topic.id);
    const indentStyle = { marginLeft: level * 20 };

    return (
      <View key={topic.id} style={[styles.topicContainer, indentStyle]}>
        <TouchableOpacity
          style={styles.topicHeader}
          onPress={() => hasChildren && toggleTopicExpansion(topic.id)}
        >
          <View style={styles.topicLeft}>
            {hasChildren && (
              <Icon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={20}
                color="#666"
                style={styles.expandIcon}
              />
            )}
            <Icon
              name={getStatusIcon(topic.status)}
              size={20}
              color={getStatusColor(topic.status)}
              style={styles.statusIcon}
            />
            <View style={styles.topicInfo}>
              <Text style={styles.topicName}>{topic.topic_name}</Text>
              <Text style={styles.topicCode}>{topic.topic_code}</Text>
            </View>
          </View>
          
          <View style={styles.topicRight}>
            {topic.completion_percentage !== undefined && (
              <View style={styles.progressContainer}>
                <Progress.Circle
                  progress={topic.completion_percentage / 100}
                  size={30}
                  thickness={3}
                  color={getStatusColor(topic.status)}
                  unfilledColor="#E0E0E0"
                  borderWidth={0}
                  showsText={false}
                />
                <Text style={styles.progressText}>{topic.completion_percentage}%</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Topic Details */}
        {topic.is_bottom_level && (
          <View style={styles.topicDetails}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: getStatusColor(topic.status) }]}>
                  {topic.status}
                </Text>
              </View>
              
              {topic.last_assessment_score && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Score</Text>
                  <Text style={styles.detailValue}>{topic.last_assessment_score}%</Text>
                </View>
              )}
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Attempts</Text>
                <Text style={styles.detailValue}>{topic.attempts_count || 0}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {topic.has_materials && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.materialsButton]}
                  onPress={() => navigation.navigate('TopicMaterials', { topicId: topic.id })}
                >
                  <Icon name="library-books" size={16} color="white" />
                  <Text style={styles.buttonText}>Materials</Text>
                </TouchableOpacity>
              )}
              
              {topic.has_homework && topic.homework_status !== 'Completed' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.homeworkButton]}
                  onPress={() => navigation.navigate('TopicHomework', { topicId: topic.id })}
                >
                  <Icon name="assignment" size={16} color="white" />
                  <Text style={styles.buttonText}>Homework</Text>
                </TouchableOpacity>
              )}
              
              {topic.can_take_assessment && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.assessmentButton]}
                  onPress={() => handleRequestAssessment(topic.id)}
                >
                  <Icon name="assignment-turned-in" size={16} color="white" />
                  <Text style={styles.buttonText}>Request Test</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {topic.children.map(child => renderTopic(child, level + 1))}
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
          <Text style={styles.loadingText}>Loading subject progress...</Text>
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
          <Text style={styles.headerTitle}>{subjectData?.subject_name || 'Subject'}</Text>
          <Text style={styles.headerSubtitle}>Progress Tracking</Text>
        </View>
      </View>

      {/* Subject Summary */}
      {subjectData && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{subjectData.overall_progress?.toFixed(1) || 0}%</Text>
              <Text style={styles.summaryLabel}>Overall Progress</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{subjectData.topics_completed || 0}</Text>
              <Text style={styles.summaryLabel}>Topics Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{subjectData.current_batch || 'N/A'}</Text>
              <Text style={styles.summaryLabel}>Current Batch</Text>
            </View>
          </View>
          
          <Progress.Bar
            progress={(subjectData.overall_progress || 0) / 100}
            width={null}
            height={8}
            color="#4CAF50"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            style={styles.progressBar}
          />
        </View>
      )}

      {/* Topic Hierarchy */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.hierarchyContainer}>
          <Text style={styles.sectionTitle}>Topic Hierarchy</Text>
          {topicHierarchy.map(topic => renderTopic(topic))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectProgress;
