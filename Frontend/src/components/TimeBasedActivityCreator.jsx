import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../utils/env';

const TimeBasedActivityCreator = ({ 
  visible, 
  onClose, 
  selectedPeriod, 
  selectedDate, 
  onActivityCreated 
}) => {
  const [batches, setBatches] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchActivities, setBatchActivities] = useState({});

  const activityTypes = [
    'Academic', 'Assessment', 'Quiz', 'Project Discussion', 
    'Practical', 'Assignment Review', 'Doubt Clearing', 
    'Presentation', 'Group Discussion'
  ];

  const assessmentTypes = ['Quiz', 'Test', 'Assignment', 'Project', 'Presentation'];

  useEffect(() => {
    if (visible && selectedPeriod) {
      fetchInitialData();
    }
  }, [visible, selectedPeriod]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBatches(),
        fetchMentors(),
        fetchTopics()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      Alert.alert('Error', 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/batches/${selectedPeriod.section_id}/${selectedPeriod.subject_id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        setBatches(result.data);
        // Initialize batch activities for each batch
        const initialBatchActivities = {};
        result.data.forEach(batch => {
          initialBatchActivities[batch.batch_number] = [];
        });
        setBatchActivities(initialBatchActivities);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/coordinator/mentors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setMentors(result.data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${API_URL}/api/coordinator/topic-hierarchy/grade/${selectedPeriod.grade_id}/subject/${selectedPeriod.subject_id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        setTopics(result.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const addActivityToBatch = (batchNumber) => {
    const newActivity = {
      id: Date.now(), // Temporary ID
      batch_number: batchNumber,
      activity_type: 'Academic',
      start_time: selectedPeriod.start_time,
      end_time: selectedPeriod.end_time,
      topic_id: null,
      mentor_id: null,
      has_assessment: false,
      assessment_type: 'Quiz',
      total_marks: 100,
      activity_instructions: ''
    };

    setBatchActivities(prev => ({
      ...prev,
      [batchNumber]: [...prev[batchNumber], newActivity]
    }));
  };

  const updateActivity = (batchNumber, activityId, field, value) => {
    setBatchActivities(prev => ({
      ...prev,
      [batchNumber]: prev[batchNumber].map(activity =>
        activity.id === activityId ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const removeActivity = (batchNumber, activityId) => {
    setBatchActivities(prev => ({
      ...prev,
      [batchNumber]: prev[batchNumber].filter(activity => activity.id !== activityId)
    }));
  };

  const validateTimeOverlaps = () => {
    for (const batchNumber in batchActivities) {
      const activities = batchActivities[batchNumber];
      for (let i = 0; i < activities.length; i++) {
        for (let j = i + 1; j < activities.length; j++) {
          const activity1 = activities[i];
          const activity2 = activities[j];
          
          if (activity1.start_time < activity2.end_time && 
              activity1.end_time > activity2.start_time) {
            return `Time overlap detected in Batch ${batchNumber}`;
          }
        }
      }
    }
    return null;
  };

  const createActivities = async () => {
    try {
      // Validate required fields
      const allActivities = [];
      for (const batchNumber in batchActivities) {
        for (const activity of batchActivities[batchNumber]) {
          if (!activity.mentor_id || !activity.topic_id) {
            Alert.alert('Error', `Please fill all required fields for Batch ${batchNumber}`);
            return;
          }
          allActivities.push({
            ...activity,
            batch_number: parseInt(batchNumber)
          });
        }
      }

      if (allActivities.length === 0) {
        Alert.alert('Error', 'Please add at least one activity');
        return;
      }

      // Validate time overlaps
      const overlapError = validateTimeOverlaps();
      if (overlapError) {
        Alert.alert('Error', overlapError);
        return;
      }

      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(
        `${API_URL}/api/coordinator/academic-schedule/create-time-based-activities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            period_id: selectedPeriod.id,
            date: selectedDate.toISOString().split('T')[0],
            activities: allActivities
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', result.message);
        onActivityCreated();
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to create activities');
      }
    } catch (error) {
      console.error('Error creating activities:', error);
      Alert.alert('Error', 'Failed to create activities');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Time-Based Activities</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodInfo}>
          <Text style={styles.periodText}>
            {selectedPeriod?.subject_name} - Period {selectedPeriod?.period_number}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(selectedPeriod?.start_time)} - {formatTime(selectedPeriod?.end_time)}
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {batches.map(batch => (
            <View key={batch.batch_number} style={styles.batchSection}>
              <View style={styles.batchHeader}>
                <Text style={styles.batchTitle}>Batch {batch.batch_number}</Text>
                <TouchableOpacity 
                  onPress={() => addActivityToBatch(batch.batch_number)}
                  style={styles.addButton}
                >
                  <Icon name="plus" size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Add Activity</Text>
                </TouchableOpacity>
              </View>

              {batchActivities[batch.batch_number]?.map(activity => (
                <View key={activity.id} style={styles.activityForm}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>Activity {activity.id}</Text>
                    <TouchableOpacity 
                      onPress={() => removeActivity(batch.batch_number, activity.id)}
                      style={styles.removeButton}
                    >
                      <Icon name="trash-2" size={16} color="#ff4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Activity Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Activity Type</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={activity.activity_type}
                        onValueChange={(value) => updateActivity(batch.batch_number, activity.id, 'activity_type', value)}
                        style={styles.picker}
                      >
                        {activityTypes.map(type => (
                          <Picker.Item key={type} label={type} value={type} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Time Range */}
                  <View style={styles.timeRow}>
                    <View style={styles.timeGroup}>
                      <Text style={styles.label}>Start Time</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={activity.start_time}
                        onChangeText={(value) => updateActivity(batch.batch_number, activity.id, 'start_time', value)}
                        placeholder="HH:MM"
                      />
                    </View>
                    <View style={styles.timeGroup}>
                      <Text style={styles.label}>End Time</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={activity.end_time}
                        onChangeText={(value) => updateActivity(batch.batch_number, activity.id, 'end_time', value)}
                        placeholder="HH:MM"
                      />
                    </View>
                  </View>

                  {/* Topic */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Topic *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={activity.topic_id}
                        onValueChange={(value) => updateActivity(batch.batch_number, activity.id, 'topic_id', value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select Topic" value={null} />
                        {topics.map(topic => (
                          <Picker.Item 
                            key={topic.id} 
                            label={topic.hierarchy_path ? `${topic.hierarchy_path} > ${topic.topic_name}` : topic.topic_name}
                            value={topic.id} 
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Mentor */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Mentor *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={activity.mentor_id}
                        onValueChange={(value) => updateActivity(batch.batch_number, activity.id, 'mentor_id', value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select Mentor" value={null} />
                        {mentors.map(mentor => (
                          <Picker.Item 
                            key={mentor.id} 
                            label={`${mentor.name} (${mentor.roll})`}
                            value={mentor.id} 
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Assessment Toggle */}
                  <View style={styles.switchRow}>
                    <Text style={styles.label}>Has Assessment</Text>
                    <Switch
                      value={activity.has_assessment}
                      onValueChange={(value) => updateActivity(batch.batch_number, activity.id, 'has_assessment', value)}
                    />
                  </View>

                  {activity.has_assessment && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Assessment Type</Text>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={activity.assessment_type}
                            onValueChange={(value) => updateActivity(batch.batch_number, activity.id, 'assessment_type', value)}
                            style={styles.picker}
                          >
                            {assessmentTypes.map(type => (
                              <Picker.Item key={type} label={type} value={type} />
                            ))}
                          </Picker>
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Total Marks</Text>
                        <TextInput
                          style={styles.input}
                          value={activity.total_marks?.toString()}
                          onChangeText={(value) => updateActivity(batch.batch_number, activity.id, 'total_marks', parseInt(value) || 100)}
                          keyboardType="numeric"
                          placeholder="100"
                        />
                      </View>
                    </>
                  )}

                  {/* Instructions */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Instructions (Optional)</Text>
                    <TextInput
                      style={styles.textArea}
                      value={activity.activity_instructions}
                      onChangeText={(value) => updateActivity(batch.batch_number, activity.id, 'activity_instructions', value)}
                      placeholder="Enter activity instructions..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={createActivities} style={styles.createButton}>
            <Text style={styles.createButtonText}>Create All Activities</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  periodInfo: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  batchSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  activityForm: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeGroup: {
    flex: 0.48,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default TimeBasedActivityCreator;
