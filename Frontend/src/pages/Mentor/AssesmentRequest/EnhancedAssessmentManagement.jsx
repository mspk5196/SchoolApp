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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import styles from './AssessmentRequeststy.jsx';
import { API_URL } from '../../../utils/env.js';

const EnhancedAssessmentManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mentorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessmentRequests, setAssessmentRequests] = useState([]);
  const [scheduledAssessments, setScheduledAssessments] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'scheduled', 'history'
  const [mentorSubjects, setMentorSubjects] = useState([]);
  
  // Schedule Assessment Modal
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [assessmentDuration, setAssessmentDuration] = useState('60');
  const [maxMarks, setMaxMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('60');

  // Score Assessment Modal
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [studentScores, setStudentScores] = useState({});

  useEffect(() => {
    fetchMentorSubjects();
    fetchAssessmentRequests();
    fetchScheduledAssessments();
  }, []);

  const fetchMentorSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/mentor/getSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentor_id: mentorId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMentorSubjects(result.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching mentor subjects:', error);
    }
  };

  const fetchAssessmentRequests = async () => {
    try {
      if (mentorSubjects.length === 0) return;

      const promises = mentorSubjects.map(subject =>
        fetch(`${API_URL}/mentor/assessment/requests/${subject.grade_id}/${subject.subject_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const allRequests = results.flatMap(result => result.requests || []);
      setAssessmentRequests(allRequests);
    } catch (error) {
      console.error('Error fetching assessment requests:', error);
    }
  };

  const fetchScheduledAssessments = async () => {
    try {
      const response = await fetch(`${API_URL}/mentor/assessment/scheduled/${mentorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setScheduledAssessments(result.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled assessments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchAssessmentRequests(),
      fetchScheduledAssessments(),
    ]);
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setScheduleModalVisible(true);
  };

  const handleScheduleAssessment = async () => {
    try {
      if (!selectedDateTime || !assessmentDuration || !maxMarks || !passingMarks) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/mentor/assessment/approve/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentor_id: mentorId,
          scheduled_datetime: selectedDateTime.toISOString(),
          duration_minutes: parseInt(assessmentDuration),
          max_marks: parseInt(maxMarks),
          passing_marks: parseInt(passingMarks),
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Assessment scheduled successfully');
        setScheduleModalVisible(false);
        fetchAssessmentRequests();
        fetchScheduledAssessments();
      } else {
        Alert.alert('Error', result.message || 'Failed to schedule assessment');
      }
    } catch (error) {
      console.error('Error scheduling assessment:', error);
      Alert.alert('Error', 'Failed to schedule assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    // Initialize student scores if they don't exist
    const initialScores = {};
    assessment.students?.forEach(student => {
      initialScores[student.student_roll] = student.score || '';
    });
    setStudentScores(initialScores);
    setScoreModalVisible(true);
  };

  const handleSubmitScores = async () => {
    try {
      const scores = Object.entries(studentScores)
        .filter(([roll, score]) => score !== '')
        .map(([student_roll, score]) => ({
          student_roll,
          score: parseFloat(score),
        }));

      if (scores.length === 0) {
        Alert.alert('Error', 'Please enter at least one score');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/mentor/assessment/score/${selectedAssessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentor_id: mentorId,
          scores,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Scores submitted successfully');
        setScoreModalVisible(false);
        fetchScheduledAssessments();
      } else {
        Alert.alert('Error', result.message || 'Failed to submit scores');
      }
    } catch (error) {
      console.error('Error submitting scores:', error);
      Alert.alert('Error', 'Failed to submit scores');
    } finally {
      setLoading(false);
    }
  };

  const renderRequestCard = (request) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>{request.topic_name}</Text>
          <Text style={styles.requestSubtitle}>
            {request.subject_name} - {request.assessment_type}
          </Text>
          <Text style={styles.requestStudent}>
            Student: {request.student_name} ({request.student_roll})
          </Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApproveRequest(request)}
          >
            <Icon name="check-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.requestMeta}>
        <Text style={styles.metaText}>
          Requested: {new Date(request.created_at).toLocaleDateString()}
        </Text>
        <Text style={[styles.metaText, styles.statusText]}>
          Status: {request.status}
        </Text>
      </View>
    </View>
  );

  const renderScheduledCard = (assessment) => (
    <View key={assessment.id} style={styles.assessmentCard}>
      <View style={styles.assessmentHeader}>
        <View style={styles.assessmentInfo}>
          <Text style={styles.assessmentTitle}>{assessment.topic_name}</Text>
          <Text style={styles.assessmentSubtitle}>
            {assessment.subject_name} - {assessment.grade_name}
          </Text>
          <Text style={styles.assessmentTime}>
            {new Date(assessment.scheduled_datetime).toLocaleString()}
          </Text>
        </View>
        <View style={styles.assessmentActions}>
          {assessment.status === 'Scheduled' && (
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => handleScoreAssessment(assessment)}
            >
              <Icon name="grade" size={20} color="white" />
              <Text style={styles.buttonText}>Score</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.assessmentMeta}>
        <Text style={styles.metaText}>
          Duration: {assessment.duration_minutes} min
        </Text>
        <Text style={styles.metaText}>
          Max Marks: {assessment.max_marks}
        </Text>
        <Text style={[styles.metaText, styles.statusText]}>
          Status: {assessment.status}
        </Text>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Management</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Icon name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({assessmentRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
            Scheduled ({scheduledAssessments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'requests' && (
          <View style={styles.contentContainer}>
            {assessmentRequests.length > 0 ? (
              assessmentRequests.map(renderRequestCard)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="assignment" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'scheduled' && (
          <View style={styles.contentContainer}>
            {scheduledAssessments.length > 0 ? (
              scheduledAssessments.map(renderScheduledCard)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="schedule" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No scheduled assessments</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Schedule Assessment Modal */}
      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Assessment</Text>
              <TouchableOpacity
                onPress={() => setScheduleModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedRequest && (
                <>
                  <Text style={styles.modalSubtitle}>
                    Topic: {selectedRequest.topic_name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Student: {selectedRequest.student_name}
                  </Text>

                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <Icon name="schedule" size={20} color="#2196F3" />
                    <Text style={styles.datePickerText}>
                      {selectedDateTime.toLocaleString()}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={assessmentDuration}
                      onChangeText={setAssessmentDuration}
                      keyboardType="numeric"
                      placeholder="60"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Maximum Marks</Text>
                    <TextInput
                      style={styles.textInput}
                      value={maxMarks}
                      onChangeText={setMaxMarks}
                      keyboardType="numeric"
                      placeholder="100"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Passing Marks</Text>
                    <TextInput
                      style={styles.textInput}
                      value={passingMarks}
                      onChangeText={setPassingMarks}
                      keyboardType="numeric"
                      placeholder="60"
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setScheduleModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleScheduleAssessment}
                    >
                      <Text style={styles.confirmButtonText}>Schedule</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Score Assessment Modal */}
      <Modal
        visible={scoreModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Scores</Text>
              <TouchableOpacity
                onPress={() => setScoreModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedAssessment && (
                <>
                  <Text style={styles.modalSubtitle}>
                    {selectedAssessment.topic_name} - {selectedAssessment.subject_name}
                  </Text>
                  
                  {selectedAssessment.students?.map((student) => (
                    <View key={student.student_roll} style={styles.studentScoreRow}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.student_name}</Text>
                        <Text style={styles.studentRoll}>({student.student_roll})</Text>
                      </View>
                      <TextInput
                        style={styles.scoreInput}
                        value={studentScores[student.student_roll] || ''}
                        onChangeText={(text) => 
                          setStudentScores(prev => ({
                            ...prev,
                            [student.student_roll]: text
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="Score"
                      />
                    </View>
                  ))}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setScoreModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleSubmitScores}
                    >
                      <Text style={styles.confirmButtonText}>Submit Scores</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Time Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={(date) => {
          setSelectedDateTime(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
        minimumDate={new Date()}
      />
    </SafeAreaView>
  );
};

export default EnhancedAssessmentManagement;
