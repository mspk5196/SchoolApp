import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header } from '../../../../components';
import ApiService from '../../../../utils/ApiService';

const StudentScheduleView = ({ navigation, route }) => {
  const [viewMode, setViewMode] = useState('section'); // 'section' or 'student'
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [venues, setVenues] = useState([]);
  const [contextActivities, setContextActivities] = useState([]);
  const [topics, setTopics] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    studentIds: [],
    subjectId: '',
    mentorId: '',
    contextActivityId: '',
    topicId: '',
    taskDescription: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    venueId: '',
    evaluationMode: 'none',
    totalMarks: '',
    scheduleType: 'class_session',
    status: 'scheduled',
    attendance: '',
    remarks: '',
  });


  useEffect(() => {
    fetchGrades();
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSections();
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSection) {
      fetchStudents();
      fetchSubjects();
    }
  }, [selectedSection]);

  useEffect(() => {
    if (formData.subjectId && selectedSection) {
      fetchContextActivities();
      fetchMentors();
    }
  }, [formData.subjectId, selectedSection]);

  useEffect(() => {
    if (formData.contextActivityId) {
      fetchTopics();
    }
  }, [formData.contextActivityId]);

  useEffect(() => {
    if (viewMode === 'section' && selectedGrade && selectedSection && selectedDate) {
      fetchSchedules();
    } else if (viewMode === 'student' && selectedStudent && selectedDate) {
      fetchSchedules();
    }
  }, [viewMode, selectedGrade, selectedSection, selectedStudent, selectedDate]);

  const fetchGrades = async () => {
    try {
      const response = await ApiService.makeRequest('/general/getGrades', { method: 'GET' });
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
        if (data.data.length > 0) {
          setSelectedGrade(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const fetchSections = async () => {
    try {
      const response = await ApiService.makeRequest('/general/getGradeSections', {
        method: 'POST',
        body: JSON.stringify({ gradeID: selectedGrade }),
      });
      const data = await response.json();
      if (data.success) {
        setSections(data.data);
        if (data.data.length > 0) {
          setSelectedSection(data.data[0].section_id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to load sections');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/schedule/student/get-students', {
        method: 'POST',
        body: JSON.stringify({ sectionId: selectedSection }),
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/getSectionSubjects', {
        method: 'POST',
        body: JSON.stringify({ sectionId: selectedSection }),
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.gradeSubjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/enrollment/getAllVenues', {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success) {
        setVenues(data.data);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchContextActivities = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/topic/getActivitiesForSubject', {
        method: 'POST',
        body: JSON.stringify({
          sectionId: selectedSection,
          subjectId: formData.subjectId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setContextActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/schedule/student/get-topics', {
        method: 'POST',
        body: JSON.stringify({ contextActivityId: formData.contextActivityId }),
      });
      const data = await response.json();
      if (data.success) {
        setTopics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/schedule/student/get-mentors', {
        method: 'POST',
        body: JSON.stringify({
          sectionId: selectedSection,
          subjectId: formData.subjectId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMentors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const payload = {
        date: selectedDate.toISOString().split('T')[0],
      };

      if (viewMode === 'section') {
        payload.gradeId = selectedGrade;
        payload.sectionId = selectedSection;
      } else {
        payload.studentId = selectedStudent;
      }

      const response = await ApiService.makeRequest('/coordinator/schedule/student/get', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!formData.subjectId || !formData.date || !formData.startTime || !formData.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.studentIds.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.makeRequest('/coordinator/schedule/student/create', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          gradeId: selectedGrade,
          sectionId: selectedSection,
          date: formData.date.toISOString().split('T')[0],
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.message);
        setShowAddModal(false);
        resetForm();
        fetchSchedules();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule) return;

    try {
      setLoading(true);
      const response = await ApiService.makeRequest('/coordinator/schedule/student/update', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: editingSchedule.id,
          ...formData,
          date: formData.date.toISOString().split('T')[0],
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Schedule updated successfully');
        setShowEditModal(false);
        setEditingSchedule(null);
        resetForm();
        fetchSchedules();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      Alert.alert('Error', 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await ApiService.makeRequest('/coordinator/schedule/student/delete', {
              method: 'POST',
              body: JSON.stringify({ scheduleId }),
            });
            const data = await response.json();
            if (data.success) {
              Alert.alert('Success', 'Schedule deleted successfully');
              fetchSchedules();
            } else {
              Alert.alert('Error', data.message);
            }
          } catch (error) {
            console.error('Error deleting schedule:', error);
            Alert.alert('Error', 'Failed to delete schedule');
          }
        },
      },
    ]);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      studentIds: [schedule.student_id],
      subjectId: schedule.subject_id || '',
      mentorId: schedule.mentor_id || '',
      contextActivityId: schedule.context_activity_id || '',
      topicId: schedule.section_activity_topic_id || '',
      taskDescription: schedule.task_description || '',
      date: new Date(schedule.date),
      startTime: schedule.start_time || '09:00',
      endTime: schedule.end_time || '10:00',
      venueId: schedule.venue_id || '',
      evaluationMode: schedule.evaluation_mode || 'none',
      totalMarks: schedule.total_marks?.toString() || '',
      scheduleType: schedule.schedule_type || 'class_session',
      status: schedule.status || 'scheduled',
      attendance: schedule.attendance || '',
      remarks: schedule.remarks || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      studentIds: [],
      subjectId: '',
      mentorId: '',
      contextActivityId: '',
      topicId: '',
      taskDescription: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      venueId: '',
      evaluationMode: 'none',
      totalMarks: '',
      scheduleType: 'class_session',
      status: 'scheduled',
      attendance: '',
      remarks: '',
    });
  };

  const renderScheduleItem = (schedule) => (
    <View key={schedule.id} style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTime}>
          {schedule.start_time} - {schedule.end_time}
        </Text>
        <View style={styles.scheduleActions}>
          <TouchableOpacity onPress={() => openEditModal(schedule)} style={styles.actionButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteSchedule(schedule.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'section' && (
        <Text style={styles.scheduleStudent}>
          {schedule.student_roll} - {schedule.student_name}
        </Text>
      )}

      <Text style={styles.scheduleSubject}>{schedule.subject_name}</Text>

      {schedule.venue_name && <Text style={styles.scheduleDetail}>Venue: {schedule.venue_name}</Text>}
      {schedule.mentor_name && <Text style={styles.scheduleDetail}>Mentor: {schedule.mentor_name}</Text>}
      {schedule.activity_name && <Text style={styles.scheduleDetail}>Activity: {schedule.activity_name}</Text>}
      {schedule.topic_name && <Text style={styles.scheduleDetail}>Topic: {schedule.topic_name}</Text>}
      {schedule.task_description && (
        <Text style={styles.scheduleDescription}>{schedule.task_description}</Text>
      )}

      <View style={styles.scheduleMeta}>
        <Text style={styles.scheduleMetaText}>Type: {schedule.schedule_type}</Text>
        <Text style={styles.scheduleMetaText}>Status: {schedule.status}</Text>
        {schedule.attendance && <Text style={styles.scheduleMetaText}>Attendance: {schedule.attendance}</Text>}
      </View>
    </View>
  );

  const renderAddEditForm = (isEdit = false) => (
    <ScrollView style={styles.modalContent}>
      <Text style={styles.modalTitle}>{isEdit ? 'Edit Schedule' : 'Add Schedule'}</Text>

      {!isEdit && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Select Students *</Text>
          <ScrollView style={styles.studentList} nestedScrollEnabled>
            {students?.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentItem,
                  formData.studentIds.includes(student.id) && styles.studentItemSelected,
                ]}
                onPress={() => {
                  setFormData((prev) => ({
                    ...prev,
                    studentIds: prev.studentIds.includes(student.id)
                      ? prev.studentIds.filter((id) => id !== student.id)
                      : [...prev.studentIds, student.id],
                  }));
                }}
              >
                <Text
                  style={[
                    styles.studentItemText,
                    formData.studentIds.includes(student.id) && styles.studentItemTextSelected,
                  ]}
                >
                  {student.roll} - {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Subject *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.subjectId}
            onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
          >
            <Picker.Item label="Select Subject" value="" />
            {subjects.map((subject) => (
              <Picker.Item key={subject.subject_id} label={subject.subject_name} value={subject.subject_id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formData.date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setFormData({ ...formData, date });
            }}
          />
        )}
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.formGroupHalf]}>
          <Text style={styles.formLabel}>Start Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.startTime}
            onChangeText={(text) => setFormData({ ...formData, startTime: text })}
            placeholder="HH:MM"
          />
        </View>
        <View style={[styles.formGroup, styles.formGroupHalf]}>
          <Text style={styles.formLabel}>End Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.endTime}
            onChangeText={(text) => setFormData({ ...formData, endTime: text })}
            placeholder="HH:MM"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Mentor</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.mentorId}
            onValueChange={(value) => setFormData({ ...formData, mentorId: value })}
          >
            <Picker.Item label="Select Mentor" value="" />
            {mentors.map((mentor) => (
              <Picker.Item key={mentor.id} label={mentor.name} value={mentor.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Venue</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.venueId}
            onValueChange={(value) => setFormData({ ...formData, venueId: value })}
          >
            <Picker.Item label="Select Venue" value="" />
            {venues?.map((venue) => (
              <Picker.Item key={venue.id} label={venue.name} value={venue.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Context Activity</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.contextActivityId}
            onValueChange={(value) => setFormData({ ...formData, contextActivityId: value, topicId: '' })}
          >
            <Picker.Item label="Select Activity" value="" />
            {contextActivities.map((activity) => (
              <Picker.Item key={activity.context_id} label={activity.activity_name} value={activity.context_id} />
            ))}
          </Picker>
        </View>
      </View>

      {formData.contextActivityId && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Topic</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.topicId}
              onValueChange={(value) => setFormData({ ...formData, topicId: value })}
            >
              <Picker.Item label="Select Topic" value="" />
              {topics.map((topic) => (
                <Picker.Item
                  key={topic.id}
                  label={`${'  '.repeat(topic.level - 1)}${topic.topic_name}`}
                  value={topic.id}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Task Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.taskDescription}
          onChangeText={(text) => setFormData({ ...formData, taskDescription: text })}
          placeholder="Enter task description"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Schedule Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.scheduleType}
            onValueChange={(value) => setFormData({ ...formData, scheduleType: value })}
          >
            <Picker.Item label="Class Session" value="class_session" />
            <Picker.Item label="Homework" value="homework" />
            <Picker.Item label="Exam" value="exam" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Evaluation Mode</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.evaluationMode}
            onValueChange={(value) => setFormData({ ...formData, evaluationMode: value })}
          >
            <Picker.Item label="None" value="none" />
            <Picker.Item label="Marks" value="marks" />
            <Picker.Item label="Attentiveness" value="attentiveness" />
          </Picker>
        </View>
      </View>

      {formData.evaluationMode === 'marks' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Total Marks</Text>
          <TextInput
            style={styles.input}
            value={formData.totalMarks}
            onChangeText={(text) => setFormData({ ...formData, totalMarks: text })}
            placeholder="Enter total marks"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <Picker.Item label="Scheduled" value="scheduled" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Cancelled" value="cancelled" />
            <Picker.Item label="Postponed" value="postponed" />
          </Picker>
        </View>
      </View>

      {isEdit && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Attendance</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.attendance}
                onValueChange={(value) => setFormData({ ...formData, attendance: value })}
              >
                <Picker.Item label="Not Marked" value="" />
                <Picker.Item label="Present" value="present" />
                <Picker.Item label="Absent" value="absent" />
                <Picker.Item label="On Leave" value="on_leave" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.remarks}
              onChangeText={(text) => setFormData({ ...formData, remarks: text })}
              placeholder="Enter remarks"
              multiline
              numberOfLines={3}
            />
          </View>
        </>
      )}

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            isEdit ? setShowEditModal(false) : setShowAddModal(false);
            resetForm();
            setEditingSchedule(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.submitButton]}
          onPress={isEdit ? handleEditSchedule : handleAddSchedule}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update' : 'Add'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Student Schedule" navigation={navigation} />

      <View style={styles.controls}>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'section' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('section')}
          >
            <Text style={[styles.viewModeText, viewMode === 'section' && styles.viewModeTextActive]}>
              Section View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'student' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('student')}
          >
            <Text style={[styles.viewModeText, viewMode === 'student' && styles.viewModeTextActive]}>
              Student View
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Grade</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedGrade}
              onValueChange={(value) => setSelectedGrade(value)}
            >
              {grades.map((grade) => (
                <Picker.Item key={grade.id} label={grade.grade_name} value={grade.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Section</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSection}
              onValueChange={(value) => setSelectedSection(value)}
            >
              {sections.map((section) => (
                <Picker.Item key={section.section_id} label={section.section_name} value={section.section_id} />
              ))}
            </Picker>
          </View>
        </View>

        {viewMode === 'student' && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Student</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedStudent}
                onValueChange={(value) => setSelectedStudent(value)}
              >
                <Picker.Item label="Select Student" value={null} />
                {students.map((student) => (
                  <Picker.Item
                    key={student.id}
                    label={`${student.roll} - ${student.name}`}
                    value={student.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{selectedDate.toISOString().split('T')[0]}</Text>
          </TouchableOpacity>
          {showDatePicker && !showAddModal && !showEditModal && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
          disabled={!selectedSection}
        >
          <Text style={styles.addButtonText}>+ Add Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.schedulesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading schedules...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No schedules found for the selected filters</Text>
          </View>
        ) : (
          schedules.map(renderScheduleItem)
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>{renderAddEditForm(false)}</View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>{renderAddEditForm(true)}</View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  controls: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  viewModeButtonActive: {
    backgroundColor: '#2563EB',
  },
  viewModeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  schedulesList: {
    flex: 1,
    padding: 16,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  deleteButton: {
    borderColor: '#DC2626',
  },
  editButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  scheduleStudent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  scheduleDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 3,
  },
  scheduleDescription: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 6,
    fontStyle: 'italic',
  },
  scheduleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduleMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  studentList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  studentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentItemSelected: {
    backgroundColor: '#DBEAFE',
  },
  studentItemText: {
    fontSize: 14,
    color: '#111827',
  },
  studentItemTextSelected: {
    fontWeight: '600',
    color: '#2563EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StudentScheduleView;
