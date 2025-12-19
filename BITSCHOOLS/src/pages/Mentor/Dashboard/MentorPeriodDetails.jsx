import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../utils/ApiService';
import { API_URL } from '../../../config/env';
import styles from './periodDetSty';

const Staff = require('../../../assets/General/staff.png');

const MentorPeriodDetails = ({ route, navigation }) => {
  const { facultyCalendarId, sessionData, facultyId } = route.params;

  const [sessionDetails, setSessionDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [attentivenessOptions, setAttentivenessOptions] = useState([]);
  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [topicMaterials, setTopicMaterials] = useState([]);
  const [activityHierarchy, setActivityHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionInstanceId, setSessionInstanceId] = useState(null);
  const [isFinishedNotCompleted, setIsFinishedNotCompleted] = useState(false);
  const [canStartSession, setCanStartSession] = useState(false);
  const [isStudentFacing, setIsStudentFacing] = useState(true);
  const [facultyNotes, setFacultyNotes] = useState('');

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Bulk selection states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkEvaluation, setBulkEvaluation] = useState({});
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Homework states
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [availableActivities, setAvailableActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Evaluation states
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showEarlyCompletionModal, setShowEarlyCompletionModal] = useState(false);
  const [earlyCompletionReason, setEarlyCompletionReason] = useState('');
  const [studentEvaluations, setStudentEvaluations] = useState({});

  useEffect(() => {
    fetchSessionDetails();
    fetchStudents();
  }, []);

  // Timer effect for running session
  useEffect(() => {
    if (sessionStarted && sessionDetails) {
      const [startHours, startMinutes] = sessionDetails.start_time.split(':');
      const [endHours, endMinutes] = sessionDetails.end_time.split(':');

      const startTimeInMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);
      const endTimeInMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);
      const totalMinutes = endTimeInMinutes - startTimeInMinutes;

      setTotalDuration(totalMinutes * 60); // Convert to seconds

      const interval = setInterval(() => {
        const now = new Date();
        const sessionDate = new Date(sessionDetails.date);
        const sessionStart = new Date(sessionDate);
        sessionStart.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

        const elapsed = Math.floor((now - sessionStart) / 1000); // seconds
        setElapsedTime(elapsed);

        const progress = (elapsed / (totalMinutes * 60)) * 100;
        setProgressPercentage(Math.min(progress, 100));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionStarted, sessionDetails]);

  // Update bulk panel visibility when students are selected
  useEffect(() => {
    setShowBulkPanel(selectedStudents.length > 0);
  }, [selectedStudents]);

  const fetchSessionDetails = async () => {
    try {
      const data = await ApiService.post('/mentor/getSessionDetails', {
        facultyCalendarId: facultyCalendarId
      });

      if (data.success) {
        setSessionDetails(data.sessionDetails);
        setTopicHierarchy(data.topicHierarchy || []);
        setTopicMaterials(data.topicMaterials || []);
        setActivityHierarchy(data.activityHierarchy || []);
        setIsStudentFacing(data.sessionDetails.is_student_facing === 1);

        // Check if session can be started
        checkSessionStartTime(data.sessionDetails);

        if (data.sessionDetails.session_instance_id) {
          setSessionInstanceId(data.sessionDetails.session_instance_id);
          const status = data.sessionDetails.session_status;
          // Set session as started if it's running or finished but not completed
          setSessionStarted(status === 'running' || status === 'finished_not_completed');
          setIsFinishedNotCompleted(status === 'finished_not_completed');
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      Alert.alert('Error', 'Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStartTime = (details) => {
    const now = new Date();
    const sessionDate = new Date(details.date);
    const [hours, minutes] = details.start_time.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setCanStartSession(now >= sessionDate);
  };

  const fetchStudents = async () => {
    try {
      const data = await ApiService.post('/mentor/getStudentsForSession', {
        facultyCalendarId: facultyCalendarId
      });

      if (data.success) {
        setStudents(data.students);
        setAttentivenessOptions(data.attentivenessOptions || []);

        // Initialize student evaluations with existing data
        const initialEvaluations = {};
        data.students.forEach(student => {
          initialEvaluations[student.id] = {
            studentId: student.id,
            marksObtained: student.marks_obtained || null,
            attentivenessId: student.attentiveness_id || null,
            malpracticeFlag: student.malpractice_flag || 0,
            remarks: student.remarks || '',
            isPresent: true,
          };
        });
        setStudentEvaluations(initialEvaluations);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const handleStartSession = async () => {
    if (!canStartSession) {
      Alert.alert('Cannot Start', 'Session cannot be started before scheduled time');
      return;
    }

    try {
      setLoading(true);
      const data = await ApiService.post('/mentor/startSession', {
        facultyCalendarId: facultyCalendarId,
        facultyId: facultyId
      });

      if (data.success) {
        setSessionStarted(true);
        setSessionInstanceId(data.sessionInstanceId);
        Alert.alert('Success', 'Session started successfully');
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error starting session:', error);
      const errorMsg = error.response?.data?.message || 'Failed to start session';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    // If session is already finished but not completed, save any evaluation changes first
    if (isFinishedNotCompleted) {
      try {
        setLoading(true);
        
        let requestData = {
          facultyCalendarId: facultyCalendarId,
          facultyId: facultyId,
        };

        // Handle different session types
        if (isStudentFacing) {
          // Student-facing session: send updated student evaluations
          const evaluations = Object.keys(studentEvaluations)
            .filter(studentId => studentEvaluations[studentId]?.isPresent !== undefined)
            .map(studentId => {
              const evalu = studentEvaluations[studentId];
              return {
                studentId: parseInt(studentId),
                isPresent: evalu.isPresent === true,
                marksObtained: (sessionDetails.requires_marks && evalu.isPresent) 
                  ? (evalu.marksObtained ? parseInt(evalu.marksObtained) : null) 
                  : null,
                attentivenessId: (sessionDetails.requires_attentiveness && evalu.isPresent) 
                  ? (evalu.attentivenessId ? parseInt(evalu.attentivenessId) : null) 
                  : null,
                malpracticeFlag: (sessionDetails.allows_malpractice && evalu.isPresent) 
                  ? (evalu.malpracticeFlag ? 1 : 0) 
                  : 0,
                remarks: evalu.remarks ? String(evalu.remarks) : null,
              };
            });
          requestData.studentEvaluations = evaluations;
        } else {
          // Faculty-facing session: send updated faculty notes
          requestData.facultyNotes = facultyNotes ? String(facultyNotes) : '';
        }

        // Update evaluations using finishSession endpoint (will update existing evaluations)
        await ApiService.post('/mentor/updateFinishedSessionEvaluations', requestData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error updating evaluations:', error);
        setLoading(false);
        // Continue to homework modal even if update fails
      }
    }
    
    // For student-facing sessions, show homework modal
    if (isStudentFacing) {
      setShowHomeworkModal(true);
      fetchActivitiesForHomework();
    } else {
      setShowEndSessionModal(true);
    }
  };

  const confirmEndSession = async (homework = null) => {
    try {
      setLoading(true);

      let requestData = {
        facultyCalendarId: facultyCalendarId,
        facultyId: facultyId
      };

      // Add homework if provided (for student-facing sessions)
      if (homework) {
        requestData.homework = {
          title: String(homework.title),
          description: homework.description ? String(homework.description) : null,
          contextActivityId: parseInt(homework.contextActivityId),
          topicId: homework.topicId ? parseInt(homework.topicId) : null
        };
      }

      // Add early completion reason if provided
      if (earlyCompletionReason) {
        requestData.earlyCompletionReason = String(earlyCompletionReason);
      }

      const data = await ApiService.post('/mentor/endSession', requestData);

      if (data.success) {
        Alert.alert('Success', 'Session ended successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error ending session:', error);
      Alert.alert('Error', 'Failed to end session');
    } finally {
      setLoading(false);
      setShowEndSessionModal(false);
      setShowHomeworkModal(false);
    }
  };

  const handleFinishSession = async () => {
    if (!isStudentFacing) {
      // For faculty sessions, go directly to end
      handleEndSession();
      return;
    }
    // Check if all students are marked
    const unmarkedStudents = students.filter(student =>
      studentEvaluations[student.id]?.isPresent === undefined
    );

    if (unmarkedStudents.length > 0) {
      Alert.alert(
        'Incomplete Evaluation',
        `${unmarkedStudents.length} student(s) are not marked. Please mark all students or they will be marked as absent.`,
        [
          {
            text: 'Continue Marking',
            style: 'cancel'
          },
          {
            text: 'Mark Remaining as Absent',
            onPress: () => {
              unmarkedStudents.forEach(student => {
                updateStudentEvaluation(student.id, 'isPresent', false);
              });
              setTimeout(() => finishSession(), 500);
            }
          }
        ]
      );
    } else {
      // All students marked, proceed to finish
      await finishSession();
    }
  };

  const finishSession = async () => {
    try {
      setLoading(true);

      // Check if session finished before scheduled end time and ensure reason is provided
      const now = new Date();
      const sessionDate = new Date(sessionDetails.date);
      const [hours, minutes] = sessionDetails.end_time.split(':');
      const endTime = new Date(sessionDate);
      endTime.setHours(parseInt(hours), parseInt(minutes), 0);

      if (now < endTime && !earlyCompletionReason) {
        setShowEarlyCompletionModal(true);
        setLoading(false);
        return;
      }

      let requestData = {
        facultyCalendarId: facultyCalendarId,
        facultyId: facultyId,
        // Only send early completion reason if it was provided
        earlyCompletionReason: earlyCompletionReason ? String(earlyCompletionReason) : null,
      };

      // Handle different session types
      if (isStudentFacing) {
        // Student-facing session: send student evaluations
        const evaluations = Object.keys(studentEvaluations)
          .filter(studentId => studentEvaluations[studentId]?.isPresent !== undefined)
          .map(studentId => {
            const evalu = studentEvaluations[studentId];
            return {
              studentId: parseInt(studentId),
              isPresent: evalu.isPresent === true,
              marksObtained: (sessionDetails.requires_marks && evalu.isPresent) 
                ? (evalu.marksObtained ? parseInt(evalu.marksObtained) : null) 
                : null,
              attentivenessId: (sessionDetails.requires_attentiveness && evalu.isPresent) 
                ? (evalu.attentivenessId ? parseInt(evalu.attentivenessId) : null) 
                : null,
              malpracticeFlag: (sessionDetails.allows_malpractice && evalu.isPresent) 
                ? (evalu.malpracticeFlag ? 1 : 0) 
                : 0,
              remarks: evalu.remarks ? String(evalu.remarks) : null,
            };
          });
        requestData.studentEvaluations = evaluations;
      } else {
        // Faculty-facing session: send faculty notes
        requestData.facultyNotes = facultyNotes ? String(facultyNotes) : '';
      }

      const data = await ApiService.post('/mentor/finishSession', requestData);

      if (data.success) {
        // Mark session as finished but not completed locally
        setSessionDetails(prev => prev ? { ...prev, session_status: 'finished_not_completed' } : prev);
        setIsFinishedNotCompleted(true);
        Alert.alert('Success', 'Session marked as finished. You can update evaluations and end the session when ready.');
      }
    } catch (error) {
      console.error('Error finishing session:', error);
      Alert.alert('Error', 'Failed to finish session');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesForHomework = async () => {
    try {
      const response = await ApiService.post('/mentor/getActivitiesForHomework', {
        gradeId: sessionDetails.grade_id,
        subjectId: sessionDetails.subject_id
      });

      if (response.success) {
        setAvailableActivities(response.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchTopicsForActivity = async (activityId) => {
    try {
      const response = await ApiService.post('/mentor/getTopicsForHomework', {
        contextActivityId: activityId,
        subjectId: sessionDetails.subject_id
      });

      if (response.success) {
        setAvailableTopics(response.topics || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleActivityChange = (activityId) => {
    setSelectedActivityId(activityId);
    setSelectedTopicId(null);
    setAvailableTopics([]);
    if (activityId) {
      fetchTopicsForActivity(activityId);
    }
  };

  const handleSubmitHomework = () => {
    if (!homeworkTitle.trim()) {
      Alert.alert('Error', 'Please enter homework title');
      return;
    }

    if (!selectedActivityId) {
      Alert.alert('Error', 'Please select an activity');
      return;
    }

    const homework = {
      title: homeworkTitle,
      description: homeworkDescription,
      contextActivityId: selectedActivityId,
      topicId: selectedTopicId
    };

    confirmEndSession(homework);
  };

  const handleSkipHomework = () => {
    Alert.alert(
      'Skip Homework',
      'Are you sure you want to skip homework assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => confirmEndSession(null) }
      ]
    );
  };

  const updateStudentEvaluation = (studentId, field, value) => {
    setStudentEvaluations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const applyBulkEvaluation = () => {
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select students first');
      return;
    }

    selectedStudents.forEach(studentId => {
      setStudentEvaluations(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          ...bulkEvaluation,
          isPresent: true
        }
      }));
    });

    setSelectedStudents([]);
    setBulkEvaluation({});
    Alert.alert('Success', 'Evaluations applied to selected students');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const uri = `${API_URL}/${normalizedPath}`;
      return { uri };
    }
    return Staff;
  };

  if (loading || !sessionDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title="Session Details" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading session details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Session Details" navigation={navigation} />

      <ScrollView style={styles.content}>
        {/* Session Info Card */}
        <View style={styles.sessionInfoCard}>
          <Text style={styles.subjectText}>{sessionDetails.subject_name}</Text>
          <Text style={styles.gradeText}>
            {sessionDetails.grade_name} - Section {sessionDetails.section_name}
          </Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>
              {formatTime(sessionDetails.start_time)} - {formatTime(sessionDetails.end_time)}
            </Text>
          </View>

          {sessionDetails.venue_name && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748B" />
              <Text style={styles.infoText}>{sessionDetails.venue_name}</Text>
            </View>
          )}

          {sessionDetails.batch_names && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group" size={20} color="#64748B" />
              <Text style={styles.infoText}>Batches: {sessionDetails.batch_names}</Text>
            </View>
          )}

          {/* Topic Hierarchy */}
          {topicHierarchy.length > 0 && (
            <View style={styles.hierarchySection}>
              <View style={styles.hierarchyHeader}>
                <MaterialCommunityIcons name="file-tree" size={20} color="#3B82F6" />
                <Text style={styles.hierarchyTitle}>Topic Hierarchy</Text>
              </View>
              <View style={styles.hierarchyPath}>
                {topicHierarchy.map((topic, index) => (
                  <React.Fragment key={topic.id}>
                    {index > 0 && <Text style={styles.hierarchySeparator}> › </Text>}
                    <Text style={[
                      styles.hierarchyItem,
                      index === topicHierarchy.length - 1 && styles.hierarchyItemActive
                    ]}>
                      {topic.topic_name}
                    </Text>
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* Topic Materials */}
          {topicMaterials.length > 0 && (
            <View style={styles.materialsSection}>
              <View style={styles.hierarchyHeader}>
                <MaterialCommunityIcons name="folder-multiple" size={20} color="#10B981" />
                <Text style={styles.hierarchyTitle}>Topic Materials</Text>
              </View>
              {topicMaterials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.materialCard}
                  onPress={() => material.material_url && Linking.openURL(`${material.material_url}`)}
                >
                  <View style={styles.materialIcon}>
                    <MaterialCommunityIcons
                      name={
                        material.material_type === 'PDF' ? 'file-pdf-box' :
                          material.material_type === 'Video' ? 'video-box' :
                            material.material_type === 'Image' ? 'image-box' :
                              'file-document'
                      }
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{material.material_title}</Text>
                    <Text style={styles.materialMeta}>
                      {material.material_type}
                      {material.difficulty_level && ` • ${material.difficulty_level}`}
                      {material.estimated_duration && ` • ${material.estimated_duration} min`}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="open-in-new" size={20} color="#64748B" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Activity Hierarchy */}
          {activityHierarchy.length > 0 && (
            <View style={styles.hierarchySection}>
              <View style={styles.hierarchyHeader}>
                <MaterialCommunityIcons name="layers-triple" size={20} color="#F59E0B" />
                <Text style={styles.hierarchyTitle}>Activity Hierarchy</Text>
              </View>
              <View style={styles.hierarchyPath}>
                {activityHierarchy.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    {index > 0 && <Text style={styles.hierarchySeparator}> › </Text>}
                    <Text style={[
                      styles.hierarchyItem,
                      index === activityHierarchy.length - 1 && styles.hierarchyItemActive
                    ]}>
                      {activity.name}
                    </Text>
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {sessionDetails.evaluation_mode_name && (
            <View style={styles.evaluationBadge}>
              <Text style={styles.evaluationBadgeText}>
                Evaluation: {sessionDetails.evaluation_mode_name}
              </Text>
            </View>
          )}

          {sessionDetails.session_status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                Status: {sessionDetails.session_status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!sessionStarted && sessionDetails.session_status !== 'completed' && (
          <TouchableOpacity
            style={[styles.startButton, !canStartSession && styles.disabledButton]}
            onPress={handleStartSession}
            disabled={!canStartSession}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>
              {canStartSession ? 'Start Session' : 'Waiting for Start Time'}
            </Text>
          </TouchableOpacity>
        )}

        {sessionStarted && sessionDetails.session_status !== 'completed' && (
          <>
            {/* Timer and Progress Bar */}
            <View style={styles.timerCard}>
              <View style={styles.timerHeader}>
                <MaterialCommunityIcons name="timer-outline" size={24} color="#3B82F6" />
                <Text style={styles.timerTitle}>Session Progress</Text>
              </View>
              <View style={styles.timerContent}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Elapsed:</Text>
                  <Text style={styles.timeValue}>{formatDuration(elapsedTime)}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Remaining:</Text>
                  <Text style={styles.timeValue}>
                    {formatDuration(Math.max(0, totalDuration - elapsedTime))}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progressPercentage)}% Complete</Text>
            </View>

            {isStudentFacing ? (
              /* Student-facing session: Show students list with evaluation */
              <>
                {/* Bulk Selection Panel */}
                <View style={styles.bulkActionsCard}>
                  <View style={styles.bulkHeader}>
                    <TouchableOpacity 
                      style={styles.selectAllButton}
                      onPress={selectAllStudents}
                    >
                      <MaterialCommunityIcons 
                        name={selectedStudents.length === students.length ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={24} 
                        color="#3B82F6" 
                      />
                      <Text style={styles.selectAllText}>
                        {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                    {selectedStudents.length > 0 && (
                      <Text style={styles.selectedCount}>
                        {selectedStudents.length} selected
                      </Text>
                    )}
                  </View>
                  
                  {showBulkPanel && (
                    <View style={styles.bulkPanel}>
                      <Text style={styles.bulkPanelTitle}>Bulk Evaluation</Text>
                      
                      {sessionDetails.requires_marks === 1 && (
                        <View style={styles.bulkInputGroup}>
                          <Text style={styles.bulkInputLabel}>Marks</Text>
                          <TextInput
                            style={styles.bulkTextInput}
                            placeholder="Enter marks"
                            keyboardType="numeric"
                            value={bulkEvaluation.marksObtained?.toString() || ''}
                            onChangeText={(text) => setBulkEvaluation(prev => ({
                              ...prev,
                              marksObtained: parseInt(text) || null
                            }))}
                          />
                        </View>
                      )}
                      
                      {sessionDetails.requires_attentiveness === 1 && (
                        <View style={styles.bulkInputGroup}>
                          <Text style={styles.bulkInputLabel}>Attentiveness</Text>
                          <View style={styles.attentivenessButtons}>
                            {attentivenessOptions.map((option) => (
                              <TouchableOpacity
                                key={option.id}
                                style={[
                                  styles.attentivenessButton,
                                  bulkEvaluation.attentivenessId === option.id && styles.attentivenessButtonActive,
                                ]}
                                onPress={() => setBulkEvaluation(prev => ({
                                  ...prev,
                                  attentivenessId: option.id
                                }))}
                              >
                                <Text style={[
                                  styles.attentivenessButtonText,
                                  bulkEvaluation.attentivenessId === option.id && styles.attentivenessButtonTextActive,
                                ]}>
                                  {option.attentiveness}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {sessionDetails.allows_malpractice === 1 && (
                        <TouchableOpacity
                          style={styles.bulkCheckboxRow}
                          onPress={() => setBulkEvaluation(prev => ({
                            ...prev,
                            malpracticeFlag: prev.malpracticeFlag ? 0 : 1
                          }))}
                        >
                          <MaterialCommunityIcons
                            name={bulkEvaluation.malpracticeFlag ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={bulkEvaluation.malpracticeFlag ? '#EF4444' : '#64748B'}
                          />
                          <Text style={styles.bulkCheckboxLabel}>Mark for Malpractice</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity 
                        style={styles.applyBulkButton}
                        onPress={applyBulkEvaluation}
                      >
                        <MaterialCommunityIcons name="check-all" size={20} color="#FFFFFF" />
                        <Text style={styles.applyBulkButtonText}>
                          Apply to {selectedStudents.length} Student(s)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.studentsSection}>
                  <Text style={styles.sectionTitle}>Students ({students.length})</Text>

                  {students.map((student, index) => (
                    <View key={student.id} style={styles.studentCard}>
                      <View style={styles.studentHeader}>
                        {/* Bulk Selection Checkbox */}
                        <TouchableOpacity 
                          style={styles.selectionCheckbox}
                          onPress={() => toggleStudentSelection(student.id)}
                        >
                          <MaterialCommunityIcons
                            name={selectedStudents.includes(student.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={selectedStudents.includes(student.id) ? "#3B82F6" : "#94A3B8"}
                          />
                        </TouchableOpacity>
                        <Image
                          source={getProfileImageSource(student.photo_url)}
                          style={styles.studentAvatar}
                        />
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentRoll}>Roll: {student.roll}</Text>
                        {student.batch_name && (
                          <Text style={styles.studentBatch}>Batch: {student.batch_name}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.presenceButton,
                          !studentEvaluations[student.id]?.isPresent && styles.absentButton,
                        ]}
                        onPress={() =>
                          updateStudentEvaluation(
                            student.id,
                            'isPresent',
                            !studentEvaluations[student.id]?.isPresent
                          )
                        }
                      >
                        <MaterialCommunityIcons
                          name={
                            studentEvaluations[student.id]?.isPresent
                              ? 'check-circle'
                              : 'close-circle'
                          }
                          size={24}
                          color={
                            studentEvaluations[student.id]?.isPresent ? '#10B981' : '#EF4444'
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    {studentEvaluations[student.id]?.isPresent && (
                      <View style={styles.evaluationInputs}>
                        {/* Marks Input - Only if requires_marks = 1 */}
                        {sessionDetails.requires_marks === 1 && (
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                              Marks (Out of {sessionDetails.total_marks || 'N/A'})
                            </Text>
                            <TextInput
                              style={styles.textInput}
                              placeholder="Enter marks"
                              keyboardType="numeric"
                              value={
                                studentEvaluations[student.id]?.marksObtained?.toString() || ''
                              }
                              onChangeText={(text) =>
                                updateStudentEvaluation(student.id, 'marksObtained', parseInt(text) || null)
                              }
                            />
                          </View>
                        )}

                        {/* Attentiveness Selector - Only if requires_attentiveness = 1 */}
                        {sessionDetails.requires_attentiveness === 1 && (
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Attentiveness</Text>
                            <View style={styles.attentivenessButtons}>
                              {attentivenessOptions.map((option) => (
                                <TouchableOpacity
                                  key={option.id}
                                  style={[
                                    styles.attentivenessButton,
                                    studentEvaluations[student.id]?.attentivenessId === option.id &&
                                    styles.attentivenessButtonActive,
                                  ]}
                                  onPress={() =>
                                    updateStudentEvaluation(student.id, 'attentivenessId', option.id)
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.attentivenessButtonText,
                                      studentEvaluations[student.id]?.attentivenessId === option.id &&
                                      styles.attentivenessButtonTextActive,
                                    ]}
                                  >
                                    {option.attentiveness}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Documents Link - Only if requires_docs = 1 */}
                        {sessionDetails.requires_docs === 1 && (
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Supporting Documents Link</Text>
                            <TextInput
                              style={styles.textInput}
                              placeholder="Enter document URL"
                              value={studentEvaluations[student.id]?.docsLink || ''}
                              onChangeText={(text) =>
                                updateStudentEvaluation(student.id, 'docsLink', text)
                              }
                            />
                          </View>
                        )}

                        {/* Malpractice Flag - Only if allows_malpractice = 1 */}
                        {sessionDetails.allows_malpractice === 1 && (
                          <View style={styles.inputGroup}>
                            <TouchableOpacity
                              style={styles.checkboxRow}
                              onPress={() =>
                                updateStudentEvaluation(
                                  student.id,
                                  'malpracticeFlag',
                                  studentEvaluations[student.id]?.malpracticeFlag ? 0 : 1
                                )
                              }
                            >
                              <MaterialCommunityIcons
                                name={
                                  studentEvaluations[student.id]?.malpracticeFlag
                                    ? 'checkbox-marked'
                                    : 'checkbox-blank-outline'
                                }
                                size={24}
                                color={
                                  studentEvaluations[student.id]?.malpracticeFlag
                                    ? '#EF4444'
                                    : '#64748B'
                                }
                              />
                              <Text style={styles.checkboxLabel}>Mark for Malpractice</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Remarks */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                          <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Add remarks..."
                            multiline
                            numberOfLines={2}
                            value={studentEvaluations[student.id]?.remarks || ''}
                            onChangeText={(text) =>
                              updateStudentEvaluation(student.id, 'remarks', text)
                            }
                          />
                        </View>
                      </View>
                    )}
                  </View>
                ))}
                </View>
              </>
            ) : (
              /* Faculty-facing session: Show faculty notes input */
              <View style={styles.facultyNotesSection}>
                <Text style={styles.sectionTitle}>Session Notes</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.inputLabel}>Enter session completion notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter details about the session (e.g., questions generated, materials prepared, etc.)"
                    multiline
                    numberOfLines={8}
                    value={facultyNotes}
                    onChangeText={setFacultyNotes}
                  />
                </View>
              </View>
            )}

            {sessionDetails.session_status !== 'finished_not_completed' ? (
              <TouchableOpacity style={styles.finishButton} onPress={handleFinishSession}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                <Text style={styles.finishButtonText}>Finish Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#FFFFFF" />
                <Text style={styles.endButtonText}>End Session</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Early Completion Modal */}
      <Modal
        visible={showEarlyCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEarlyCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Early Completion</Text>
            <Text style={styles.modalText}>
              Session is finishing before scheduled time. Please provide a reason:
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea, styles.modalInput]}
              placeholder="Enter reason for early completion..."
              multiline
              numberOfLines={4}
              value={earlyCompletionReason}
              onChangeText={setEarlyCompletionReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEarlyCompletionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowEarlyCompletionModal(false);
                  // Early completion reason is only used for Finish Session flow
                  finishSession();
                }}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Homework Assignment Modal */}
      <Modal
        visible={showHomeworkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHomeworkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.homeworkModal]}>
            <ScrollView
              style={styles.homeworkScrollView}
              contentContainerStyle={styles.homeworkScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Text style={styles.modalTitle}>Assign Homework</Text>
              <Text style={styles.modalText}>
                Add homework for this session (optional)
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Homework Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter homework title"
                  value={homeworkTitle}
                  onChangeText={setHomeworkTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter homework description"
                  multiline
                  numberOfLines={4}
                  value={homeworkDescription}
                  onChangeText={setHomeworkDescription}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Activity *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedActivityId}
                    onValueChange={(value) => {
                      if (value) {
                        handleActivityChange(value);
                      }
                    }}
                  >
                    <Picker.Item label="Select activity" value={null} />
                    {availableActivities.map((activity) => (
                      <Picker.Item
                        key={activity.id}
                        label={activity.hierarchy}
                        value={activity.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {availableTopics.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Topic (Optional)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedTopicId}
                      onValueChange={(value) => {
                        setSelectedTopicId(value || null);
                      }}
                    >
                      <Picker.Item label="Select topic (optional)" value={null} />
                      {availableTopics.map((topic) => (
                        <Picker.Item
                          key={topic.id}
                          label={topic.hierarchy}
                          value={topic.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

            </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleSkipHomework}
                >
                  <Text style={styles.cancelButtonText}>Skip Homework</Text>
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

      {/* End Session Confirmation Modal */}
      <Modal
        visible={showEndSessionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEndSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm End Session</Text>
            <Text style={styles.modalText}>
              Are you sure you want to end this session? All evaluations will be saved.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEndSessionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmEndSession}
              >
                <Text style={styles.confirmButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



export default MentorPeriodDetails;
