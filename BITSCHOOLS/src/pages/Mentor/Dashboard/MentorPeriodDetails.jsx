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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../utils/ApiService';
import { API_URL } from '../../../config/env';
import { StyleSheet } from 'react-native';

const Staff = require('../../../assets/General/staff.png');

const MentorPeriodDetails = ({ route, navigation }) => {
  const { facultyCalendarId, sessionData } = route.params;

  const [sessionDetails, setSessionDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [attentivenessOptions, setAttentivenessOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionInstanceId, setSessionInstanceId] = useState(null);
  
  // Evaluation states
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showEarlyCompletionModal, setShowEarlyCompletionModal] = useState(false);
  const [earlyCompletionReason, setEarlyCompletionReason] = useState('');
  const [studentEvaluations, setStudentEvaluations] = useState({});

  useEffect(() => {
    fetchSessionDetails();
    fetchStudents();
  }, []);

  const fetchSessionDetails = async () => {
    try {
      const data = await ApiService.post('/mentor/getSessionDetails', {
        facultyCalendarId: facultyCalendarId
      });

      if (data.success) {
        setSessionDetails(data.sessionDetails);
        if (data.sessionDetails.session_instance_id) {
          setSessionInstanceId(data.sessionDetails.session_instance_id);
          setSessionStarted(data.sessionDetails.session_status === 'running');
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      Alert.alert('Error', 'Failed to fetch session details');
    } finally {
      setLoading(false);
    }
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
    try {
      setLoading(true);
      const data = await ApiService.post('/mentor/startSession', {
        facultyCalendarId: facultyCalendarId
      });

      if (data.success) {
        setSessionStarted(true);
        setSessionInstanceId(data.sessionInstanceId);
        Alert.alert('Success', 'Session started successfully');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = () => {
    // Check if session ended before scheduled end time
    const now = new Date();
    const endTime = new Date();
    const [hours, minutes] = sessionDetails.end_time.split(':');
    endTime.setHours(parseInt(hours), parseInt(minutes), 0);

    if (now < endTime) {
      setShowEarlyCompletionModal(true);
    } else {
      setShowEndSessionModal(true);
    }
  };

  const confirmEndSession = async () => {
    try {
      setLoading(true);

      // Prepare evaluations array based on evaluation mode
      const evaluations = Object.values(studentEvaluations)
        .filter(evalu => evalu.isPresent) // Only include present students
        .map(evalu => ({
          studentId: evalu.studentId,
          marksObtained: sessionDetails.requires_marks ? evalu.marksObtained : null,
          attentivenessId: sessionDetails.requires_attentiveness ? evalu.attentivenessId : null,
          malpracticeFlag: sessionDetails.allows_malpractice ? evalu.malpracticeFlag : 0,
          remarks: evalu.remarks || null,
        }));

      const data = await ApiService.post('/mentor/endSession', {
        facultyCalendarId: facultyCalendarId,
        studentEvaluations: evaluations,
        earlyCompletionReason: earlyCompletionReason || null,
      });

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
      setShowEarlyCompletionModal(false);
    }
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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
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

          {sessionDetails.topic_name && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="book-open-variant" size={20} color="#64748B" />
              <Text style={styles.infoText}>{sessionDetails.topic_name}</Text>
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
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <MaterialCommunityIcons name="play-circle" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        )}

        {sessionStarted && sessionDetails.session_status !== 'completed' && (
          <>
            {/* Students List with Evaluation */}
            <View style={styles.studentsSection}>
              <Text style={styles.sectionTitle}>Students ({students.length})</Text>

              {students.map((student, index) => (
                <View key={student.id} style={styles.studentCard}>
                  <View style={styles.studentHeader}>
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
                      {/* Marks Input */}
                      {sessionDetails.requires_marks && (
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

                      {/* Attentiveness Selector */}
                      {sessionDetails.requires_attentiveness && (
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

                      {/* Malpractice Flag */}
                      {sessionDetails.allows_malpractice && (
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
                              color="#3B82F6"
                            />
                            <Text style={styles.checkboxLabel}>Malpractice Detected</Text>
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

            <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
              <MaterialCommunityIcons name="stop-circle" size={24} color="#FFFFFF" />
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
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
              Session is ending before scheduled time. Please provide a reason:
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
                  setShowEndSessionModal(true);
                }}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  sessionInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
  },
  evaluationBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  evaluationBadgeText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  endButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  studentRoll: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  studentBatch: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  presenceButton: {
    padding: 8,
  },
  absentButton: {
    opacity: 0.8,
  },
  evaluationInputs: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  attentivenessButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attentivenessButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attentivenessButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  attentivenessButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  attentivenessButtonTextActive: {
    color: '#1E40AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MentorPeriodDetails;
