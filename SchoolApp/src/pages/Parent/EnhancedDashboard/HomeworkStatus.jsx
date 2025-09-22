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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './HomeworkStatusStyles';
import { API_URL } from '../../../utils/env.js';

const HomeworkStatus = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeworkList, setHomeworkList] = useState([]);
  const [selectedTab, setSelectedTab] = useState('pending'); // pending, submitted, completed
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');

  useEffect(() => {
    fetchHomeworkData();
  }, []);

  const fetchHomeworkData = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);

      // Fetch all homework data
      const response = await apiFetch(`${API_URL}/student/homework/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setHomeworkList(result.homework || []);
      } else {
        Alert.alert('Error', 'Failed to load homework data');
      }
    } catch (error) {
      console.error('Error fetching homework data:', error);
      Alert.alert('Error', 'Failed to load homework data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHomeworkData();
  };

  const handleSubmitHomework = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`${API_URL}/student/homework/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phone}`,
        },
        body: JSON.stringify({
          homework_id: selectedHomework.id,
          submission_notes: submissionNotes,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Homework submitted successfully');
        setSubmitModalVisible(false);
        setSubmissionNotes('');
        fetchHomeworkData(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Failed to submit homework');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      Alert.alert('Error', 'Failed to submit homework');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return '#FF9800';
      case 'Submitted': return '#2196F3';
      case 'Late_Submitted': return '#FF5722';
      case 'Missing': return '#F44336';
      case 'Marked_Complete': return '#4CAF50';
      case 'Marked_Incomplete': return '#F44336';
      case 'Excused': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Assigned': return 'assignment';
      case 'Submitted': return 'assignment-turned-in';
      case 'Late_Submitted': return 'assignment-late';
      case 'Missing': return 'assignment-return';
      case 'Marked_Complete': return 'check-circle';
      case 'Marked_Incomplete': return 'error';
      case 'Excused': return 'assignment-turned-in';
      default: return 'assignment';
    }
  };

  const getPriorityColor = (daysLeft) => {
    if (daysLeft < 0) return '#F44336'; // Overdue
    if (daysLeft <= 1) return '#FF5722'; // Due tomorrow
    if (daysLeft <= 3) return '#FF9800'; // Due soon
    return '#4CAF50'; // Good time
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterHomework = () => {
    switch (selectedTab) {
      case 'pending':
        return homeworkList.filter(hw => hw.status === 'Assigned');
      case 'submitted':
        return homeworkList.filter(hw => ['Submitted', 'Late_Submitted'].includes(hw.status));
      case 'completed':
        return homeworkList.filter(hw => ['Marked_Complete', 'Marked_Incomplete'].includes(hw.status));
      default:
        return homeworkList;
    }
  };

  const renderHomeworkCard = (homework) => {
    const daysLeft = getDaysLeft(homework.due_date);
    const canSubmit = homework.status === 'Assigned' && homework.attempts_used < homework.max_attempts;

    return (
      <View key={homework.id} style={styles.homeworkCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Icon
              name={getStatusIcon(homework.status)}
              size={20}
              color={getStatusColor(homework.status)}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.homeworkTitle}>{homework.homework_title}</Text>
              <Text style={styles.subjectName}>{homework.subject_name}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(daysLeft) }]}>
              <Text style={styles.daysText}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d late` : `${daysLeft}d left`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.description}>{homework.description}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Assigned</Text>
              <Text style={styles.detailValue}>{new Date(homework.assigned_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailValue}>{new Date(homework.due_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{homework.estimated_duration}min</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: getStatusColor(homework.status) }]}>
              {homework.status.replace('_', ' ')}
            </Text>
            <Text style={styles.attemptsText}>
              Attempts: {homework.attempts_used}/{homework.max_attempts}
            </Text>
          </View>

          {homework.mentor_feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Mentor Feedback:</Text>
              <Text style={styles.feedbackText}>{homework.mentor_feedback}</Text>
              {homework.mentor_score && (
                <Text style={styles.scoreText}>Score: {homework.mentor_score}/100</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {homework.file_url && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => {/* Handle download */}}
            >
              <Icon name="download" size={16} color="white" />
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
          )}
          
          {canSubmit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.submitButton]}
              onPress={() => {
                setSelectedHomework(homework);
                setSubmitModalVisible(true);
              }}
            >
              <Icon name="assignment-turned-in" size={16} color="white" />
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading homework...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredHomework = filterHomework();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Homework Status</Text>
          <Text style={styles.headerSubtitle}>Track your assignments</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['pending', 'submitted', 'completed'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Homework List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredHomework.length > 0 ? (
          filteredHomework.map(homework => renderHomeworkCard(homework))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No homework found for this category</Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Modal */}
      <Modal
        visible={submitModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Homework</Text>
            <Text style={styles.modalSubtitle}>{selectedHomework?.homework_title}</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Add submission notes (optional)"
              multiline
              numberOfLines={4}
              value={submissionNotes}
              onChangeText={setSubmissionNotes}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSubmitModalVisible(false);
                  setSubmissionNotes('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitHomework}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeworkStatus;
