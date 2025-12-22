import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header } from '../../../../components';
import ApiService from '../../../../utils/ApiService';
import * as DocumentPicker from '@react-native-documents/picker';

const FacultyScheduleUpload = ({ navigation }) => {
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [venues, setVenues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [contextTree, setContextTree] = useState([]);
  const [topicTree, setTopicTree] = useState([]);
  const [assessmentCycles, setAssessmentCycles] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formDatePicker, setFormDatePicker] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const [showTopicManager, setShowTopicManager] = useState(false);
  const [showAssessmentManager, setShowAssessmentManager] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    gradeId: '',
    sectionId: '',
    subjectId: '',
    sessionTypeId: '',
    venueId: '',
    contextActivityId: '',
    topicId: '',
    status: 'scheduled',
    taskDescription: '',
    totalMarks: '',
  });

  const [contextForm, setContextForm] = useState({ activityId: '', parentContextId: null, editingId: null });
  const [topicForm, setTopicForm] = useState({ topicName: '', topicCode: '', parentId: null, editingId: null });
  const [assessmentForm, setAssessmentForm] = useState({ name: '', frequency: 'custom', periodStart: '', periodEnd: '', defaultTotalMarks: '', editingId: null });

  useEffect(() => {
    fetchGrades();
    fetchSessionTypes();
    fetchVenues();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSections();
      fetchMentors();
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSection) {
      fetchSubjects();
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedGrade && selectedSection && formData.subjectId) {
      fetchContextActivities();
    }
  }, [selectedGrade, selectedSection, formData.subjectId]);

  useEffect(() => {
    if (formData.contextActivityId) {
      fetchTopicHierarchy(formData.contextActivityId);
      fetchAssessmentCycles();
    } else {
      setTopicTree([]);
    }
  }, [formData.contextActivityId]);

  useEffect(() => {
    if (selectedMentor && selectedDate) {
      fetchSchedules();
    }
  }, [selectedMentor, selectedDate]);

  const fetchGrades = async () => {
    try {
      const res = await ApiService.makeRequest('/general/getGrades', { method: 'GET' });
      const data = await res.json();
      if (data.success) {
        setGrades(data.data);
        if (data.data.length > 0) {
          setSelectedGrade(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const fetchSections = async () => {
    try {
      const res = await ApiService.makeRequest('/general/getGradeSections', {
        method: 'POST',
        body: JSON.stringify({ gradeID: selectedGrade }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
        if (data.data.length > 0) {
          setSelectedSection(data.data[0].section_id);
          setFormData((prev) => ({ ...prev, gradeId: selectedGrade, sectionId: data.data[0].section_id }));
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      Alert.alert('Error', 'Failed to load sections');
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/mentor/getGradeMentors', {
        method: 'POST',
        body: JSON.stringify({ gradeID: selectedGrade }),
      });
      const data = await res.json();
      // console.log(data);
      
      if (data.success) {
        setMentors(data.gradeMentors || []);
        if ((data.gradeMentors || []).length > 0) {
          setSelectedMentor((data.gradeMentors || [])[0].faculty_id);
        }
      }
    } catch (error) {
      console.error('Error loading mentors:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/getSectionSubjects', {
        method: 'POST',
        body: JSON.stringify({ sectionId: selectedSection }),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(data.gradeSubjects || []);
        if ((data.gradeSubjects || []).length > 0) {
          setFormData((prev) => ({ ...prev, subjectId: data.gradeSubjects[0].subject_id }));
        }
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const fetchSessionTypes = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/schedule/session-types', { method: 'GET' });
      const data = await res.json();
      if (data.success) {
        setSessionTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading session types:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/enrollment/getAllVenues', { method: 'GET' });
      const data = await res.json();
      if (data.success) {
        setVenues(data.rows || []);
      }
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/getActivities', { method: 'GET' });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || data.data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const fetchContextActivities = async () => {
    try {
      const res = await ApiService.makeRequest('/coordinator/schedule/context-activities', {
        method: 'POST',
        body: JSON.stringify({
          gradeId: selectedGrade,
          sectionId: selectedSection,
          subjectId: formData.subjectId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContextTree(data.data || []);
        const flat = flattenTree(data.data || []);
        if (flat.length > 0 && !formData.contextActivityId) {
          setFormData((prev) => ({ ...prev, contextActivityId: flat[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading context activities:', error);
    }
  };

  const fetchTopicHierarchy = async (contextActivityId) => {
    try {
      const result = await ApiService.makeRequest('/coordinator/topic/getTopicHierarchy', 'POST', { contextActivityId });
      if (result.success) {
        setTopicTree(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchAssessmentCycles = async () => {
    try {
      const payload = {
        gradeId: selectedGrade || null,
        sectionId: selectedSection || null,
        subjectId: formData.subjectId || null,
        contextActivityId: formData.contextActivityId || null,
      };
      const result = await ApiService.makeRequest('/coordinator/schedule/assessment-cycles', 'POST', payload);
      if (result.success) {
        setAssessmentCycles(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching assessment cycles:', error);
    }
  };

  const flattenTree = (nodes, level = 0) => {
    const result = [];
    nodes.forEach((node) => {
      const indent = '  '.repeat(level);
      const label = `${indent}${node.activity_name || node.topic_name || node.name || 'Item'}`;
      result.push({ id: node.id, label });
      if (node.children && node.children.length > 0) {
        result.push(...flattenTree(node.children, level + 1));
      }
    });
    return result;
  };

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const res = await ApiService.makeRequest('/coordinator/schedule/faculty/list', {
        method: 'POST',
        body: JSON.stringify({
          facultyId: selectedMentor,
          date: selectedDate.toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load schedules');
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const result = await ApiService.downloadFile(
        '/coordinator/schedule/mentor/generate-template',
        'faculty_schedule_template.xlsx',
        {
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          title: 'Faculty Schedule Template',
          description: 'Template to upload faculty schedules',
        },
      );
      Alert.alert('Success', result.message || 'Template downloaded successfully.');
    } catch (error) {
      console.error('Template download error:', error);
      Alert.alert('Error', error.message || 'Failed to download template.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleUploadSchedule = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const picked = result[0];
      setUploading(true);

      const uploadResult = await ApiService.uploadFile(
        '/coordinator/schedule/mentor/upload',
        picked,
      );

      const { processed, succeeded, failed } = uploadResult.data.data || uploadResult.data;
      let message = `Processed: ${processed}\nSucceeded: ${succeeded}`;
      if (failed && failed.length) {
        message += `\nFailed: ${failed.length}`;
      }
      Alert.alert('Upload result', message);
      fetchSchedules();
    } catch (err) {
      if (DocumentPicker.isCancel && DocumentPicker.isCancel(err)) {
        return;
      }
      console.error('Schedule upload error:', err);
      Alert.alert('Error', err.message || 'Failed to upload schedule file.');
    } finally {
      setUploading(false);
    }
  };

  const saveContextActivity = async () => {
    if (!contextForm.activityId) {
      Alert.alert('Validation', 'Select an activity');
      return;
    }
    const route = contextForm.editingId
      ? '/coordinator/schedule/context-activities/update'
      : '/coordinator/schedule/context-activities/create';
    const payload = {
      activityId: contextForm.activityId,
      parentContextId: contextForm.parentContextId,
      gradeId: selectedGrade,
      sectionId: selectedSection,
      subjectId: formData.subjectId,
    };
    if (contextForm.editingId) {
      payload.contextActivityId = contextForm.editingId;
    }
    try {
      const res = await ApiService.makeRequest(route, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setContextForm({ activityId: '', parentContextId: null, editingId: null });
        fetchContextActivities();
      } else {
        Alert.alert('Error', data.message || 'Unable to save context activity');
      }
    } catch (error) {
      console.error('Save context activity error:', error);
      Alert.alert('Error', 'Unable to save context activity');
    }
  };

  const deleteContextActivity = async (id) => {
    try {
      const res = await ApiService.makeRequest('/coordinator/schedule/context-activities/delete', {
        method: 'POST',
        body: JSON.stringify({ contextActivityId: id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchContextActivities();
      } else {
        Alert.alert('Error', data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete context activity error:', error);
    }
  };

  const saveTopic = async () => {
    if (!formData.contextActivityId) {
      Alert.alert('Validation', 'Select a context activity first');
      return;
    }
    if (!topicForm.topicName || !topicForm.topicCode) {
      Alert.alert('Validation', 'Topic name and code are required');
      return;
    }
    const route = topicForm.editingId ? '/coordinator/topic/updateTopic' : '/coordinator/topic/createTopic';
    const payload = {
      contextActivityId: formData.contextActivityId,
      parentId: topicForm.parentId,
      topicName: topicForm.topicName,
      topicCode: topicForm.topicCode,
    };
    if (topicForm.editingId) {
      payload.topicId = topicForm.editingId;
    }
    try {
      const res = await ApiService.makeRequest(route, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setTopicForm({ topicName: '', topicCode: '', parentId: null, editingId: null });
        fetchTopicHierarchy(formData.contextActivityId);
      } else {
        Alert.alert('Error', data.message || 'Unable to save topic');
      }
    } catch (error) {
      console.error('Save topic error:', error);
      Alert.alert('Error', 'Unable to save topic');
    }
  };

  const deleteTopic = async (id) => {
    try {
      const result = await ApiService.makeRequest('/coordinator/topic/deleteTopic', 'POST', { topicId: id });
      if (result.success) {
        Alert.alert('Success', 'Topic deleted');
        fetchTopicHierarchy(formData.contextActivityId);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const saveAssessmentCycle = async () => {
    if (!assessmentForm.name) {
      Alert.alert('Validation', 'Assessment cycle name is required');
      return;
    }
    const route = assessmentForm.editingId
      ? '/coordinator/schedule/assessment-cycles/update'
      : '/coordinator/schedule/assessment-cycles/create';
    const payload = {
      name: assessmentForm.name,
      frequency: assessmentForm.frequency,
      periodStart: assessmentForm.periodStart || null,
      periodEnd: assessmentForm.periodEnd || null,
      defaultTotalMarks: assessmentForm.defaultTotalMarks ? Number(assessmentForm.defaultTotalMarks) : null,
      gradeId: selectedGrade,
      sectionId: selectedSection,
      subjectId: formData.subjectId,
      contextActivityId: formData.contextActivityId || null,
    };
    if (assessmentForm.editingId) payload.id = assessmentForm.editingId;
    try {
      const result = await ApiService.makeRequest(route, 'POST', payload);
      if (result.success) {
        Alert.alert('Success', 'Assessment cycle saved');
        setAssessmentForm({ name: '', frequency: 'custom', periodStart: '', periodEnd: '', defaultTotalMarks: '', editingId: null });
        fetchAssessmentCycles();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteAssessmentCycle = async (id) => {
    try {
      const result = await ApiService.makeRequest('/coordinator/schedule/assessment-cycles/delete', 'POST', { id });
      if (result.success) {
        Alert.alert('Success', 'Assessment cycle deleted');
        fetchAssessmentCycles();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openCreateForm = () => {
    setEditingSchedule(null);
    setFormData({
      date: selectedDate || new Date(),
      startTime: '09:00',
      endTime: '10:00',
      gradeId: selectedGrade || '',
      sectionId: selectedSection || '',
      subjectId: subjects[0]?.subject_id || '',
      sessionTypeId: sessionTypes[0]?.id || '',
      venueId: '',
      contextActivityId: flattenTree(contextTree)[0]?.id || '',
      topicId: topicTree[0]?.id || '',
      status: 'scheduled',
      taskDescription: '',
      totalMarks: '',
    });
    setShowFormModal(true);
  };

  const openEditForm = (item) => {
    setEditingSchedule(item);
    setFormData({
      date: new Date(item.date),
      startTime: item.start_time || '09:00',
      endTime: item.end_time || '10:00',
      gradeId: item.grade_id || selectedGrade,
      sectionId: item.section_id || selectedSection,
      subjectId: item.subject_id || '',
      sessionTypeId: item.session_type_id || '',
      venueId: item.venue_id || '',
      contextActivityId: item.context_activity_id || '',
      topicId: item.topic_id || '',
      status: item.status || 'scheduled',
      taskDescription: item.task_description || '',
      totalMarks: item.total_marks ? String(item.total_marks) : '',
    });
    setShowFormModal(true);
  };

  const submitForm = async () => {
    if (!selectedMentor) {
      Alert.alert('Validation', 'Select a mentor first');
      return;
    }
    const payload = {
      facultyId: selectedMentor,
      date: formData.date.toISOString().split('T')[0],
      startTime: formData.startTime,
      endTime: formData.endTime,
      gradeId: formData.gradeId,
      sectionId: formData.sectionId,
      subjectId: formData.subjectId,
      sessionTypeId: formData.sessionTypeId,
      venueId: formData.venueId || null,
      contextActivityId: formData.contextActivityId || null,
      topicId: formData.topicId || null,
      status: formData.status,
      taskDescription: formData.taskDescription,
      totalMarks: formData.totalMarks ? Number(formData.totalMarks) : null,
    };

    try {
      const route = editingSchedule ? '/coordinator/schedule/faculty/update' : '/coordinator/schedule/faculty/create';
      if (editingSchedule) {
        payload.scheduleId = editingSchedule.id;
      }

      const res = await ApiService.makeRequest(route, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', editingSchedule ? 'Schedule updated' : 'Schedule created');
        setShowFormModal(false);
        fetchSchedules();
      } else {
        Alert.alert('Error', data.message || 'Unable to save schedule');
      }
    } catch (error) {
      console.error('Save schedule error:', error);
      Alert.alert('Error', 'Unable to save schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    Alert.alert('Confirm', 'Delete this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await ApiService.makeRequest('/coordinator/schedule/faculty/delete', {
              method: 'POST',
              body: JSON.stringify({ scheduleId }),
            });
            const data = await res.json();
            if (data.success) {
              fetchSchedules();
            } else {
              Alert.alert('Error', data.message || 'Failed to delete schedule');
            }
          } catch (error) {
            console.error('Delete schedule error:', error);
          }
        },
      },
    ]);
  };

  const renderScheduleItem = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.subject_name || 'Subject'}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.status || 'scheduled'}</Text></View>
      </View>
      <Text style={styles.cardText}>{item.date} • {item.start_time} - {item.end_time}</Text>
      <Text style={styles.cardText}>{item.grade_name || 'Grade'} {item.section_name ? `• ${item.section_name}` : ''}</Text>
      {item.venue_name ? <Text style={styles.cardText}>Venue: {item.venue_name}</Text> : null}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.linkButton} onPress={() => openEditForm(item)}>
          <Text style={styles.linkButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.linkButtonText, { color: '#DC2626' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPicker = (label, selectedValue, onValueChange, items, valueKey = 'id', labelKey = 'name', subLabelKey = 'sub_name') => (
    <View style={styles.fieldRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          {items.map((item) => {
            const baseLabel = item[labelKey] || '';
            const evalLabel = item.evaluation_mode_name || item.evaluation_mode;
            const extra = evalLabel ? ` [${evalLabel}]` : '';
            const subLabel = item[subLabelKey] ? ` (${item[subLabelKey]})` : '';
            return (
              <Picker.Item
                key={item[valueKey]}
                label={`${baseLabel}${extra}${subLabel}`}
                value={item[valueKey]}
              />
            );
          })}
        </Picker>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Header title="Faculty Schedule" navigation={navigation} />
      <ScrollView style={styles.container}>
        <Text style={styles.description}>
          View, edit, create, or upload faculty schedules. Filters drive the list; adding uses the selected mentor by default.
        </Text>

        <View style={styles.filterRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGrade}
                onValueChange={(val) => {
                  setSelectedGrade(val);
                }}
              >
                {grades.map((g) => (
                  <Picker.Item key={g.id} label={g.grade_name} value={g.id} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Section</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSection}
                onValueChange={(val) => {
                  setSelectedSection(val);
                  setFormData((prev) => ({ ...prev, sectionId: val }));
                }}
              >
                {sections.map((s) => (
                  <Picker.Item key={s.section_id} label={s.section_name} value={s.section_id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Mentor</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMentor}
                onValueChange={setSelectedMentor}
              >
                {mentors.map((m) => (
                  <Picker.Item key={m.faculty_id} label={`${m.name}(${m.roll})`} value={m.faculty_id} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{selectedDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.button, styles.primaryButton, styles.actionSpacing]} onPress={openCreateForm}>
            <Text style={styles.buttonText}>Add Manual Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.actionSpacing]}
            onPress={handleDownloadTemplate}
            disabled={loadingTemplate}
          >
            {loadingTemplate ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.secondaryButtonText}>Download Template</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUploadSchedule}
            disabled={uploading}
          >
            {uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.secondaryButtonText}>Upload Filled Schedule</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Schedules</Text>
        {loadingSchedules ? (
          <ActivityIndicator />
        ) : schedules.length === 0 ? (
          <Text style={styles.emptyText}>No schedules for this date.</Text>
        ) : (
          schedules.map((item) => renderScheduleItem(item))
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {formDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setFormDatePicker(false);
            if (date) setFormData((prev) => ({ ...prev, date }));
          }}
        />
      )}

      <Modal visible={showFormModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingSchedule ? 'Edit Schedule' : 'New Schedule'}</Text>
            <ScrollView style={{ maxHeight: 500 }}>
              <TouchableOpacity style={styles.dateButton} onPress={() => setFormDatePicker(true)}>
                <Text style={styles.dateText}>Date: {formData.date.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {renderPicker('Subject', formData.subjectId, (v) => setFormData((p) => ({ ...p, subjectId: v })), subjects, 'subject_id', 'subject_name')}
              {renderPicker('Session Type', formData.sessionTypeId, (v) => setFormData((p) => ({ ...p, sessionTypeId: v })), sessionTypes, 'id', 'name', 'sub_name')}
              {renderPicker('Venue', formData.venueId, (v) => setFormData((p) => ({ ...p, venueId: v })), [{ id: '', name: 'Select venue' }, ...venues.map((v) => ({ id: v.id, name: v.name }))])}
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Start Time (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startTime}
                  onChangeText={(text) => setFormData((p) => ({ ...p, startTime: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>End Time (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endTime}
                  onChangeText={(text) => setFormData((p) => ({ ...p, endTime: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Task / Notes</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={formData.taskDescription}
                  onChangeText={(text) => setFormData((p) => ({ ...p, taskDescription: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Total Marks (optional)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.totalMarks}
                  onChangeText={(text) => setFormData((p) => ({ ...p, totalMarks: text }))}
                />
              </View>
              {renderPicker('Context Activity', formData.contextActivityId, (v) => {
                setFormData((p) => ({ ...p, contextActivityId: v, topicId: '' }));
              }, flattenTree(contextTree).map((t) => ({ id: t.id, name: t.label })), 'id', 'name')}
              {formData.contextActivityId && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#8B5CF6', marginBottom: 12, paddingVertical: 8 }]}
                  onPress={() => setShowAssessmentManager(true)}
                >
                  <Text style={styles.buttonText}>Manage Assessment Cycles</Text>
                </TouchableOpacity>
              )}
              {formData.contextActivityId && renderPicker('Topic', formData.topicId, (v) => {
                setFormData((p) => ({ ...p, topicId: v }));
              }, flattenTree(topicTree).map((t) => ({ id: t.id, name: t.label })), 'id', 'name')}
              {renderPicker('Status', formData.status, (v) => setFormData((p) => ({ ...p, status: v })), [
                { id: 'scheduled', name: 'Scheduled' },
                { id: 'completed', name: 'Completed' },
                { id: 'cancelled', name: 'Cancelled' },
              ])}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton, { marginRight: 8 }]} onPress={() => setShowFormModal(false)}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={submitForm}>
                <Text style={styles.buttonText}>{editingSchedule ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showContextManager} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Context Activities</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {renderPicker('Activity', contextForm.activityId, (v) => setContextForm((p) => ({ ...p, activityId: v })), activities, 'id', 'name')}
              {contextTree.length > 0 && renderPicker('Parent (optional)', contextForm.parentContextId, (v) => setContextForm((p) => ({ ...p, parentContextId: v })), [
                { id: null, name: 'None (Root)' },
                ...flattenTree(contextTree).map((t) => ({ id: t.id, name: t.label }))
              ])}
              <Text style={styles.sectionTitle}>Existing Activities</Text>
              {flattenTree(contextTree).map((ca) => (
                <View key={ca.id} style={styles.listItem}>
                  <Text style={styles.itemText}>{ca.label}</Text>
                  <TouchableOpacity onPress={() => deleteContextActivity(ca.id)}>
                    <Text style={{ color: '#DC2626', fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton, { marginRight: 8 }]} onPress={() => setShowContextManager(false)}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={saveContextActivity}>
                <Text style={styles.buttonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTopicManager} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Topics</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Topic Name</Text>
                <TextInput
                  style={styles.input}
                  value={topicForm.topicName}
                  onChangeText={(text) => setTopicForm((p) => ({ ...p, topicName: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Topic Code</Text>
                <TextInput
                  style={styles.input}
                  value={topicForm.topicCode}
                  onChangeText={(text) => setTopicForm((p) => ({ ...p, topicCode: text }))}
                />
              </View>
              {topicTree.length > 0 && renderPicker('Parent Topic (optional)', topicForm.parentId, (v) => setTopicForm((p) => ({ ...p, parentId: v })), [
                { id: null, name: 'None (Root)' },
                ...flattenTree(topicTree).map((t) => ({ id: t.id, name: t.label }))
              ])}
              <Text style={styles.sectionTitle}>Existing Topics</Text>
              {flattenTree(topicTree).map((topic) => (
                <View key={topic.id} style={styles.listItem}>
                  <Text style={styles.itemText}>{topic.label}</Text>
                  <TouchableOpacity onPress={() => deleteTopic(topic.id)}>
                    <Text style={{ color: '#DC2626', fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton, { marginRight: 8 }]} onPress={() => setShowTopicManager(false)}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={saveTopic}>
                <Text style={styles.buttonText}>Add Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAssessmentManager} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Assessment Cycles</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Cycle Name</Text>
                <TextInput
                  style={styles.input}
                  value={assessmentForm.name}
                  onChangeText={(text) => setAssessmentForm((p) => ({ ...p, name: text }))}
                />
              </View>
              {renderPicker('Frequency', assessmentForm.frequency, (v) => setAssessmentForm((p) => ({ ...p, frequency: v })), [
                { id: 'daily', name: 'Daily' },
                { id: 'weekly', name: 'Weekly' },
                { id: 'monthly', name: 'Monthly' },
                { id: 'term', name: 'Term' },
                { id: 'custom', name: 'Custom' },
              ])}
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Period Start (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={assessmentForm.periodStart}
                  onChangeText={(text) => setAssessmentForm((p) => ({ ...p, periodStart: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Period End (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={assessmentForm.periodEnd}
                  onChangeText={(text) => setAssessmentForm((p) => ({ ...p, periodEnd: text }))}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Default Total Marks (optional)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={assessmentForm.defaultTotalMarks}
                  onChangeText={(text) => setAssessmentForm((p) => ({ ...p, defaultTotalMarks: text }))}
                />
              </View>
              <Text style={styles.sectionTitle}>Existing Cycles</Text>
              {assessmentCycles.map((cycle) => (
                <View key={cycle.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>{cycle.name}</Text>
                    {cycle.frequency && <Text style={{ fontSize: 12, color: '#6B7280' }}>Frequency: {cycle.frequency}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => deleteAssessmentCycle(cycle.id)}>
                    <Text style={{ color: '#DC2626', fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton, { marginRight: 8 }]} onPress={() => setShowAssessmentManager(false)}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={saveAssessmentCycle}>
                <Text style={styles.buttonText}>Add Cycle</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionsRow: {
    marginVertical: 12,
  },
  actionSpacing: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: '#111827',
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 8,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 8,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4338CA',
    fontWeight: '700',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  linkButton: {
    marginLeft: 12,
  },
  linkButtonText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldRow: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});

export default FacultyScheduleUpload;
