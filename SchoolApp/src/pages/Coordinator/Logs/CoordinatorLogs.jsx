import { apiFetch } from "../../../utils/apiClient.js";
// CoordinatorLogs.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Linking, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Logs/Back.svg';
import Phone from '../../../assets/CoordinatorPage/Logs/Phone.svg';
import MessageSquare from '../../../assets/CoordinatorPage/Logs/MessageSquare.svg';
import Clock from '../../../assets/CoordinatorPage/Logs/Clock.svg';
const Staff = require('../../../assets/CoordinatorPage/MentorList/staff.png');
import styles from './LogsStyle';
import { API_URL } from '../../../utils/env.js';
import { formatDate } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';


// Add styles for the dropdown sections
const additionalStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropdownIcon: {
    fontSize: 18,
    color: '#555',
  },
});

// Overdue Class Card Component
const OverdueClassCard = ({ cls, formatTime, handleCallPress }) => {
  const [showStudents, setShowStudents] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started': return '#FF6B6B';
      case 'Time Over': return '#FF9500';
      default: return '#FF6B6B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Not Started': return 'Class not started!';
      case 'Time Over': return 'Time is over!';
      default: return 'Class not started!';
    }
  };

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertCardContent}>
        <View>
          <Text style={styles.teacherName}>{cls.mentor_name}</Text>
          <Text style={styles.subjectText}>
            {cls.grade_name} - {cls.section_name} - {cls.subject_name}
          </Text>
          {cls.batch_name && (
            <Text style={styles.batchText}>Batch: {cls.batch_name}</Text>
          )}
          <Text style={[styles.warningText, { color: getStatusColor(cls.status) }]}>
            {getStatusText(cls.status)}
          </Text>
          <Text style={styles.sessionTypeText}>
            {cls.session_type} Session
          </Text>
        </View>
        <View style={styles.alertActions}>
          <View style={styles.timeDisplay}>
            <MaterialCommunityIcons name="clock-outline" color="#000" size={16} />
            <Text style={styles.timeText}>
              {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
            </Text>
          </View>
          <View style={styles.timeDisplay}>
            <MaterialCommunityIcons name="calendar-range" color="#000" size={20} />
            <Text style={styles.timeText}>
              {cls.date ? formatDate(new Date(cls.date), 'dd/MM/yyyy') : ''}
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

      {/* Students Section */}
      {cls.students && cls.students.length > 0 && (
        <View style={styles.studentsSection}>
          <TouchableOpacity
            style={styles.studentsToggle}
            onPress={() => setShowStudents(!showStudents)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.studentsToggleText}>
                Students ({cls.students.length})
              </Text>
              {showStudents ?
                <Ionicons name="caret-down-outline" color="#000" size={18} /> :
                <Ionicons name="caret-forward-outline" color="#000" size={18} />
              }
            </View>
          </TouchableOpacity>

          {showStudents && (
            <View style={styles.studentsList}>
              {cls.students.map((student, index) => (
                <View key={index} style={styles.studentItem}>
                  <Text style={styles.studentRoll}>{student.roll}</Text>
                  <Text style={styles.studentName}>{student.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Failed Assessment Student Card Component
const FailedAssessmentCard = ({ student, formatTime, handleCallPress, getProfileImageSource, handleChangeECA, handleEditSchedule, handleChangeBatch, Staff }) => {
  return (
    <View style={styles.failedStudentCard}>
      <View style={styles.studentCardContent}>
        <View style={styles.studentInfo}>
          {student.profile_photo ? (
            <Image source={getProfileImageSource(student.profile_photo)} style={styles.avatar} />
          ) : (
            <Image source={Staff} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.studentLabel}>{student.student_name}</Text>
            <Text style={styles.studentId}>{student.student_roll}</Text>
            {/* <Text style={styles.studentName}>{student.student_name}</Text> */}
            <Text style={styles.assessmentText}>
              {student.subject_name} - {student.grade_name} {student.section_name}
            </Text>
            {student.batch_name && (
              <Text style={styles.batchText}>Batch: {student.batch_name} {'\n'} (Level {student.batch_level})</Text>
            )}
          </View>
        </View>
        <View style={styles.assessmentInfo}>
          <Text style={styles.failedLabel}>Assessment Failed</Text>
          <Text style={styles.scoreText}>
            Score: {student.obtained_mark}/{student.total_marks} ({student.percentage}%)
          </Text>
          <Text style={styles.rankText}>Rank: {student.rank}</Text>
          <Text style={styles.dateText}>
            Assessment date: {student.assessment_date ? new Date(student.assessment_date).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>

      {/* Topic Hierarchy Section */}
      {student.topic_hierarchy_path && (
        <View style={styles.topicSection}>
          <Text style={styles.topicLabel}>Topic Hierarchy:</Text>
          <Text style={styles.topicPath}>{student.topic_hierarchy_path}</Text>
        </View>
      )}

      {/* Mentor Section */}
      {student.mentor_name && (
        <View style={styles.mentorSection}>
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorLabel}>Mentor</Text>
            <Text style={styles.mentorId}>{student.mentor_roll}</Text>
            <Text style={styles.mentorName}>{student.mentor_name}</Text>
          </View>
          <View style={styles.actionButtons2}>
            <TouchableOpacity style={styles.actionButtonCall} onPress={() => handleCallPress(student.mentor_phone)}>
              <Phone width={15} height={15} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonMsg}>
              <MessageSquare width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.failedStudentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.changeECAButton]}
          onPress={() => handleChangeECA(student)}
        >
          <Text style={styles.actionButtonText}>Change ECA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editScheduleButton]}
          onPress={() => handleEditSchedule(student)}
        >
          <Text style={styles.actionButtonText}>Edit Student Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.changeBatchButton]}
          onPress={() => handleChangeBatch(student)}
        >
          <Text style={styles.actionButtonText}>Change Batch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CoordinatorLogs = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [overdueClasses, setOverdueClasses] = useState([]);
  const [overdueLevels, setOverdueLevels] = useState([]);
  const [requestedAssessments, setRequestedAssessments] = useState([]);
  const [failedAssessments, setFailedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [grades, setGrades] = useState([]);
  const [activeGrade, setActiveGrade] = useState(null);
  const [failedStudents, setFailedStudents] = useState([]);
  // State for tracking expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState({
    overdueClasses: true,
    overdueLevels: true,
    requestedAssessments: true,
    failedAssessments: true
  });

  // Toggle function for expanding/collapsing sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    fetchLogsData();
  }, [grades, activeGrade]);

  const fetchLogsData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      // Fetch all data in parallel
      const [classesRes, levelsRes, assessmentsRes, failedStudentRes] = await Promise.all([
        apiFetch(`/coordinator/getOverdueClasses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id, gradeId: activeGrade })
        }),
        apiFetch(`/coordinator/getOverdueStudentLevels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id, gradeId: activeGrade })
        }),
        apiFetch(`/coordinator/getRequestedAssessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id, gradeId: activeGrade })
        }),
        apiFetch(`/coordinator/getScheduleAssessmentFailedStudents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinatorId: coordinatorData.id, gradeId: activeGrade })
        })
      ]);

      const classesData = await classesRes.json();
      const levelsData = await levelsRes.json();
      const assessmentsData = await assessmentsRes.json();
      const failedStudentsData = await failedStudentRes.json();

      if (classesData.success) setOverdueClasses(classesData.overdueClasses);
      if (levelsData.success) setOverdueLevels(levelsData.overdueLevels);
      if (assessmentsData.success) setRequestedAssessments(assessmentsData.requestedAssessments);
      if (failedStudentsData.success) setFailedStudents(failedStudentsData.failedStudents);

    } catch (error) {
      console.error('Error fetching logs data:', error);
      Alert.alert('Error', 'Failed to fetch logs data');
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogsData(true);
    setRefreshing(false);
  };

  const handleProcessAssessment = async (requestId, action) => {
    try {
      const response = await apiFetch(`/coordinator/processAssessmentRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });

      const data = response
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
      const response = await apiFetch(`/coordinator/assignTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdueId: id })
      });

      const data = response
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

  // Action handlers for failed assessment students
  const handleChangeECA = (student) => {
    Alert.alert(
      'Change ECA',
      `Change Extra Curricular Activity for ${student.student_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change', onPress: () => {
            // Navigate to ECA change screen or implement the logic
            console.log('Change ECA for:', student.student_roll);
          }
        }
      ]
    );
  };

  const handleEditSchedule = (student) => {
    // Navigate to student schedule editing
    navigation.navigate('CoordinatorStudentSchedule', {
      coordinatorData: coordinatorData,
      studentRoll: student.student_roll,
      sectionId: student.section_id,
      subjectId: student.subject_id
    });
  };

  const handleChangeBatch = (student) => {
    Alert.alert(
      'Change Batch',
      `Change batch for ${student.student_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change', onPress: () => {
            // Navigate to batch change screen or implement the logic
            console.log('Change batch for:', student.student_roll);
          }
        }
      ]
    );
  };

  const fetchGrade = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/coordinator/getCoordinatorGrades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId: coordinatorData.id })
      });

      const data = response
      if (data.success) {
        setGrades(data.coordinatorGrades);
        if (data.coordinatorGrades.length > 0) {
          setActiveGrade(data.coordinatorGrades[0].id);
        }
        setLoading(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch grades');
      }
    }
    catch (error) {
      console.error('Error fetching grades:', error);
      Alert.alert('Error', 'Failed to fetch grades');
    }
  }

  useEffect(() => {
    if (coordinatorData.id) {
      fetchGrade();
    }
  }, [coordinatorData]);

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

  // Section Header Component
  const SectionHeader = ({ title, isExpanded, onToggle, count }) => (
    <TouchableOpacity style={additionalStyles.sectionHeader} onPress={onToggle}>
      <View style={additionalStyles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count > 0 && (
          <View style={additionalStyles.countBadge}>
            <Text style={additionalStyles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <Text style={additionalStyles.dropdownIcon}>{isExpanded ? <Ionicons name="caret-down-outline" color="#000" size={24} /> : <Ionicons name="caret-forward-outline" color="#000" size={24} />}</Text>
    </TouchableOpacity>
  );

  // No Data Component
  const NoDataComponent = () => (
    <View style={styles.noDataContainer}>
      <View style={styles.noDataIconContainer}>
        <MaterialCommunityIcons name="clipboard-text-outline" color="#555" size={50} />
      </View>
      <Text style={styles.noDataTitle}>No Alerts Found</Text>
      <Text style={styles.noDataMessage}>
        Great! There are currently no overdue classes, student levels, or assessment requests that need your attention.
      </Text>
      <LottieView
        source={require('../../../assets/Genreal/lottie_noData.json')}
        autoPlay
        loop
        speed={0.5}
      />
    </View>
  );

  // Check if there's any data to display
  const hasAnyData = overdueClasses.length > 0 || overdueLevels.length > 0 || requestedAssessments.length > 0 || failedStudents.length > 0;

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
      >
        {grades?.map(grade => (
          <TouchableOpacity
            key={grade.grade_id}
            style={[styles.sectionTab, activeGrade === grade.grade_id && styles.activeSectionTab]}
            onPress={() => setActiveGrade(grade.grade_id)}
          >
            <Text style={[styles.sectionTabText, activeGrade === grade.grade_id && styles.activeSectionTabText]}>
              Grade {grade.grade_id}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../../assets/Genreal/lottie_loading.json')}
            autoPlay
            loop
          />
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading...</Text>
        </View>
      ) : hasAnyData ? (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']} // Android
              tintColor={'#007AFF'} // iOS
            />
          }
        >
          {/* Overdue Classes Section */}
          {overdueClasses.length > 0 && (
            <>
              <SectionHeader
                title="Overdue Classes"
                isExpanded={expandedSections.overdueClasses}
                onToggle={() => toggleSection('overdueClasses')}
                count={overdueClasses.length}
              />
              {expandedSections.overdueClasses && overdueClasses.map((cls, index) => (
                <OverdueClassCard key={`class-${index}`} cls={cls} formatTime={formatTime} handleCallPress={handleCallPress} styles={styles} />
              ))}
            </>
          )}

          {/* Overdue Levels Section */}
          {overdueLevels.length > 0 && (
            <>
              <SectionHeader
                title="Overdue Student Levels"
                isExpanded={expandedSections.overdueLevels}
                onToggle={() => toggleSection('overdueLevels')}
                count={overdueLevels.length}
              />
              {expandedSections.overdueLevels && overdueLevels.map((level, index) => (
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
            </>
          )}

          {/* Requested Assessments Section */}
          {requestedAssessments.length > 0 && (
            <>
              <SectionHeader
                title="Requested Assessments"
                isExpanded={expandedSections.requestedAssessments}
                onToggle={() => toggleSection('requestedAssessments')}
                count={requestedAssessments.length}
              />
              {expandedSections.requestedAssessments && requestedAssessments.map((assessment, index) => (
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
                          <Text style={{ color: 'green' }}>
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
            </>
          )}

          {/* Failed Assessment Students Section */}
          {failedStudents.length > 0 && (
            <>
              <SectionHeader
                title="Failed Assessment Students"
                isExpanded={expandedSections.failedAssessments}
                onToggle={() => toggleSection('failedAssessments')}
                count={failedStudents.length}
              />
              {expandedSections.failedAssessments && failedStudents.map((student, index) => (
                <FailedAssessmentCard
                  key={`failed-${index}`}
                  student={student}
                  formatTime={formatTime}
                  handleCallPress={handleCallPress}
                  getProfileImageSource={getProfileImageSource}
                  handleChangeECA={handleChangeECA}
                  handleEditSchedule={handleEditSchedule}
                  handleChangeBatch={handleChangeBatch}
                  Staff={Staff}
                  styles={styles}
                />
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']} // Android
              tintColor={'#007AFF'} // iOS
            />
          }
        >
          <NoDataComponent />
        </ScrollView>
      )}
    </View>
  );
};

export default CoordinatorLogs;