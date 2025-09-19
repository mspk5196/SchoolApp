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
  Linking,
} from 'react-native';
import styles from './Assessmentsty.jsx';
import { API_URL } from '../../../../utils/env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Import your SVG icons
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import Pencil from '../../../../assets/MentorPage/edit.svg';
const Staff = require('../../../../assets/MentorPage/staff.png');

const MentorDashboardAssessment = ({ navigation, route }) => {
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
  const [submissions, setSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionStartTimestamp, setSessionStartTimestamp] = useState(null);
  const [sessionEndTimestamp, setSessionEndTimestamp] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [batches, setBatches] = useState({});
  const [expandedBatches, setExpandedBatches] = useState({});
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [tempMarks, setTempMarks] = useState('');

  // Animation values
  const [slideAnim] = useState(new Animated.Value(hp('100%')));
  const [fadeAnim] = useState(new Animated.Value(0));

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
      const initialSubs = students.reduce((acc, student) => {
        acc[student.student_roll] = {
          marks_obtained: '',
          total_marks: '100',
          is_absent: student.has_approved_leave,
        };
        return acc;
      }, {});
      setSubmissions(initialSubs);
    }
  }, [students]);

  // Set timestamps if activity status changes to In Progress
  useEffect(() => {
    if (activity?.status === 'In Progress') {
      setSessionTimestamps();
    }
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

  // Periodic status checking
  useEffect(() => {
    let statusInterval;
    
    // Only check status if activity exists and is not completed/cancelled
    if (activity && !['Completed', 'Cancelled', 'Time Over'].includes(activity.status)) {
      // Check status every 30 seconds
      statusInterval = setInterval(() => {
        checkActivityStatus();
      }, 30000);
      
      setStatusCheckInterval(statusInterval);
    }
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [activity?.id, activity?.status, students.length]);

  // Initial status check when component is fully loaded
  useEffect(() => {
    if (activity && students.length > 0 && !isLoading) {
      // Perform initial status check after a short delay
      const initialStatusCheck = setTimeout(() => {
        // console.log('Performing initial status check');
        checkActivityStatus();
      }, 1000);
      
      return () => clearTimeout(initialStatusCheck);
    }
  }, [activity?.id, students.length, isLoading]);

  // Cleanup status checking interval when component unmounts
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, []);

  const fetchActivityDetails = async () => {
    setIsLoading(true);
    try {
      if (scheduleData && scheduleData.length > 0) {
        // Extract the first activity from the scheduleData array
        const activityData = scheduleData[0]; // Get the first element, not the whole array
        // console.log("Assessment Activity Data (single object):", activityData);
        // console.log("students", activityData.students);
        
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
          // Fallback to existing students array from the single activity
          const allStudents = activityData.students || [];
          setStudents(allStudents);
        } 
        
        setIsLoading(false);
        // console.log('Assessment Activity Data (processed):', activityData);
        // console.log('Batches:', activityData.batches);
        // console.log('Section Subject Activity ID:', activityData.section_subject_activity_id);
        
        // Check status immediately after loading activity details
        setTimeout(() => {
          checkActivityStatus();
        }, 500);
        
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

  const checkActivityStatus = async (showLoading = false) => {
    if(!activity) {
      // console.warn('No activity available for status check');
      return;
    }
    try {
      if (showLoading) {
        setIsCheckingStatus(true);
      }
      
      const sessionId = activity?.id;
      
      // If we don't have activity yet, skip status check
      if (!sessionId) {
        console.warn('No activity ID available for status check');
        return;
      }
      
      // Collect all student schedule IDs - try from scheduleData if students not populated yet
      let studentScheduleIds = students.map(student => student.schedule_id).filter(id => id);
      
      // Fallback: extract from scheduleData if students array is empty
      if (studentScheduleIds.length === 0 && scheduleData && scheduleData.length > 0) {
        studentScheduleIds = scheduleData.flatMap(schedule => 
          (schedule.students || []).map(student => student.schedule_id)
        ).filter(id => id);
      }
      
      if (studentScheduleIds.length === 0) {
        console.warn('No student schedule IDs available for status check');
        if (showLoading) {
          Alert.alert('Info', 'No student data available for status check');
        }
        return;
      }
      
      // console.log('Checking status with student schedule IDs:', studentScheduleIds);
      
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentScheduleIds,
          activityType: activity?.activity || activity?.session_type || 'Assessment'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // console.log('Status check response:', data);
      
      if (data.success && data.status !== activity?.status) {
        // console.log('Status changed from', activity?.status, 'to', data.status);
        setActivity(prev => ({
          ...prev,
          status: data.status
        }));
        
        // Show status change notification with session details
        if (showLoading) {
          const sessionDetails = data.session_details;
          let detailMessage = `Session status changed to: ${data.status}`;
          if (sessionDetails) {
            detailMessage += `\n\nSession Details:\nTotal sessions: ${sessionDetails.total_sessions}`;
            if (sessionDetails.status_breakdown && sessionDetails.status_breakdown.length > 1) {
              detailMessage += '\nStatus breakdown:';
              sessionDetails.status_breakdown.forEach(item => {
                detailMessage += `\n• ${item.status}: ${item.count} student(s)`;
              });
            }
          }
          Alert.alert('Status Updated', detailMessage);
        }
      } else if (showLoading && data.success) {
        const sessionDetails = data.session_details;
        let statusMessage = `Current status: ${data.status}`;
        if (sessionDetails) {
          statusMessage += `\n\nTotal sessions: ${sessionDetails.total_sessions}`;
          if (sessionDetails.status_breakdown && sessionDetails.status_breakdown.length > 1) {
            statusMessage += '\nStatus breakdown:';
            sessionDetails.status_breakdown.forEach(item => {
              statusMessage += `\n• ${item.status}: ${item.count} student(s)`;
            });
          }
        }
        Alert.alert('Status Check', statusMessage);
      }
    } catch (error) {
      console.error('Error checking activity status:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to check activity status');
      }
      // Don't show alert for automatic status check errors to avoid interrupting user
    } finally {
      if (showLoading) {
        setIsCheckingStatus(false);
      }
    }
  };

  const fetchMaterials = async () => {
    // console.log('Fetching materials for activity:', activity);
    
    if (!activity?.section_subject_activity_id) {
      Alert.alert('Error', 'Cannot fetch materials: missing activity information');
      return;
    }
    // console.log('Fetching materials for activity:', activity);
    
    setLoadingMaterials(true);
    try {
      const url = `${API_URL}/api/mentor/getTopicMaterials?section_subject_activity_id=${activity.section_subject_activity_id}${activity.topic_id ? `&topic_id=${activity.topic_id}${activity.batch_id ? `&batch_id=${activity.batch_id}` : ''}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // console.log('Fetched materials:', data.materials);
        
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
      // Construct the full URL
      const fullUrl = `${API_URL}${materialUrl}`;
      
      Alert.alert(
        'Download Material',
        `Do you want to download ${fileName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              try {
                await Linking.openURL(fullUrl);
              } catch (error) {
                Alert.alert('Error', 'Failed to open download link');
                console.error('Download error:', error);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download material');
      console.error('Download error:', error);
    }
  };

  const toggleBatch = (batchKey) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }));
  };

  const handleStartSession = async () => {
    try {
      const sessionId = activity?.id;
      
      // Collect all student schedule IDs
      const studentScheduleIds = students.map(student => student.schedule_id).filter(id => id);
      // console.log('Starting session with student schedule IDs:', studentScheduleIds);
      
      if (studentScheduleIds.length === 0) {
        Alert.alert('Error', 'No student schedule IDs found.');
        return;
      }
      
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/${activity.activity}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentScheduleIds })
      });
      
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'In Progress' }));
        setSessionTimestamps();
        Alert.alert('Success', `Session has been started for ${data.affectedRows} student(s).`);
        // Start status checking immediately after session starts
        checkActivityStatus();
      } else {
        Alert.alert('Error', data.message || 'Could not start the session.');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'An error occurred while starting the session.');
    }
  };

  const handleFinishSession = async () => {
    try {
      const sessionId = activity?.id;
      
      // Collect all student schedule IDs
      const studentScheduleIds = students.map(student => student.schedule_id).filter(id => id);
      // console.log('Finishing session with student schedule IDs:', studentScheduleIds);
      
      if (studentScheduleIds.length === 0) {
        Alert.alert('Error', 'No student schedule IDs found.');
        return;
      }
      
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/assessment/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentScheduleIds })
      });
      
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'Finished(need to update marks)' }));
        Alert.alert('Success', `Session has been finished for ${data.affectedRows} student(s).`);
      } else {
        Alert.alert('Error', data.message || 'Could not finish the session.');
      }
    } catch (error) {
      console.error('Error finishing session:', error);
      Alert.alert('Error', 'An error occurred while finishing the session.');
    }
  };

  const handleMarkChange = (roll, marks) => {
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], marks_obtained: marks, is_absent: false }
    }));
  };

  const handleToggleAbsent = (roll) => {
    const isCurrentlyAbsent = submissions[roll]?.is_absent;
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], is_absent: !isCurrentlyAbsent, marks_obtained: '' }
    }));
  };

  const openMarkModal = (student) => {
    setEditingStudent(student);
    setTempMarks(submissions[student.student_roll]?.marks_obtained || '');
    setShowMarkModal(true);

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

  const closeMarkModal = () => {
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
      setShowMarkModal(false);
      setEditingStudent(null);
      setTempMarks('');
    });
  };

  const confirmMarks = () => {
    if (editingStudent && tempMarks !== '') {
      if(isNaN(tempMarks) || Number(tempMarks) < 0 || Number(tempMarks) > 100) {
        Alert.alert('Invalid Marks', 'Please enter valid marks between 0 and 100.');
        return;
      }
      setSubmissions(prev => ({
        ...prev,
        [editingStudent.student_roll]: {
          ...prev[editingStudent.student_roll],
          marks_obtained: tempMarks,
          is_absent: false
        }
      }));
    }
    closeMarkModal();
  };

  const fillRandomMarks = () => {
    const activeStudents = students.filter(s => !s.has_approved_leave);
    if (activeStudents.length === 0) return;

    const newSubmissions = { ...submissions };
    let hasLowScore = false;

    // Fill random marks for all active students
    activeStudents.forEach((student, index) => {
      let marks;
      
      // Ensure at least one student gets below 48
      if (index === 0 && !hasLowScore) {
        marks = Math.floor(Math.random() * 47) + 1; // 1-47
        hasLowScore = true;
      } else {
        marks = Math.floor(Math.random() * 100) + 1; // 1-100
      }

      newSubmissions[student.student_roll] = {
        ...newSubmissions[student.student_roll],
        marks_obtained: marks.toString(),
        total_marks: '100',
        is_absent: false
      };
    });

    setSubmissions(newSubmissions);
    Alert.alert('Success', `Random marks filled for ${activeStudents.length} students (at least one below 48).`);
  };

  const handleCompleteSession = async () => {
    const pendingStudents = students.filter(s =>
      !s.has_approved_leave && !submissions[s.student_roll]?.marks_obtained
    );

    if (pendingStudents.length > 0) {
      Alert.alert(
        'Incomplete Assessment',
        `Please enter marks for ${pendingStudents.length} student(s).`
      );
      return;
    }

    // Collect all student schedule IDs
    const studentScheduleIds = students.map(student => student.schedule_id).filter(id => id);
    // console.log('Completing session with student schedule IDs:', studentScheduleIds);
    
    if (studentScheduleIds.length === 0) {
      Alert.alert('Error', 'No student schedule IDs found.');
      return;
    }

    // Add schedule_id to each student submission
    const studentSubmissions = Object.keys(submissions).map(roll => {
      const student = students.find(s => s.student_roll === roll);
      return {
        student_roll: roll,
        ...submissions[roll],
        schedule_id: student?.schedule_id
      };
    });
    
    // console.log('Student submissions with schedule IDs:', studentSubmissions);
    // console.log('Activity details for completion:', activity);
    
    try {
      const sessionId = activity?.id;
      const response = await fetch(`${API_URL}/api/mentor/activity/${sessionId}/assessment/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentSubmissions,
          studentScheduleIds,
          topic_id: activity?.topic_id || null
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSessionEndTimestamp(new Date().toISOString());
        Alert.alert('Success', `Assessment completed successfully for ${studentScheduleIds.length} student(s).`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Could not complete the assessment.');
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      Alert.alert('Error', 'An error occurred while saving marks.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return '#10B981';
      case 'Completed': return '#6B7280';
      case 'Not Started': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const renderStudentCard = (student, index) => {
    const submission = submissions[student.student_roll];
    const hasLeave = student.has_approved_leave;
    const hasMarks = submission?.marks_obtained && submission.marks_obtained !== '';
    
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
          ) : hasMarks ? (
            <View style={styles.performanceStatus}>
              <Text style={[styles.performanceText, { color: '#059669' }]}>
                {submission.marks_obtained}/{submission.total_marks}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openMarkModal(student)}
              >
                <Pencil width={wp('4%')} height={wp('4%')} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.performanceButtons}>
              <TouchableOpacity
                style={styles.markInputButton}
                onPress={() => openMarkModal(student)}
              >
                <Text style={styles.markInputButtonText}>Enter Marks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.absentButton, submission?.is_absent && styles.absentButtonActive]}
                onPress={() => handleToggleAbsent(student.student_roll)}
              >
                <Text style={[styles.absentButtonText, submission?.is_absent && styles.absentButtonTextActive]}>
                  Absent
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActionButton = () => {
    const completedCount = Object.values(submissions).filter(s => s?.marks_obtained || s?.is_absent).length;
    const totalStudents = students.filter(s => !s.has_approved_leave).length;

    switch (activity?.status) {
      case 'Not Started':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartSession}
          >
            <Text style={styles.actionButtonText}>Start Assessment</Text>
          </TouchableOpacity>
        );

      case 'In Progress':
        // const isComplete = completedCount >= totalStudents;
        return (
          <TouchableOpacity
            style={[
              styles.actionButton,
              // !isComplete && styles.actionButtonDisabled
            ]}
            onPress={handleFinishSession}
            // disabled={!isComplete}
          >
            <Text style={styles.actionButtonText}>
              Finish Assessment ({timeLeftString})
            </Text>
          </TouchableOpacity>
        );

      case 'Finished(need to update performance)':
        const isComplete1 = completedCount >= totalStudents;
        return (
          <TouchableOpacity
            style={[
              styles.actionButton,
              !isComplete1 && styles.actionButtonDisabled
            ]}
            onPress={handleCompleteSession}
            disabled={!isComplete1}
          >
            <Text style={styles.actionButtonText}>
              Complete Assessment {completedCount}/{totalStudents}
            </Text>
          </TouchableOpacity>
        );

      case 'Finished(need to update marks)':
        const isComplete2 = completedCount >= totalStudents;
        return (
          <View style={{ flexDirection: 'row', gap: wp('2%') }}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { flex: 1 },
                !isComplete2 && styles.actionButtonDisabled
              ]}
              onPress={handleCompleteSession}
              disabled={!isComplete2}
            >
              <Text style={styles.actionButtonText}>
                Complete Assessment {completedCount}/{totalStudents}
              </Text>
            </TouchableOpacity>
            
            {/* Random Marks Button for Testing */}
            {completedCount < totalStudents && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { 
                    backgroundColor: '#F59E0B', 
                    paddingHorizontal: wp('3%'),
                    minWidth: wp('25%')
                  }
                ]}
                onPress={fillRandomMarks}
              >
                <Text style={[styles.actionButtonText, { fontSize: wp('3%') }]}>
                  Fill Random Marks
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'Finish Session':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFinishSession}
          >
            <Text style={styles.actionButtonText}>
              Finish Session
            </Text>
          </TouchableOpacity>
        );

      // case 'Completed':
      //   return (
      //     <View style={[styles.actionButton, styles.actionButtonDisabled]}>
      //       <Text style={styles.actionButtonText}>Assessment Completed</Text>
      //     </View>
      //   );

      case 'Cancelled':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Assessment Cancelled</Text>
          </View>
        );

      case 'Time Over':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Assessment Time Over, cannot start</Text>
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
          <Text style={styles.emptyStateText}>Loading assessment details...</Text>
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

        <Text style={styles.headerText}>Assessment Session</Text>
      </View>

      {/* Status Section */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
      }}>
        <TouchableOpacity
          style={[
            styles.backButton, 
            { 
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: wp('2.5%')
            }
          ]}
          onPress={() => checkActivityStatus(true)}
          disabled={isCheckingStatus}
        >
          {isCheckingStatus ? (
            <ActivityIndicator size="small" color="#666666" />
          ) : (
            <Text style={{ fontSize: 14, marginRight: 4 }}>🔄</Text>
          )}
          <Text style={{ color: '#666666', fontSize: wp('3.2%'), fontWeight: '400' }}>
            Refresh
          </Text>
        </TouchableOpacity>
        
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
                <Text style={styles.academicText}>{activity?.session_type || 'Assessment'}</Text>
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
                No students found for this assessment.
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

      {/* Mark Entry Modal */}
      <Modal
        visible={showMarkModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeMarkModal}
      >
        <Pressable
          style={styles.modalOverlay}   
          onPress={closeMarkModal}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <Animated.View
              style={[
                styles.feedbackModal,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Enter Marks</Text>
                <Text style={styles.modalQuestion}>
                  {editingStudent
                    ? `Enter marks for ${editingStudent.student_name}`
                    : 'Enter student marks'
                  }
                </Text>
              </View>

              <View style={styles.markInputContainer}>
                <TextInput
                  style={styles.markInputField}
                  placeholder="Enter marks (e.g., 85)"
                  maxLength={3}
                  keyboardType="numeric"
                  value={tempMarks}
                  onChangeText={setTempMarks}
                  autoFocus={true}
                />
                <Text style={styles.totalMarksText}>out of 100</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !tempMarks && styles.actionButtonDisabled
                ]}
                onPress={confirmMarks}
                disabled={!tempMarks}
              >
                <Text style={styles.confirmButtonText}>
                  {editingStudent ? 'Update Marks' : 'Confirm Marks'}
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
        animationType="fade"
        onRequestClose={() => setShowMaterials(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.materialsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assessment Materials</Text>
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

            <ScrollView 
              style={styles.materialsContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp('2%') }}
            >
              {materials.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No materials found for this assessment.</Text>
                </View>
              ) : (
                materials.map((material, materialIndex) => (
                  <View key={materialIndex} style={styles.materialItem}>
                    <View style={styles.materialInfo}>
                      <Text style={styles.materialTitle}>{material.title}</Text>
                      <Text style={styles.materialType}>{material.material_type}</Text>
                      <Text style={styles.materialFileName}>{material.file_name}</Text>
                      {material.expected_date && (
                        <Text style={styles.materialDate}>
                          Expected: {new Date(material.expected_date).toLocaleDateString()}
                        </Text>
                      )}
                      {material.hierarchy && (
                        <Text style={styles.materialHierarchy}>{material.hierarchy}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadMaterial(material.file_url, material.file_name)}
                    >
                      <Text style={styles.downloadButtonText}>📥</Text>
                    </TouchableOpacity>
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

export default MentorDashboardAssessment;