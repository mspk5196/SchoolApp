import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  TextInput,
} from 'react-native';
import styles from './Academicssty'; // Updated import
import { API_URL } from '../../../../utils/env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Import your SVG icons
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import Pencil from '../../../../assets/MentorPage/edit.svg';
import Checkbox from '../../../../assets/MentorPage/checkbox2.svg';
const Staff = require('../../../../assets/MentorPage/staff.png');

const MentorDashboardAcademics = ({ navigation, route }) => {
  // State for early completion feedback modal
  const [showEarlyFeedbackModal, setShowEarlyFeedbackModal] = useState(false);
  const [earlyFeedback, setEarlyFeedback] = useState('');
  // Helper to format time left as mm:ss
  const formatTimeLeft = (msLeft) => {
    if (msLeft < 0) msLeft = 0;
    const totalSeconds = Math.floor(msLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s left`;
  };

  const [timeLeftString, setTimeLeftString] = useState('');
  const { activityId, subject, grade, section_name, startTime, endTime, duration, scheduleData } = route.params;

  // State management
  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);
  const [performances, setPerformances] = useState({});
  const [selectedLevel, setSelectedLevel] = useState('Level 1');
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionStartTimestamp, setSessionStartTimestamp] = useState(null);
  const [sessionEndTimestamp, setSessionEndTimestamp] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [batches, setBatches] = useState({});
  const [expandedBatches, setExpandedBatches] = useState({});

  // Animation values
  const [slideAnim] = useState(new Animated.Value(hp('100%')));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Performance options with colors
  const performanceOptions = [
    { key: 'Highly Attentive', color: '#059669', short: 'High' },
    { key: 'Moderately Attentive', color: '#0369A1', short: 'Mod' },
    { key: 'Not Attentive', color: '#D97706', short: 'Low' },
    { key: 'Absent', color: '#DC2626', short: 'Abs' },
  ];

  // Helper to set session timestamps
  // Helper to parse 'h:mm AM/PM' format to hour and minute
  const parseTimeString = (timeStr) => {
    // Example: '2:40 PM' or '11:05 AM'
    const [time, period] = timeStr.trim().split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return { hour, minute };
  };

  const setSessionTimestamps = () => {
    const today = new Date();
    const sessionStartTime = activity?.starttime || startTime;
    const sessionEndTime = activity?.endtime || endTime;
    
    const { hour: startHour, minute: startMinute } = parseTimeString(sessionStartTime);
    const { hour: endHour, minute: endMinute } = parseTimeString(sessionEndTime);
    const startTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute).getTime();
    const endTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute).getTime();
    setSessionStartTimestamp(startTimestamp);
    setSessionEndTimestamp(endTimestamp);
  };

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  useEffect(() => {
    if (students.length > 0) {
      const initialPerformances = students.reduce((acc, student) => {
        acc[student.student_roll] = student.has_approved_leave ? 'Absent' : null;
        return acc;
      }, {});
      setPerformances(initialPerformances);
    }
  }, [students]);

  // Set timestamps if activity status changes to In Progress
  useEffect(() => {
    if (activity?.status === 'In Progress') {
      setSessionTimestamps();
    }
    console.log(startTime);

  }, [activity?.status]);

  // Simulate session progress and update time left
  useEffect(() => {
    let interval;
    if (activity?.status === 'In Progress' && sessionStartTimestamp && sessionEndTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const total = sessionEndTimestamp - sessionStartTimestamp;
        const elapsed = Math.max(0, Math.min(now - sessionStartTimestamp, total));
        const percent = Math.round((elapsed / total) * 100);
        setSessionProgress(percent);

        // Update time left string every second
        const msLeft = sessionEndTimestamp - now;
        setTimeLeftString(formatTimeLeft(msLeft));

        // Auto-complete session when time is up
        if (percent >= 100) {
          setActivity(prev => ({ ...prev, status: 'Finish Session' }));
          clearInterval(interval);
        }
      }, 1000);
    } else {
      setTimeLeftString('');
    }
    return () => clearInterval(interval);
  }, [activity?.status, sessionStartTimestamp, sessionEndTimestamp]);

  const fetchActivityDetails = async () => {
    setIsLoading(true);
    try {
      if (scheduleData && scheduleData.length > 0) {
        // Extract the first activity from the scheduleData array
        const activityData = scheduleData[0];
        setActivity(activityData);
        
        // Set batches data
        if (activityData.batches) {
          setBatches(activityData.batches);
          // Initialize all batches as expanded
          const initialExpanded = {};
          Object.keys(activityData.batches).forEach(batchKey => {
            initialExpanded[batchKey] = true;
          });
          setExpandedBatches(initialExpanded);
          
          // Flatten students from all batches
          const allStudents = Object.values(activityData.batches).flatMap(batch => 
            batch.students.map(student => ({
              ...student,
              batch_name: batch.batch_name,
              batch_level: batch.batch_level
            }))
          );
          setStudents(allStudents);
        } else {
          // Fallback to existing students array
          const allStudents = scheduleData.flatMap(schedule => schedule.students || []);
          setStudents(allStudents);
        }
        
        setIsLoading(false);
        console.log('Activity Data:', activityData);
        console.log('Batches:', activityData.batches);
        // Timestamps will be set by useEffect when status is 'In Progress'
      } else {
        Alert.alert('Error','Failed to fetch activity details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!activity?.section_subject_activity_id) {
      Alert.alert('Error', 'Cannot fetch materials: missing activity information');
      return;
    }

    setLoadingMaterials(true);
    try {
      const url = `${API_URL}/api/mentor/getTopicMaterials?section_subject_activity_id=${activity.section_subject_activity_id}${activity.topic_id ? `&topic_id=${activity.topic_id}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.materials || []);
        setShowMaterials(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch materials');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch materials');
      console.error('Materials fetch error:', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const downloadMaterial = async (materialUrl, fileName) => {
    try {
      // For now, just show the URL - you can implement actual download logic
      Alert.alert('Download', `Material: ${fileName}\nURL: ${materialUrl}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download material');
    }
  };

  const toggleBatch = (batchKey) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }));
  };

  const handleStartSession = async () => {
    // console.log(activity);
    
    try {
      const sessionId = activity?.id || activityId;
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/${activity.activity}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'In Progress' }));
        setSessionTimestamps();
        Alert.alert('Success', 'Session has been started.');
      } else {
        Alert.alert('Error', data.message || 'Could not start the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const handleFinishSession = async () => {
    try {
      const sessionId = activity?.id || activityId;
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/academic/finish`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'Finished(need to update performance)' }));
        Alert.alert('Success', 'Session has been finished.');
      } else {
        Alert.alert('Error', data.message || 'Could not finish the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const handleCompleteSession = async (feedback) => {
    const pendingStudents = students.filter(s =>
      !s.has_approved_leave && !performances[s.student_roll]
    );

    if (pendingStudents.length > 0) {
      Alert.alert(
        'Incomplete Assessment',
        `Please mark performance for ${pendingStudents.length} student(s).`
      );
      return;
    }

    const studentPerformances = Object.keys(performances).map(roll => ({
      student_roll: roll,
      performance: performances[roll],
    }));
    console.log(studentPerformances, feedback, activityId);

    try {
      const sessionId = activity?.id || activityId;
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/academic/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentPerformances, feedback}),
      });
      const data = await response.json();
      if (data.success) {
        setSessionEndTimestamp(new Date().toISOString());
        Alert.alert('Success', 'Session completed successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Could not complete the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving data.');
    }
  };

  const openFeedbackModal = (student = null) => {
    setEditingStudent(student);
    setSelectedFeedback(student ? performances[student.student_roll] || '' : '');
    setShowFeedbackModal(true);

    // Animate modal in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeFeedbackModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: hp('100%'),
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFeedbackModal(false);
      setEditingStudent(null);
      setSelectedFeedback('');
    });
  };

  const confirmFeedback = () => {
    if (editingStudent && selectedFeedback) {
      setPerformances(prev => ({
        ...prev,
        [editingStudent.student_roll]: selectedFeedback
      }));
    }
    closeFeedbackModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return '#10B981';
      case 'Completed': return '#6B7280';
      case 'Not Started': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const getPerformanceColor = (performance) => {
    const option = performanceOptions.find(opt => opt.key === performance);
    return option ? option.color : '#64748B';
  };

  const renderStudentCard = (student, index) => {
    const performance = performances[student.student_roll];
    const hasLeave = student.has_approved_leave;
    
    return (
      <View
        key={`student-${student.student_roll}-${index}`}
        style={[
          styles.profileCard,
          hasLeave && styles.profileCardOnLeave
        ]}
      >
        <Image
          source={
            student.profile_photo
              ? { uri: `${API_URL}/${student.profile_photo}`.replace(/\\/g, '/') }
              : Staff
          }
          style={styles.profileImg}
        />

        <View style={styles.studentInfo}>
          <Text style={styles.profileName}>{student.student_name}</Text>
          <Text style={styles.profileId}>{student.student_roll}</Text>
          <Text style={styles.profileId}>{student.batch_name}</Text>
          {hasLeave && (
            <Text style={styles.leaveIndicator}>On Approved Leave</Text>
          )}
        </View>

        <View style={styles.performanceContainer}>
          {hasLeave ? (
            <View style={styles.performanceStatus}>
              <Text style={[styles.performanceText, { color: '#D97706' }]}>
                Absent
              </Text>
            </View>
          ) : performance ? (
            <View style={styles.performanceStatus}>
              <Text
                style={[
                  styles.performanceText,
                  { color: getPerformanceColor(performance) }
                ]}
              >
                {performance}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openFeedbackModal(student)}
              >
                <Pencil width={wp('4%')} height={wp('4%')} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.performanceButtons}>
              {performanceOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.perfButton,
                    performance === option.key && styles.selectedPerfButton
                  ]}
                  onPress={() => setPerformances(prev => ({
                    ...prev,
                    [student.student_roll]: option.key
                  }))}
                >
                  <Text
                    style={[
                      styles.perfButtonText,
                      performance === option.key && styles.selectedPerfButtonText
                    ]}
                  >
                    {option.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActionButton = () => {
    const completedCount = Object.values(performances).filter(p => p).length;
    const totalStudents = students.filter(s => !s.has_approved_leave).length;

    switch (activity?.status) {
      case 'Not Started':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartSession}
          >
            <Text style={styles.actionButtonText}>Start Session</Text>
          </TouchableOpacity>
        );

      case 'In Progress':
        const isComplete = completedCount >= totalStudents;
        return (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !isComplete && styles.actionButtonDisabled
              ]}
              onPress={() => {
                Alert.alert(
                  'Session time is not over',
                  'Do you want to complete it earlier?', // ✅ added message
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => setShowEarlyFeedbackModal(true) }
                  ]
                );
              }}
              disabled={!isComplete}
            >
              <Text style={styles.actionButtonText}>
                Wait ({timeLeftString})
              </Text>
            </TouchableOpacity>

            {/* Early Completion Feedback Modal */}
            <Modal
              visible={showEarlyFeedbackModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowEarlyFeedbackModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.feedbackModal, { padding: 20 }]}>
                  <Text style={styles.modalTitle}>Reason for Early Completion</Text>
                  <Text style={styles.modalQuestion}>
                    Please enter a reason for completing the session early:
                  </Text>
                  <View style={{ marginVertical: 10 }}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#2563EB',
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 16,
                        backgroundColor: '#fff',
                        marginBottom: 10
                      }}
                      placeholder="Enter reason..."
                      value={earlyFeedback}
                      onChangeText={setEarlyFeedback}
                      multiline
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                      style={[styles.confirmButton, { marginRight: 10 }]}
                      onPress={() => setShowEarlyFeedbackModal(false)}
                    >
                      <Text style={styles.confirmButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        !earlyFeedback && styles.actionButtonDisabled
                      ]}
                      onPress={() => {
                        setShowEarlyFeedbackModal(false);
                        handleCompleteSession(earlyFeedback);
                        setEarlyFeedback('');
                      }}
                      disabled={!earlyFeedback}
                    >
                      <Text style={styles.confirmButtonText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        );


      case 'Finished(need to update performance)':
        const isComplete1 = completedCount >= totalStudents;
        return (
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isComplete1 && styles.actionButtonDisabled
            ]}
            onPress={() => handleCompleteSession('Completed normally')}
            disabled={!isComplete1}
          >
            <Text style={styles.actionButtonText}>
              Finish Session {completedCount}/{totalStudents}
            </Text>
          </TouchableOpacity>
        );

      case 'Finish session':
        // const isComplete1 = completedCount >= totalStudents;
        return (
          <TouchableOpacity
            style={[
              styles.actionButton,
              // !isComplete1 && styles.actionButtonDisabled
            ]}
            onPress={() => handleFinishSession()}
            // disabled={!isComplete1}
          >
            <Text style={styles.actionButtonText}>
              Finish Session
            </Text>
          </TouchableOpacity>
        );

      case 'Completed':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Session Completed</Text>
          </View>
        );

      case 'Cancelled':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Session Cancelled</Text>
          </View>
        );

      case 'Time Over':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Session Time Over, cannot start</Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.emptyStateText}>Loading session details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Arrow width={wp('6%')} height={wp('6%')} />
        </TouchableOpacity>

        <Text style={styles.headerText}>Academic Session</Text>

        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(activity?.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {activity?.status || 'Loading'}
          </Text>
        </View>
      </View>

      {/* Session Information Card */}
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{activity?.subject || subject}</Text>
            <View style={styles.sessionMeta}>
              <Text style={styles.gradeText}>
                Grade {activity?.grade || grade} - {activity?.section_name || section_name}
              </Text>
              <View style={styles.academicBadge}>
                <Text style={styles.academicText}>{activity?.session_type || 'Academic'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {activity?.starttime || startTime} - {activity?.endtime || endTime}
            </Text>
            {(activity?.duration || duration) && (
              <Text style={styles.durationText}>{activity?.duration || duration}</Text>
            )}
          </View>
        </View>

        {/* Topic Hierarchy */}
        {activity?.topic_hierarchy && (
          <View style={styles.topicContainer}>
            <Text style={styles.topicLabel}>Topic:</Text>
            <Text style={styles.topicHierarchy}>{activity.topic_hierarchy}</Text>
          </View>
        )}

        {/* Materials Button */}
        {activity?.section_subject_activity_id && (
          <View style={styles.materialsContainer}>
            <TouchableOpacity
              style={styles.materialsButton}
              onPress={fetchMaterials}
              disabled={loadingMaterials}
            >
              <Text style={styles.materialsButtonText}>
                {loadingMaterials ? 'Loading...' : 'View Materials'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Bar for In Progress Sessions */}
        {activity?.status === 'In Progress' && (
          <View style={{ marginTop: hp('2%') }}>
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${sessionProgress}%` }]}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.progressText}>
                Session Progress: {sessionProgress}%
              </Text>
              <Text style={[styles.progressText, { color: '#2563EB', fontWeight: 'bold' }]}>
                {timeLeftString}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Students List */}
      <View style={styles.studentsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Students</Text>
          <Text style={styles.studentCount}>
            {students.length} student{students.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No students found for this session.
              </Text>
            </View>
          ) : Object.keys(batches).length > 0 ? (
            // Render batch-wise if batches data is available
            Object.entries(batches).map(([batchKey, batch]) => (
              <View key={batchKey} style={styles.batchContainer}>
                <TouchableOpacity 
                  style={styles.batchHeader}
                  onPress={() => toggleBatch(batchKey)}
                >
                  <Text style={styles.batchTitle}>
                    {batch.batch_name || 'No Batch'} 
                    {batch.batch_level && ` (Level ${batch.batch_level})`}
                  </Text>
                  <Text style={styles.batchCount}>
                    {batch.students.length} student{batch.students.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.expandIcon}>
                    {expandedBatches[batchKey] ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedBatches[batchKey] && (
                  <View style={styles.batchStudents}>
                    {batch.students.map((student, index) => renderStudentCard(student, `${batchKey}-${index}`))}
                  </View>
                )}
              </View>
            ))
          ) : (
            // Fallback to flat list if no batch data
            students.map((student, index) => renderStudentCard(student, index))
          )}
        </ScrollView>
      </View>

      {/* Action Button */}
      <View style={styles.actionButtonContainer}>
        {renderActionButton()}
      </View>

      {/* Enhanced Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeFeedbackModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeFeedbackModal}
        >
          {/* This first View is for the fade animation, so it should also be an Animated.View */}
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            {/* This is the key change: from View to Animated.View */}
            <Animated.View
              style={[
                styles.feedbackModal,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>
                  {editingStudent ? 'Edit Performance' : 'Mark Performance'}
                </Text>
                <Text style={styles.modalQuestion}>
                  {editingStudent
                    ? `How was ${editingStudent.student_name}'s performance?`
                    : 'How was the student\'s performance?'
                  }
                </Text>
              </View>

              {performanceOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.radioOption,
                    selectedFeedback === option.key && styles.radioOptionActive
                  ]}
                  onPress={() => setSelectedFeedback(option.key)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: option.color,
                        backgroundColor: selectedFeedback === option.key
                          ? option.color
                          : 'transparent'
                      }
                    ]}
                  >
                    {selectedFeedback === option.key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.radioText,
                      { color: selectedFeedback === option.key ? option.color : '#64748B' }
                    ]}
                  >
                    {option.key}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedFeedback && styles.actionButtonDisabled
                ]}
                onPress={confirmFeedback}
                disabled={!selectedFeedback}
              >
                <Text style={styles.confirmButtonText}>
                  {editingStudent ? 'Update Performance' : 'Confirm Performance'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Materials Modal */}
      <Modal
        visible={showMaterials}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMaterials(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.materialsModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Topic Materials</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMaterials(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {activity?.topic_hierarchy && (
              <View style={styles.topicInfo}>
                <Text style={styles.topicInfoText}>{activity.topic_hierarchy}</Text>
              </View>
            )}

            <ScrollView style={styles.materialsContent}>
              {materials.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No materials found for this topic.</Text>
                </View>
              ) : (
                materials.map((levelGroup, levelIndex) => (
                  <View key={levelIndex} style={styles.materialLevelGroup}>
                    <Text style={styles.materialLevelTitle}>Level {levelGroup.level}</Text>
                    {levelGroup.materials.map((material, materialIndex) => (
                      <View key={materialIndex} style={styles.materialItem}>
                        <View style={styles.materialInfo}>
                          <Text style={styles.materialTitle}>{material.title}</Text>
                          <Text style={styles.materialType}>{material.material_type}</Text>
                          {material.expected_date && (
                            <Text style={styles.materialDate}>
                              Expected: {new Date(material.expected_date).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => downloadMaterial(material.file_url, material.file_name)}
                        >
                          <Text style={styles.downloadButtonText}>📥</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentorDashboardAcademics;