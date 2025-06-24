// CoordinatorLogs.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Linking } from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Logs/Back.svg';
import Phone from '../../../assets/CoordinatorPage/Logs/Phone.svg';
import MessageSquare from '../../../assets/CoordinatorPage/Logs/MessageSquare.svg';
import Clock from '../../../assets/CoordinatorPage/Logs/Clock.svg';
const Staff = require('../../../assets/CoordinatorPage/MentorList/staff.png');
import styles from './LogsStyle';
import { API_URL } from '../../../utils/env.js';
import { formatDate } from 'date-fns';

const CoordinatorLogs = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [overdueClasses, setOverdueClasses] = useState([]);
  const [overdueLevels, setOverdueLevels] = useState([]);
  const [requestedAssessments, setRequestedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogsData();
  }, []);

  const fetchLogsData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [classesRes, levelsRes, assessmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/coordinator/getOverdueClasses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id })
        }),
        fetch(`${API_URL}/api/coordinator/getOverdueStudentLevels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id })
        }),
        fetch(`${API_URL}/api/coordinator/getRequestedAssessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id })
        })
      ]);

      const classesData = await classesRes.json();
      const levelsData = await levelsRes.json();
      const assessmentsData = await assessmentsRes.json();

      if (classesData.success) setOverdueClasses(classesData.overdueClasses);
      if (levelsData.success) setOverdueLevels(levelsData.overdueLevels);
      if (assessmentsData.success) setRequestedAssessments(assessmentsData.requestedAssessments);

    } catch (error) {
      console.error('Error fetching logs data:', error);
      Alert.alert('Error', 'Failed to fetch logs data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAssessment = async (requestId, action) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/processAssessmentRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.message);
        fetchLogsData(); // Refresh data
      } else {
        Alert.alert('Error', data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing assessment:', error);
      Alert.alert('Error', 'Failed to process assessment request');
    }
  };
  const handleAssignTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/assignTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdueId: id })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.message);
        fetchLogsData(); // Refresh data
      } else {
        Alert.alert('Error', data.message || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      Alert.alert('Error', 'Failed to assign task');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${ampm}`;
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Staff;
    }
  };

  const handleCallPress = (phone) => {
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phone}`);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Alerts</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Overdue Classes Section */}
          {overdueClasses.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overdue Classes</Text>
            </View>
          )}
          {overdueClasses.map((cls, index) => (
            <View key={`class-${index}`} style={styles.alertCard}>
              <View style={styles.alertCardContent}>
                <View>
                  <Text style={styles.teacherName}>{cls.mentor_name}</Text>
                  <Text style={styles.subjectText}>
                    {cls.grade_name} - {cls.section_name} - {cls.subject_name}
                  </Text>
                  <Text style={styles.warningText}>Class not started!</Text>
                </View>
                <View style={styles.alertActions}>
                  <View style={styles.timeDisplay}>
                    <Clock width={16} height={16} style={styles.timeIcon} />
                    <Text style={styles.timeText}>
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </Text>
                  </View>
                  <View style={styles.actionButtons1}>
                    <TouchableOpacity style={styles.actionButtonCall} onPress={() => handleCallPress(cls.mentor_phone)}>
                      <Phone width={15} height={15} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonMsg}>
                      <MessageSquare width={18} height={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Overdue Levels Section */}
          {overdueLevels.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overdue Student Levels</Text>
            </View>
          )}
          {overdueLevels.map((level, index) => (
            <View key={`level-${index}`} style={styles.studentCard}>
              <View style={styles.studentCardContent}>
                <View style={styles.studentInfo}>
                  {level.profile_photo ? (
                    <Image source={getProfileImageSource(level.profile_photo)} style={styles.avatar} />
                  ) : (
                    <Image source={Staff} style={styles.avatar} />
                  )}
                  <View>
                    <Text style={styles.studentLabel}>Student</Text>
                    <Text style={styles.studentId}>{level.student_roll}</Text>
                    <Text style={styles.assessmentText}>
                      {level.subject_name} - Level {level.level}
                    </Text>
                  </View>
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{level.grade_name} - {level.section_name}</Text>
                  <Text style={styles.daysRemaining}>
                    {new Date(level.updated_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.mentorSection}>
                <View style={styles.mentorDetails}>
                  <Text style={styles.mentorLabel}>Mentor</Text>
                  <Text style={styles.mentorId}>{level.mentor_roll}</Text>
                </View>
                <View style={styles.actionButtons2}>
                  <TouchableOpacity style={styles.actionButtonCall} onPress={() => handleCallPress(level.mentor_phone)}>
                    <Phone width={15} height={15} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonMsg}>
                    <MessageSquare width={18} height={18} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.assignTaskButton} onPress={() => handleAssignTask(level.id)}>
                <Text style={styles.buttonText}>Assign task</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Requested Assessments Section */}
          {requestedAssessments.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Requested Assessments</Text>
            </View>
          )}
          {requestedAssessments.map((assessment, index) => (
            <View key={`assessment-${index}`} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.teacherInfo}>
                  {assessment.file_path ? (
                    <Image source={getProfileImageSource(assessment.file_path)} style={styles.avatar} />
                  ) : (
                    <Image source={Staff} style={styles.avatar} />
                  )}
                  <View>
                    <Text style={styles.teacherName}>{assessment.mentor_name}</Text>
                    <Text style={styles.teacherId}>{assessment.mentor_roll}</Text>
                  </View>
                </View>
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>Requested</Text>
                </View>
              </View>
              <View style={styles.classDetails}>
                <Text style={styles.className}>{assessment.grade_name} - {assessment.section_name}</Text>
                <Text style={styles.classSubject}>{assessment.subject_name}</Text>
                <View style={styles.timeAndStudents}>
                  <View style={styles.sessionTime}>
                    <Clock width={16} height={16} style={styles.timeIconSmall} />
                    <View>
                      <Text style={styles.sessionTimeText}>
                        {formatTime(assessment.start_time)} - {formatTime(assessment.end_time)}
                      </Text>
                      <Text style={{color:'green'}}>
                        {new Date(assessment.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.studentCount}>{assessment.student_count} Students</Text>
                </View>
              </View>
              <View style={styles.levelTags}>
                {assessment.levels.split(',').map((level, i) => (
                  <View key={`level-${i}`} style={styles.levelTag}>
                    <Text style={styles.levelTagText}>Level {level}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.assessmentRequestText}>Assessment request</Text>
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleProcessAssessment(assessment.id, 'cancel')}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleProcessAssessment(assessment.id, 'confirm')}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default CoordinatorLogs;