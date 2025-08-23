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
const Staff = require('../../../../assets/MentorPage/User.svg');

const MentorDashboardAcademics = ({ navigation, route }) => {
  const { activityId, subject, grade, section_name, startTime, endTime, duration } = route.params;
  
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

  // Mock levels for demonstration
  // const levels = ['Level 1', 'Level 2', 'Level 3'];

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  useEffect(() => {
    if (students.length > 0) {
      const initialPerformances = students.reduce((acc, student) => {
        acc[student.roll] = student.has_approved_leave ? 'Absent' : null;
        return acc;
      }, {});
      setPerformances(initialPerformances);
    }
  }, [students]);

  // Simulate session progress
  useEffect(() => {
    if (activity?.status === 'In Progress') {
      const interval = setInterval(() => {
        setSessionProgress(prev => Math.min(prev + 1, 100));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activity?.status]);

  const fetchActivityDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/academic`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setStudents(data.students);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch activity details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/start`, { 
        method: 'POST' 
      });
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'In Progress' }));
        Alert.alert('Success', 'Session has been started.');
      } else {
        Alert.alert('Error', data.message || 'Could not start the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const handleCompleteSession = async () => {
    const pendingStudents = students.filter(s => 
      !s.has_approved_leave && !performances[s.roll]
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

    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/academic/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentPerformances }),
      });
      const data = await response.json();
      if (data.success) {
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
    setSelectedFeedback(student ? performances[student.roll] || '' : '');
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
        [editingStudent.roll]: selectedFeedback
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
    const performance = performances[student.roll];
    const hasLeave = student.has_approved_leave;

    return (
      <View
        key={student.roll}
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
          <Text style={styles.profileName}>{student.name}</Text>
          <Text style={styles.profileId}>{student.roll}</Text>
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
                    [student.roll]: option.key
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
          <TouchableOpacity 
            style={[
              styles.actionButton,
              !isComplete && styles.actionButtonDisabled
            ]}
            onPress={handleCompleteSession}
            disabled={!isComplete}
          >
            <Text style={styles.actionButtonText}>
              Complete Session ({completedCount}/{totalStudents})
            </Text>
          </TouchableOpacity>
        );
        
      case 'Completed':
        return (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Session Completed</Text>
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
            <Text style={styles.subject}>{subject}</Text>
            <View style={styles.sessionMeta}>
              <Text style={styles.gradeText}>
                Grade {grade} - {section_name}
              </Text>
              <View style={styles.academicBadge}>
                <Text style={styles.academicText}>Academic</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {startTime} - {endTime}
            </Text>
            {duration && (
              <Text style={styles.durationText}>{duration}</Text>
            )}
          </View>
        </View>

        {/* Progress Bar for In Progress Sessions */}
        {activity?.status === 'In Progress' && (
          <View style={{ marginTop: hp('2%') }}>
            <View style={styles.progressContainer}>
              <View 
                style={[styles.progressBar, { width: `${sessionProgress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              Session Progress: {sessionProgress}%
            </Text>
          </View>
        )}

        {/* Level Selection */}
        {/* <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Select Level:</Text>
          <View style={styles.levelRow}>
            {levels.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelBtn,
                  selectedLevel === level && styles.levelBtnActive
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text 
                  style={[
                    styles.levelText,
                    selectedLevel === level && styles.levelTextActive
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}
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
          ) : (
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
                <Text style={styles.modalTitle}>
                  {editingStudent ? 'Edit Performance' : 'Mark Performance'}
                </Text>
                <Text style={styles.modalQuestion}>
                  {editingStudent 
                    ? `How was ${editingStudent.name}'s performance?`
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
    </SafeAreaView>
  );
};

export default MentorDashboardAcademics; 