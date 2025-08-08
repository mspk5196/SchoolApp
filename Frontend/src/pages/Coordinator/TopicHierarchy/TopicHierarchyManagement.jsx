import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '../../../utils/env.js';

const TopicHierarchyManagement = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades, activeGrade } = route.params || {};
  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // New/Edit Topic Form State
  const [formData, setFormData] = useState({
    topic_name: '',
    topic_code: '',
    parent_id: null,
    order_sequence: 1,
    has_assessment: true,
    has_homework: false,
    is_bottom_level: false,
    expected_completion_days: 7,
    pass_percentage: 60,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopicHierarchy();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects from:', `${API_URL}/api/coordinator/getSubjects`);
      const response = await fetch(`${API_URL}/api/coordinator/getSubjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Subjects response status:', response.status);
      const result = await response.json();
      console.log('Subjects result:', result);
      if (result.success) {
        setSubjects(result.subjects);
      }
    } catch (error) {
      console.error('Fetch subjects error:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const fetchTopicHierarchy = async () => {
    if (!selectedSubject || !activeGrade) return;
    setTopicHierarchy([]);
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/topics/hierarchy/${selectedSubject}/${activeGrade}`,
        { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' } 
        }
      );
      const result = await response.json();
      if (result.success) {
        console.log(
          `Fetched topic hierarchy for subject ${selectedSubject} and grade ${activeGrade}:`,
          result.data
        );
        
        setTopicHierarchy(result.data.hierarchy || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch topic hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    try {
      // Validation
      if (!formData.topic_name.trim()) {
        Alert.alert('Error', 'Topic name is required');
        return;
      }
      if (!formData.topic_code.trim()) {
        Alert.alert('Error', 'Topic code is required');
        return;
      }
      if (!selectedSubject) {
        Alert.alert('Error', 'Please select a subject first');
        return;
      }

      const payload = {
        subjectId: selectedSubject,
        parentId: formData.parent_id,
        level: formData.parent_id ? 2 : 1, // Calculate level based on parent
        topicName: formData.topic_name,
        topicCode: formData.topic_code,
        orderSequence: formData.order_sequence,
        hasAssessment: formData.has_assessment,
        hasHomework: formData.has_homework,
        isBottomLevel: formData.is_bottom_level,
        expectedCompletionDays: formData.expected_completion_days,
        passPercentage: formData.pass_percentage,
      };

      console.log('Sending payload:', payload);

      const url = editingTopic 
        ? `${API_URL}/api/topics/${editingTopic.id}`
        : `${API_URL}/api/topics/create`;

      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: editingTopic ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        Alert.alert('Success', `Topic ${editingTopic ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        resetForm();
        fetchTopicHierarchy();
      } else {
        Alert.alert('Error', result.message || result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Create topic error:', error);
      Alert.alert('Error', `Failed to save topic: ${error.message}`);
    }
  };

  const deleteTopic = async (topicId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this topic? This will also delete all subtopics and materials.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/api/topics/${topicId}`,
                {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              const result = await response.json();
              if (result.success) {
                Alert.alert('Success', 'Topic deleted successfully');
                fetchTopicHierarchy();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete topic');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      topic_name: '',
      topic_code: '',
      parent_id: null,
      order_sequence: 1,
      has_assessment: true,
      has_homework: false,
      is_bottom_level: false,
      expected_completion_days: 7,
      pass_percentage: 60,
    });
    setEditingTopic(null);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      topic_name: topic.topic_name,
      topic_code: topic.topic_code,
      parent_id: topic.parent_id,
      order_sequence: topic.order_sequence,
      has_assessment: Boolean(topic.has_assessment),
      has_homework: Boolean(topic.has_homework),
      is_bottom_level: Boolean(topic.is_bottom_level),
      expected_completion_days: topic.expected_completion_days,
      pass_percentage: topic.pass_percentage,
    });
    setModalVisible(true);
  };

  const openCreateModal = (parentId = null) => {
    resetForm();
    setFormData(prev => ({ ...prev, parent_id: parentId }));
    setModalVisible(true);
  };

  const toggleExpanded = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const renderTopicItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedTopics.has(item.id);

    return (
      <View style={[styles.topicItem, { marginLeft: level * 20 }]}>
        <View style={styles.topicHeader}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpanded(item.id)}
            disabled={!hasChildren}
          >
            <Text style={[styles.expandIcon, { color: hasChildren ? '#007AFF' : '#ccc' }]}>
              {hasChildren ? (isExpanded ? '▼' : '▶') : '●'}
            </Text>
          </TouchableOpacity>

          <View style={styles.topicInfo}>
            <Text style={styles.topicName}>{item.topic_name}</Text>
            <Text style={styles.topicCode}>{item.topic_code}</Text>
            <View style={styles.topicFlags}>
              {item.has_assessment ? <Text style={styles.flag}>Assessment</Text> : null}
              {item.has_homework ? <Text style={styles.flag}>Homework</Text> : null}
              {item.is_bottom_level ? <Text style={styles.flag}>Bottom Level</Text> : null}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openCreateModal(item.id)}
            >
              <Text style={styles.actionButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.actionButtonText}>✏</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteTopic(item.id)}
            >
              <Text style={styles.actionButtonText}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TopicMaterials', { topicId: item.id, topicName: item.topic_name })}
            >
              <Text style={styles.actionButtonText}>📁</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && hasChildren && (
          <FlatList
            data={item.children}
            renderItem={({ item: child }) => renderTopicItem({ item: child, level: level + 1 })}
            keyExtractor={(child) => child.id.toString()}
          />
        )}
      </View>
    );
  };

  const renderParentPicker = () => {
    const flattenTopics = (topics, level = 0) => {
      let result = [];
      topics.forEach(topic => {
        result.push({ ...topic, level });
        if (topic.children) {
          result = result.concat(flattenTopics(topic.children, level + 1));
        }
      });
      return result;
    };

    const flatTopics = flattenTopics(topicHierarchy);

    return (
      <Picker
        selectedValue={formData.parent_id}
        onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
        style={styles.picker}
      >
        <Picker.Item label="No Parent (Root Level)" value={null} />
        {flatTopics.map(topic => (
          <Picker.Item
            key={topic.id}
            label={`${'  '.repeat(topic.level)}${topic.topic_name}`}
            value={topic.id}
            enabled={!editingTopic || topic.id !== editingTopic.id}
          />
        ))}
      </Picker>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Topic Hierarchy Management</Text>
          {activeGrade && <Text style={styles.subtitle}>Grade {activeGrade}</Text>}
        </View>
      </View>

      <View style={styles.subjectSelector}>
        <Text style={styles.label}>Select Subject:</Text>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={setSelectedSubject}
          style={styles.picker}
        >
          <Picker.Item label="Select a subject..." value="" />
          {subjects.map(subject => (
            <Picker.Item
              key={subject.id}
              label={subject.subject_name}
              value={subject.id}
            />
          ))}
        </Picker>
      </View>

      {selectedSubject && (
        <View style={styles.addTopicSection}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openCreateModal()}
          >
            <Text style={styles.addButtonText}>+ Add Root Topic</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={topicHierarchy}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.hierarchyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTopic ? 'Edit Topic' : 'Create New Topic'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Topic Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.topic_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, topic_name: text }))}
                placeholder="Enter topic name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Topic Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.topic_code}
                onChangeText={(text) => setFormData(prev => ({ ...prev, topic_code: text }))}
                placeholder="Enter topic code"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Parent Topic</Text>
              {renderParentPicker()}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Order Sequence</Text>
              <TextInput
                style={styles.input}
                value={formData.order_sequence.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, order_sequence: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Order sequence"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expected Completion Days</Text>
              <TextInput
                style={styles.input}
                value={formData.expected_completion_days.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, expected_completion_days: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Expected completion days"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pass Percentage (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.pass_percentage.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pass_percentage: parseFloat(text) || 60 }))}
                keyboardType="numeric"
                placeholder="Pass percentage"
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Has Assessment</Text>
              <Switch
                value={formData.has_assessment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, has_assessment: value }))}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Has Homework</Text>
              <Switch
                value={formData.has_homework}
                onValueChange={(value) => setFormData(prev => ({ ...prev, has_homework: value }))}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Is Bottom Level</Text>
              <Switch
                value={formData.is_bottom_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_bottom_level: value }))}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={createTopic}>
              <Text style={styles.saveButtonText}>
                {editingTopic ? 'Update Topic' : 'Create Topic'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  subjectSelector: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addTopicSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  hierarchyList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topicItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  expandButton: {
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topicCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  topicFlags: {
    flexDirection: 'row',
    marginTop: 4,
  },
  flag: {
    fontSize: 12,
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TopicHierarchyManagement;
