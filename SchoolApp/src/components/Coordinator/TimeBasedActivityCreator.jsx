import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { API_URL } from '../../utils/env';
import { set } from 'date-fns';

const TimeBasedActivityCreator = ({
    visible,
    onClose,
    selectedPeriod,
    selectedDate,
    activeGrade,
    onActivityCreated,
    periodActivities,
    sectionID
}) => {
    const [batches, setBatches] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batchActivities, setBatchActivities] = useState({});
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [activityToEdit, setActivityToEdit] = useState(null);

    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [subActivities, setSubActivities] = useState([]);
    const [selectedSubActivity, setSelectedSubActivity] = useState(null);

    // Time picker state for new activities
    const [timePicker, setTimePicker] = useState({
        visible: false,
        mode: 'time',
        batchLevel: null,
        activityId: null,
        field: null,
        value: null,
    });

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
                fetchMentors()
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
            const response = await fetch(
                `${API_URL}/api/coordinator/academic-schedule/batches/${selectedPeriod.section_id}/${selectedPeriod.subject_id}`);
            const result = await response.json();
            if (result.success) {
                setBatches(result.data);
                // FIX: Initialize batch activities with consistent keys
                const initialBatchActivities = {};
                result.data.forEach(batch => {
                    // Use batch.id as the key for consistency
                    initialBatchActivities[batch.id] = [];
                });
                setBatchActivities(initialBatchActivities);
                console.log('Initialized batch activities:', initialBatchActivities);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchMentors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/mentor/getGradeMentors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gradeID: activeGrade })
            });
            const result = await response.json();
            if (result.success) {
                setMentors(result.gradeMentors);
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
        }
    };

    const fetchActivitiesForSubject = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/topics/getSectionSubjectActivities/${selectedPeriod.section_id}/${selectedPeriod.subject_id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success) {
                setActivities(result.sectionSubjectActivity || []);
                if (result.sectionSubjectActivity.length > 0) {
                    setSelectedActivity(result.sectionSubjectActivity[0].id);
                } else {
                    setSelectedActivity(null);
                }
            }
        } catch (error) {
            console.error('Fetch activities error:', error);
        }
    };

    useEffect(() => {
        if (selectedPeriod) {
            fetchActivitiesForSubject();
        }
    }, [selectedPeriod])

    const fetchSubActivitiesForSubject = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/topics/getSectionSubjectSubActivities/${selectedActivity}/${selectedPeriod.subject_id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success) {
                setSubActivities(result.sectionSubjectSubActivity || []);
                if (result.sectionSubjectSubActivity.length > 0) {
                    setSelectedSubActivity(result.sectionSubjectSubActivity[0].id);
                } else {
                    setSelectedSubActivity(null);
                }
            }
        } catch (error) {
            console.error('Fetch sub activities error:', error);
        }
    }; 

    useEffect(() => {
        if (selectedActivity) {
            fetchSubActivitiesForSubject();
        }
    }, [selectedActivity]);

    const fetchTopics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/topics/sectionSubject/${selectedActivity}/${selectedSubActivity}`);
            const result = await response.json();
            if (result.success) {
                setTopics(result.data);
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    useEffect(() => {
        if (selectedActivity && selectedSubActivity) {
            fetchTopics();
        }
    }, [selectedActivity, selectedSubActivity])

    // FIX: Use batch.id consistently
    const addActivityToBatch = (batchId) => {
        console.log('Adding activity to batch:', batchId);
        const selectedActivityObject = activities.find(act => act.id === selectedActivity);
    
        const newActivity = {
            id: Date.now(), // Temporary ID
            batch_number: batchId, // Use batchId directly
            activity_type: selectedActivityObject ? selectedActivityObject.activity_name : null,
            activity_type_id: selectedActivity,
            sub_activity_type_id: selectedSubActivity,
            start_time: selectedPeriod?.timeStart || selectedPeriod?.start_time,
            end_time: selectedPeriod?.timeEnd || selectedPeriod?.end_time,
            topic_id: null,
            mentor_id: null,
            has_assessment: false,
            assessment_type: null,
            total_marks: 100,
            activity_instructions: ''
        };
    
        setBatchActivities(prev => {
            console.log('Previous batch activities:', prev);
            const updated = {
                ...prev,
                [batchId]: [...(prev[batchId] || []), newActivity]
            };
            console.log('Updated batch activities:', updated);
            return updated;
        });
    };
    
    // FIX: Use consistent batchId parameter
    const updateActivity = (batchId, activityId, field, value) => {
        setBatchActivities(prev => ({
            ...prev,
            [batchId]: prev[batchId]?.map(activity =>
                activity.id === activityId ? { ...activity, [field]: value } : activity
            ) || []
        }));
    };

    // Show time picker for a specific activity and field
    const showTimePicker = (batchId, activityId, field, currentValue) => {
        setTimePicker({
            visible: true,
            mode: 'time',
            batchLevel: batchId, // Store batchId here
            activityId,
            field,
            value: currentValue,
        });
    };

    // Handle time picker change
    const handleTimeChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setTimePicker(prev => ({ ...prev, visible: false }));
            return;
        }
        setTimePicker(prev => ({ ...prev, visible: false }));
        if (selectedDate) {
            // Format to HH:mm
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const formatted = `${hours}:${minutes}`;
            updateActivity(timePicker.batchLevel, timePicker.activityId, timePicker.field, formatted);
        }
    };

    const removeActivity = (batchId, activityId) => {
        setBatchActivities(prev => ({
            ...prev,
            [batchId]: prev[batchId]?.filter(activity => activity.id !== activityId) || []
        }));
    };

    const validateTimeOverlaps = () => {
        for (const batchId in batchActivities) {
            const activities = batchActivities[batchId];
            const existingActivities = getExistingActivitiesForBatch(batchId);

            // Check overlaps within new activities
            for (let i = 0; i < activities.length; i++) {
                for (let j = i + 1; j < activities.length; j++) {
                    const activity1 = activities[i];
                    const activity2 = activities[j];

                    if (activity1.start_time < activity2.end_time &&
                        activity1.end_time > activity2.start_time) {
                        const batch = batches.find(b => b.id == batchId);
                        return `Time overlap detected in new activities for Batch ${batch?.batch_level || batchId}`;
                    }
                }
            }

            // Check overlaps between new and existing activities
            for (const newActivity of activities) {
                for (const existingActivity of existingActivities) {
                    if (newActivity.start_time < existingActivity.end_time &&
                        newActivity.end_time > existingActivity.start_time) {
                        const batch = batches.find(b => b.id == batchId);
                        return `New activity overlaps with existing activity in Batch ${batch?.batch_level || batchId}`;
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
            for (const batchId in batchActivities) {
                const batch = batches.find(b => b.id == batchId);
                for (const activity of batchActivities[batchId]) {
                    if (!activity.mentor_id || !activity.topic_id || !activity.activity_type_id) {
                        Alert.alert('Error', `Please fill all required fields for Batch ${batch?.batch_level || batchId}`);
                        return;
                    }
                    allActivities.push({
                        ...activity,
                        batch_number: batch?.batch_level || batchId,
                        batch_id: batchId
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
            
            const response = await fetch(
                `${API_URL}/api/coordinator/academic-schedule/create-time-based-activities`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        period_id: selectedPeriod.id,
                        date: selectedDate.toISOString().split('T')[0],
                        activities: allActivities,
                        sectionId: sectionID
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

    const getExistingActivitiesForBatch = (batchId) => {
        if (!periodActivities) return [];
        
        return periodActivities.filter(activity =>
            activity.batch_id === parseInt(batchId) &&
            activity.dailyScheduleId === selectedPeriod.id
        );
    };

    const renderExistingActivity = (activity) => (
        <View key={`existing-${activity.id}`} style={styles.existingActivity}>
            <View style={styles.existingActivityHeader}>
                <Text style={styles.existingActivityTitle}>
                    {activity.activity_type} {activity.has_assessment ? '(Assessment)' : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
                    <TouchableOpacity onPress={() => handleEditActivity(activity)}>
                        <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                        <Text>🗑️</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.existingActivityBadge}>
                    <Text style={styles.existingActivityBadgeText}>Existing</Text>
                </View>
            </View>

            <View style={styles.existingActivityDetails}>
                <Text style={styles.existingActivityDetail}>
                    ⏰ {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                </Text>
                <Text style={styles.existingActivityDetail}>
                    📚 {activity.topic_hierarchy_path ? `${activity.topic_hierarchy_path} > ` : ''}{activity.topic_name}
                </Text>
                <Text style={styles.existingActivityDetail}>
                    👨‍🏫 {activity.mentor_name} ({activity.mentor_roll})
                </Text>
                {activity.has_assessment && (
                    <Text style={styles.existingActivityDetail}>
                        📝 {activity.assessment_type} - {activity.total_marks} marks
                    </Text>
                )}
                {activity.activity_instructions && activity.activity_instructions !== 'Nil' && (
                    <Text style={styles.existingActivityDetail}>
                        📋 {activity.activity_instructions}
                    </Text>
                )}
            </View>
        </View>
    );

    // Edit activity handler
    const handleEditActivity = (activity) => {
        setActivityToEdit(activity);
        setEditModalVisible(true);
    };

    // Delete activity handler
    const handleDeleteActivity = async (activityId) => {
        Alert.alert(
            'Delete Activity',
            'Are you sure you want to delete this activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await fetch(
                                `${API_URL}/api/coordinator/academic-schedule/delete-period-activity/${activityId}`,
                                {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                            const result = await response.json();
                            if (result.success) {
                                Alert.alert('Success', 'Activity deleted successfully');
                                if (onActivityCreated) onActivityCreated();
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete activity');
                            }
                        } catch (error) {
                            console.error('Error deleting activity:', error);
                            Alert.alert('Error', 'Failed to delete activity');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Save edited activity
    const handleSaveEditActivity = async () => {
        if (!activityToEdit) return;
        console.log(activityToEdit);
        

        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/coordinator/academic-schedule/edit-period-activity/${activityToEdit.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityToEdit)
                }
            );
            const result = await response.json();
            if (result.success) {
                Alert.alert('Success', 'Activity updated successfully');
                setEditModalVisible(false);
                setActivityToEdit(null);
                if (onActivityCreated) onActivityCreated();
            } else {
                Alert.alert('Error', result.message || 'Failed to update activity');
            }
        } catch (error) {
            console.error('Error updating activity:', error);
            Alert.alert('Error', 'Failed to update activity');
        } finally {
            setLoading(false);
        }
    };

    // Edit modal UI
    const renderEditModal = () => (
        <Modal visible={editModalVisible} animationType="slide">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Edit Activity</Text>
                    <TouchableOpacity onPress={() => { setEditModalVisible(false); setActivityToEdit(null); }} style={styles.closeButton}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                </View>
                {activityToEdit && (
                    <ScrollView style={styles.content}>
                        {/* Activity Type */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Activity Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={activityToEdit.activity_type_id}
                                    onValueChange={(value) => {
                                        const selected = activities.find(a => a.id === value);
                                        setActivityToEdit(prev => ({
                                            ...prev,
                                            activity_type_id: value,
                                            activity_type: selected ? selected.activity_name : prev.activity_type
                                        }));
                                        setSelectedActivity(value);
                                    }}
                                    style={styles.picker}
                                >
                                    {activities.map(type => (
                                        <Picker.Item key={type.id} label={type.activity_name} value={type.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {selectedActivity && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Sub Activity</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={activityToEdit.sub_activity_type_id}
                                        onValueChange={(value) => {
                                            setActivityToEdit(prev => ({ ...prev, sub_activity_type_id: value }));
                                            setSelectedSubActivity(value);
                                        }}
                                        style={styles.picker}
                                    >
                                        {subActivities.map(type => (
                                            <Picker.Item key={type.id} label={type.sub_act_name} value={type.id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        )}

                        {/* Start Time */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Start Time</Text>
                            <TextInput
                                style={styles.input}
                                value={activityToEdit.start_time}
                                onChangeText={(value) => setActivityToEdit(prev => ({ ...prev, start_time: value }))}
                                placeholder="HH:MM"
                            />
                        </View>

                        {/* End Time */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>End Time</Text>
                            <TextInput
                                style={styles.input}
                                value={activityToEdit.end_time}
                                onChangeText={(value) => setActivityToEdit(prev => ({ ...prev, end_time: value }))}
                                placeholder="HH:MM"
                            />
                        </View>

                        {/* Topic */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Topic</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={activityToEdit.topic_id}
                                    onValueChange={(value) => setActivityToEdit(prev => ({ ...prev, topic_id: value }))}
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
                            <Text style={styles.label}>Mentor</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={activityToEdit.mentor_id}
                                    onValueChange={(value) => setActivityToEdit(prev => ({ ...prev, mentor_id: value }))}
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
                                value={activityToEdit.has_assessment}
                                onValueChange={(value) => setActivityToEdit(prev => ({ ...prev, has_assessment: value }))}
                            />
                        </View>

                        {activityToEdit.has_assessment && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Assessment Type</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={activityToEdit.assessment_type}
                                            onValueChange={(value) => setActivityToEdit(prev => ({ ...prev, assessment_type: value }))}
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
                                        value={activityToEdit.total_marks?.toString()}
                                        onChangeText={(value) => setActivityToEdit(prev => ({ ...prev, total_marks: parseInt(value) || 100 }))}
                                        keyboardType="numeric"
                                        placeholder="100"
                                    />
                                </View>
                            </>
                        )}

                        {/* Instructions */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Instructions</Text>
                            <TextInput
                                style={styles.textArea}
                                value={activityToEdit.activity_instructions}
                                onChangeText={(value) => setActivityToEdit(prev => ({ ...prev, activity_instructions: value }))}
                                placeholder="Enter activity instructions..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={handleSaveEditActivity} style={styles.createButton}>
                                <Text style={styles.createButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );

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
        <>
            <Modal visible={visible} animationType="slide">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Time-Based Activities</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.periodInfo}>
                        <Text style={styles.periodText}>
                            {selectedPeriod?.subject_name} - Period {selectedPeriod?.period_number}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(selectedPeriod?.timeStart)} - {formatTime(selectedPeriod?.timeEnd)}
                        </Text>
                    </View>

                    <ScrollView style={styles.content}>
                        {batches.map((batch, idx) => {
                            const existingActivities = getExistingActivitiesForBatch(batch.id);

                            return (
                                <View key={batch.id} style={styles.batchSection}>
                                    <View style={styles.batchHeader}>
                                        <Text style={styles.batchTitle}>
                                            Batch {batch.batch_level} ({batch.batch_name})
                                            {existingActivities.length > 0 && (
                                                <Text style={styles.activityCount}> • {existingActivities.length} existing</Text>
                                            )}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => addActivityToBatch(batch.id)}
                                            style={styles.addButton}
                                        >
                                            <Text style={styles.addIcon}>+</Text>
                                            <Text style={styles.addButtonText}>Add Activity</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {existingActivities.length > 0 && (
                                        <View style={styles.existingActivitiesSection}>
                                            <Text style={styles.existingActivitiesHeader}>Existing Activities:</Text>
                                            {existingActivities
                                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                                .map(activity => renderExistingActivity(activity))
                                            }
                                        </View>
                                    )}

                                    {/* FIX: Use batch.id consistently */}
                                    {batchActivities[batch.id]?.map(activity => (
                                        <View key={activity.id} style={styles.activityForm}>
                                            <View style={styles.activityHeader}>
                                                <Text style={styles.activityTitle}>New Activity</Text>
                                                <TouchableOpacity
                                                    onPress={() => removeActivity(batch.id, activity.id)}
                                                    style={styles.removeButton}
                                                >
                                                    <Text style={styles.removeIcon}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text style={styles.label}>Activity Type</Text>
                                                <View style={styles.pickerContainer}>
                                                    <Picker
                                                        selectedValue={activity.activity_type_id}
                                                        onValueChange={(value) => {
                                                            const selected = activities.find(a => a.id === value);
                                                            updateActivity(batch.id, activity.id, 'activity_type_id', value);
                                                            updateActivity(batch.id, activity.id, 'activity_type', selected ? selected.activity_name : '');
                                                            setSelectedActivity(value);
                                                        }}
                                                        style={styles.picker}
                                                    >
                                                        {activities.map(type => (
                                                            <Picker.Item key={type.id} label={type.activity_name} value={type.id} />
                                                        ))}
                                                    </Picker>
                                                </View> 
                                            </View>

                                            {selectedActivity && (
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.label}>Sub Activity</Text>
                                                    <View style={styles.pickerContainer}>
                                                        <Picker
                                                            selectedValue={activity.sub_activity_type_id}
                                                            onValueChange={(value) => {
                                                                updateActivity(batch.id, activity.id, 'sub_activity_type_id', value);
                                                                setSelectedSubActivity(value);
                                                            }}
                                                            style={styles.picker}
                                                        >
                                                            {subActivities.map(type => (
                                                                <Picker.Item key={type.id} label={type.sub_act_name} value={type.id} />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>
                                            )}

                                            <View style={styles.timeRow}>
                                                <View style={styles.timeGroup}>
                                                    <Text style={styles.label}>Start Time</Text>
                                                    <TouchableOpacity
                                                        style={styles.timeInput}
                                                        onPress={() => showTimePicker(batch.id, activity.id, 'start_time', activity.start_time)}
                                                    >
                                                        <Text>{activity.start_time || 'Select Time'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={styles.timeGroup}>
                                                    <Text style={styles.label}>End Time</Text>
                                                    <TouchableOpacity
                                                        style={styles.timeInput}
                                                        onPress={() => showTimePicker(batch.id, activity.id, 'end_time', activity.end_time)}
                                                    >
                                                        <Text>{activity.end_time || 'Select Time'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {timePicker.visible && timePicker.activityId === activity.id && (
                                                <DateTimePicker
                                                    value={
                                                        timePicker.value
                                                            ? (() => {
                                                                const [h, m] = timePicker.value.split(':');
                                                                const d = new Date();
                                                                d.setHours(parseInt(h, 10));
                                                                d.setMinutes(parseInt(m, 10));
                                                                d.setSeconds(0);
                                                                return d;
                                                            })()
                                                            : new Date()
                                                    }
                                                    mode="time"
                                                    is24Hour={true}
                                                    display="default"
                                                    onChange={handleTimeChange}
                                                />
                                            )}

                                            <View style={styles.formGroup}>
                                                <Text style={styles.label}>Topic *</Text>
                                                <View style={styles.pickerContainer}>
                                                    <Picker
                                                        selectedValue={activity.topic_id}
                                                        onValueChange={(value) => updateActivity(batch.id, activity.id, 'topic_id', value)}
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

                                            <View style={styles.formGroup}>
                                                <Text style={styles.label}>Mentor *</Text>
                                                <View style={styles.pickerContainer}>
                                                    <Picker
                                                        selectedValue={activity.mentor_id}
                                                        onValueChange={(value) => updateActivity(batch.id, activity.id, 'mentor_id', value)}
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

                                            <View style={styles.switchRow}>
                                                <Text style={styles.label}>Has Assessment</Text>
                                                <Switch
                                                    value={activity.has_assessment}
                                                    onValueChange={(value) => updateActivity(batch.id, activity.id, 'has_assessment', value)}
                                                />
                                            </View>

                                            {activity.has_assessment && (
                                                <>
                                                    <View style={styles.formGroup}>
                                                        <Text style={styles.label}>Assessment Type</Text>
                                                        <View style={styles.pickerContainer}>
                                                            <Picker
                                                                selectedValue={activity.assessment_type}
                                                                onValueChange={(value) => updateActivity(batch.id, activity.id, 'assessment_type', value)}
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
                                                            onChangeText={(value) => updateActivity(batch.id, activity.id, 'total_marks', parseInt(value) || 100)}
                                                            keyboardType="numeric"
                                                            placeholder="100"
                                                        />
                                                    </View>
                                                </>
                                            )}

                                            <View style={styles.formGroup}>
                                                <Text style={styles.label}>Instructions (Optional)</Text>
                                                <TextInput
                                                    style={styles.textArea}
                                                    value={activity.activity_instructions}
                                                    onChangeText={(value) => updateActivity(batch.id, activity.id, 'activity_instructions', value)}
                                                    placeholder="Enter activity instructions..."
                                                    multiline
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={createActivities} style={styles.createButton}>
                            <Text style={styles.createButtonText}>Create All Activities</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {renderEditModal()}
        </>
    );
};

// Styles remain unchanged
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
    closeIcon: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
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
        flex: 1,
    },
    activityCount: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'normal',
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
    addIcon: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    existingActivitiesSection: {
        marginBottom: 20,
    },
    existingActivitiesHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    existingActivity: {
        backgroundColor: '#e8f5e8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    existingActivityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    existingActivityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff0000ff',
        flex: 1,
    },
    existingActivityBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    existingActivityBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    existingActivityDetails: {
        gap: 4,
    },
    existingActivityDetail: {
        fontSize: 12,
        color: '#2e7d2e',
        lineHeight: 16,
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
    removeIcon: {
        fontSize: 16,
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
        height: 50,
        justifyContent: 'center'
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