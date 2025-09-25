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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './AssessmentQueueStyles';
import { API_URL } from '../../../utils/env.js';

const AssessmentQueue = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessmentRequests, setAssessmentRequests] = useState([]);
  const [availableAssessments, setAvailableAssessments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('available'); // available, requested, completed
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const phone = JSON.parse(storedPhone);

      // Fetch assessment queue data
      const response = await apiFetch(`/student/assessments/queue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        const result = response;
        setAssessmentRequests(result.requests || []);
        setAvailableAssessments(result.available || []);
      } else {
        Alert.alert('Error', 'Failed to load assessment data');
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      Alert.alert('Error', 'Failed to load assessment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssessmentData();
  };

  const handleRequestAssessment = async (assessment) => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const phone = JSON.parse(storedPhone);

      const response = await apiFetch(`/student/assessment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: assessment.topic_id,
          subject_id: assessment.subject_id,
          assessment_type: assessment.assessment_type,
        }),
      });

      const result = response;
      
      if (response) {
        Alert.alert('Success', 'Assessment request submitted successfully');
        setRequestModalVisible(false);
        fetchAssessmentData(); // Refresh data
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
      case 'Requested': return '#FF9800';
      case 'Scheduled': return '#2196F3';
      case 'In_Progress': return '#9C27B0';
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Requested': return 'schedule';
      case 'Scheduled': return 'event';
      case 'In_Progress': return 'timer';
      case 'Completed': return 'check-circle';
      case 'Cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const getAssessmentTypeColor = (type) => {
    switch (type) {
      case 'Topic_Assessment': return '#4CAF50';
      case 'Level_Assessment': return '#2196F3';
      case 'Final_Assessment': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const renderAvailableAssessment = (assessment) => (
    <View key={`${assessment.topic_id}_${assessment.assessment_type}`} style={styles.assessmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon name="assignment" size={20} color="#2196F3" />
          <View style={styles.titleContainer}>
            <Text style={styles.assessmentTitle}>{assessment.topic_name}</Text>
            <Text style={styles.subjectName}>{assessment.subject_name}</Text>
          </View>
        </View>
        
        <View style={[styles.typeIndicator, { backgroundColor: getAssessmentTypeColor(assessment.assessment_type) }]}>
          <Text style={styles.typeText}>{assessment.assessment_type.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Prerequisites</Text>
            <Text style={[styles.detailValue, { color: assessment.prerequisites_met ? '#4CAF50' : '#F44336' }]}>
              {assessment.prerequisites_met ? 'Met' : 'Not Met'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Pass Score</Text>
            <Text style={styles.detailValue}>{assessment.pass_percentage}%</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Attempts Left</Text>
            <Text style={styles.detailValue}>{assessment.attempts_remaining || 'N/A'}</Text>
          </View>
        </View>

        {assessment.description && (
          <Text style={styles.description}>{assessment.description}</Text>
        )}
      </View>

      <View style={styles.cardActions}>
        {assessment.prerequisites_met ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.requestButton]}
            onPress={() => {
              setSelectedAssessment(assessment);
              setRequestModalVisible(true);
            }}
          >
            <Icon name="send" size={16} color="white" />
            <Text style={styles.buttonText}>Request Assessment</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.actionButton, styles.disabledButton]}>
            <Icon name="block" size={16} color="#999" />
            <Text style={[styles.buttonText, { color: '#999' }]}>Prerequisites Required</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderRequestedAssessment = (request) => (
    <View key={request.id} style={styles.assessmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon
            name={getStatusIcon(request.status)}
            size={20}
            color={getStatusColor(request.status)}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.assessmentTitle}>{request.topic_name}</Text>
            <Text style={styles.subjectName}>{request.subject_name}</Text>
          </View>
        </View>
        
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{request.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Requested</Text>
            <Text style={styles.detailValue}>{new Date(request.created_at).toLocaleDateString()}</Text>
          </View>
          
          {request.scheduled_date && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Scheduled</Text>
              <Text style={styles.detailValue}>
                {new Date(request.scheduled_date).toLocaleDateString()}
                {request.scheduled_time && ` ${request.scheduled_time}`}
              </Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={styles.detailValue}>{request.priority_level || 1}</Text>
          </View>
        </View>

        {request.venue_name && (
          <View style={styles.venueInfo}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.venueText}>{request.venue_name}</Text>
          </View>
        )}

        {request.mentor_name && (
          <View style={styles.mentorInfo}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.mentorText}>Mentor: {request.mentor_name}</Text>
          </View>
        )}
      </View>

      {request.status === 'Requested' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {/* Handle cancel request */}}
          >
            <Icon name="cancel" size={16} color="white" />
            <Text style={styles.buttonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading assessments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getTabData = () => {
    switch (selectedTab) {
      case 'available':
        return availableAssessments;
      case 'requested':
        return assessmentRequests.filter(req => ['Requested', 'Scheduled'].includes(req.status));
      case 'completed':
        return assessmentRequests.filter(req => ['Completed', 'Cancelled'].includes(req.status));
      default:
        return [];
    }
  };

  const tabData = getTabData();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Assessment Queue</Text>
          <Text style={styles.headerSubtitle}>Request and track assessments</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['available', 'requested', 'completed'].map(tab => (
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

      {/* Assessment List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {tabData.length > 0 ? (
          tabData.map(item => {
            if (selectedTab === 'available') {
              return renderAvailableAssessment(item);
            } else {
              return renderRequestedAssessment(item);
            }
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {selectedTab === 'available' 
                ? 'No assessments available at this time' 
                : `No ${selectedTab} assessments found`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Request Confirmation Modal */}
      <Modal
        visible={requestModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Assessment</Text>
            <Text style={styles.modalSubtitle}>{selectedAssessment?.topic_name}</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to request this {selectedAssessment?.assessment_type?.replace('_', ' ').toLowerCase()}?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRequestModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleRequestAssessment(selectedAssessment)}
              >
                <Text style={styles.confirmButtonText}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AssessmentQueue;
