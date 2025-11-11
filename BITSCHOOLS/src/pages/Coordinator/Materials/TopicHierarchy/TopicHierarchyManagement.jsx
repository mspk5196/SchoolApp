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
import Entypo  from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Foundation from 'react-native-vector-icons/Foundation';
import DocumentPicker from '@react-native-documents/picker';
import * as materialApi from '../../../../utils/materialApi';
import ApiService from '../../../../utils/ApiService';

const TopicHierarchyManagement = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades, activeGrade, selectedSubjectId, selectedSectionId, selectedSubjectName } = route.params || {};

  // Debug: Log the route params
  // console.log('TopicHierarchyManagement route params:', {
  //   coordinatorData,
  //   coordinatorGrades,
  //   activeGrade,
  //   selectedSubjectId,
  //   selectedSectionId
  // });

  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjectId);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [subActivities, setSubActivities] = useState([]);
  const [selectedSubActivity, setSelectedSubActivity] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(selectedSectionId);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  const [expectedDate, setExpectedDate] = useState(null);
  const [subjectBatches, setSubjectBatches] = useState([]);

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

  // useEffect(() => {
  //   fetchSubjects();
  //   // fetchSections();
  // }, []);

  useEffect(() => {
    // console.log('useEffect for activities triggered:', { selectedSubject, selectedSection });
    if (selectedSubject && selectedSection) {
      fetchActivitiesForSubject();
    } else {
      console.warn('Cannot fetch activities: missing selectedSubject or selectedSection');
    }
  }, [selectedSubject, selectedSection]);

  useEffect(() => {
    // console.log('useEffect for hierarchy triggered:', { selectedActivity, selectedSubActivity });
    if (selectedActivity && selectedSubActivity) {
      fetchTopicHierarchy();
    } else {
      console.warn('Cannot fetch hierarchy: missing selectedActivity or selectedSubActivity');
    }
  }, [selectedActivity, selectedSubActivity]);

  const fetchActivitiesForSubject = async () => {
    // console.log('fetchActivitiesForSubject called with:', { selectedSubject, selectedSection });
    try {

      const response = await ApiService.makeRequest(`/coordinator/topics/getSectionSubjectActivities/${selectedSection}/${selectedSubject}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // console.log('Activities response status:', response.status);
      const result = await response.json();
      // console.log('Activities result:', result);

      if (result.success) {
        // console.log('Fetched activities:', result.sectionSubjectActivity);
        setActivities(result.sectionSubjectActivity || []);
        if (result.sectionSubjectActivity.length > 0) {
          setSelectedActivity(result.sectionSubjectActivity[0].id);
          if (selectedActivity) {
            fetchSubActivitiesForSubject();
          }
        } else {
          setSelectedActivity(null);
        }
      } else {
        console.error('Failed to fetch activities:', result.message);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      Alert.alert('Error', 'Failed to fetch activities');
    }
  };

  const fetchSubActivitiesForSubject = async () => {
    // console.log('fetchSubActivitiesForSubject called with:', { selectedActivity, selectedSubject });
    try {

      const response = await ApiService.makeRequest(`/coordinator/topics/getSectionSubjectSubActivities/${selectedActivity}/${selectedSubject}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // console.log('Activities response status:', response.status);
      const result = await response.json();
      // console.log('Activities result:', result);

      if (result.success) {
        // console.log('Fetched activities:', result.sectionSubjectActivity);
        setSubActivities(result.sectionSubjectSubActivity || []);
        if (result.sectionSubjectSubActivity.length > 0) {
          setSelectedSubActivity(result.sectionSubjectSubActivity[0].id);
        } else {
          setSelectedSubActivity(null);
        }
      } else {
        console.error('Failed to fetch activities:', result.message);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      Alert.alert('Error', 'Failed to fetch activities');
    }
  };

  useEffect(() => {
    fetchSubActivitiesForSubject();
  }, [selectedSubject, selectedActivity]);

  const fetchTopicHierarchy = async () => {
    if (!selectedSubject || !selectedSection) return;
    setTopicHierarchy([]);
    // console.log('Fetching topic hierarchy for subject:', selectedSubject);

    setLoading(true);
    try {
      const result = await materialApi.getTopicHierarchy(selectedSubject, selectedSection);

      // console.log('Topic hierarchy response:', result);

      if (result && result.success) {
        // console.log(
        //   `Fetched topic hierarchy for subject ${selectedSubject}:`,
        //   result.hierarchy
        // );

        setTopicHierarchy(result.hierarchy || []);
      } else {
        console.error('Failed to fetch topic hierarchy:', result?.message);
        setTopicHierarchy([]);
      }
    } catch (error) {
      console.error('Fetch topic hierarchy error:', error);
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
      if (!selectedSubject || !selectedSection) {
        Alert.alert('Error', 'Please select a subject and section first');
        return;
      }

      const topicData = {
        subject_id: selectedSubject,
        section_id: selectedSection,
        parent_id: formData.parent_id,
        topic_name: formData.topic_name,
        topic_code: formData.topic_code,
        order_sequence: formData.order_sequence,
        has_assessment: formData.has_assessment,
        has_homework: formData.has_homework,
        is_bottom_level: formData.is_bottom_level,
        expected_completion_days: formData.expected_completion_days,
        pass_percentage: formData.pass_percentage,
      };

      console.log('Sending topic data:', topicData);

      const result = editingTopic
        ? await materialApi.updateTopic(editingTopic.id, topicData)
        : await materialApi.createTopic(topicData);

      // console.log('Response result:', result);

      if (result && result.success) {
        Alert.alert('Success', `Topic ${editingTopic ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        resetForm();
        fetchTopicHierarchy();
      } else {
        Alert.alert('Error', result?.message || result?.error || 'Unknown error occurred');
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
              const result = await materialApi.deleteTopic(topicId);

              if (result && result.success) {
                Alert.alert('Success', 'Topic deleted successfully');
                fetchTopicHierarchy();
              } else {
                Alert.alert('Error', result?.message || 'Failed to delete topic');
              }
            } catch (error) {
              console.error('Delete topic error:', error);
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
    console.log('Editing topic:', topic);

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

  // Excel Upload/Download Functions
  const handleDownloadMaterialsTemplate = async () => {
    try {
      setLoading(true);
      
      if (!selectedSubject || !selectedSection) {
        Alert.alert('Error', 'Please select subject and section first');
        return;
      }
      
      const result = await materialApi.downloadMaterialsTemplate(selectedSubject, selectedSection);
      
      if (result && result.success) {
        Alert.alert('Success', 'Materials template downloaded successfully!');
      } else {
        Alert.alert('Error', result?.message || 'Failed to download template');
      }
    } catch (error) {
      console.error('Download template error:', error);
      Alert.alert('Error', 'Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterialsExcel = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        setLoading(true);
        
        if (!selectedSubject || !selectedSection) {
          Alert.alert('Error', 'Please select subject and section first');
          return;
        }
        
        const uploadResult = await materialApi.uploadMaterialsExcel(
          selectedSubject,
          selectedSection,
          file
        );
        
        if (uploadResult && uploadResult.success) {
          Alert.alert(
            'Success',
            `Materials uploaded successfully!\n` +
            `Created: ${uploadResult.created || 0}\n` +
            `Updated: ${uploadResult.updated || 0}`
          );
          fetchTopicHierarchy();
        } else {
          Alert.alert('Error', uploadResult?.message || 'Failed to upload materials');
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload materials');
      }
    } finally {
      setLoading(false);
    }
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
              {hasChildren ? (isExpanded ? <AntDesign name="caretdown" color="#007AFF" size={18} /> : <AntDesign name="caretright" color="#007AFF" size={18} />) : <FontAwesome name="dot-circle-o" color="#ff0000ff" size={14} />}
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
              {/* <Text style={styles.actionButtonText}>+</Text> */}
              <Foundation name="folder-add" color="#000" size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              {/* <Text style={styles.actionButtonText}>✏</Text> */}
              <MaterialIcons name="edit-document" color="#000" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteTopic(item.id)}
            >
              {/* <Text style={styles.actionButtonText}>🗑</Text> */}
              <MaterialCommunityIcons name="delete-forever" color="#ff0000ff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TopicMaterials', { topicId: item.id, topicName: item.topic_name, selectedSubjectId, selectedSectionId, selectedSubject })}
            >
              {/* <Text style={styles.actionButtonText}>📁</Text> */}
              <Entypo  name="folder-video" size={24} color="#ffbb00ff" />  
              
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.title}>Topic Hierarchy Management</Text>
          {activeGrade && <Text style={styles.subtitle}>Grade {activeGrade}</Text>}
          <Text style={styles.subtitle}>Subject: {selectedSubjectName}</Text>
        </View>
      </View>

      {/* Section Selector */}
      {/* <View style={styles.selectorSection}>
        <Text style={styles.label}>Select Section:</Text>
        <Picker
          selectedValue={selectedSection}
          onValueChange={setSelectedSection}
          style={styles.picker}
        >
          <Picker.Item label="Select a section..." value="" />
          {sections.map(section => (
            <Picker.Item
              key={section.id}
              label={`Section ${section.section_name}`}
              value={section.id}
            />
          ))}
        </Picker>
      </View> */}

      {/* Subject Selector */}
      {/* <View style={styles.selectorSection}>
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
      </View> */}

      {/* Check if we have the required data */}
      {!selectedSubject || !selectedSection ? (
        <View style={styles.noDataSection}>
          <Text style={styles.noDataText}>
            Missing required data:
            {!selectedSubject && " Subject"}
            {!selectedSection && " Section"}
          </Text>
          <Text style={styles.noDataSubtext}>
            Please ensure you navigated here from a subject selection page.
          </Text>
        </View>
      ) : (
        <>
          {/* Activity Selector */}
          <View style={styles.subjectSelector}>
            <Text style={styles.label}>Select Activity Type:</Text>
            <Picker
              selectedValue={selectedActivity}
              onValueChange={setSelectedActivity}
              style={styles.picker}
            >
              <Picker.Item label="Select an activity..." value="" />
              {activities.map(activity => (
                <Picker.Item
                  key={activity.id}
                  label={activity.activity_name}
                  value={activity.id}
                />
              ))}
            </Picker>
          </View>

          {selectedActivity && (
            <View style={styles.subjectSelector}>
              <Text style={styles.label}>Select Sub Activity:</Text>
              <Picker
                selectedValue={selectedSubActivity}
                onValueChange={setSelectedSubActivity}
                style={styles.picker}
              >
                <Picker.Item label="Select an activity..." value="" />
                {subActivities.map(activity => (
                  <Picker.Item
                    key={activity.id}
                    label={activity.sub_act_name}
                    value={activity.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          {selectedSubActivity && (
            <View style={styles.addTopicSection}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openCreateModal()}
              >
                <Text style={styles.addButtonText}>+ Add Root Topic</Text>
              </TouchableOpacity>
              
              {/* Excel Upload/Download Buttons */}
              <View style={styles.excelButtonsRow}>
                <TouchableOpacity
                  style={[styles.excelButton, styles.downloadButton]}
                  onPress={handleDownloadMaterialsTemplate}
                >
                  <MaterialCommunityIcons name="download" size={18} color="#fff" />
                  <Text style={styles.excelButtonText}>Download Template</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.excelButton, styles.uploadButton]}
                  onPress={handleUploadMaterialsExcel}
                >
                  <MaterialCommunityIcons name="upload" size={18} color="#fff" />
                  <Text style={styles.excelButtonText}>Upload Excel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activities.length === 0 && selectedSubject && selectedSection && (
            <View style={styles.noDataSection}>
              <Text style={styles.noDataText}>No activities found for this subject</Text>
            </View>
          )}
        </>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : selectedActivity && topicHierarchy.length === 0 ? (
        <View style={styles.noDataSection}>
          <Text style={styles.noDataText}>No topics found for this activity</Text>
          <Text style={styles.noDataSubtext}>Click "Add Root Topic" to create the first topic</Text>
        </View>
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
              {/* <Text style={styles.closeButton}>✕</Text> */}
              <AntDesign name="closecircle" color="#ff0000ff" size={24} />
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
    // justifyContent: 'space-between',
    gap:20,
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
  expectedDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00a506ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,

  },
  expectedDateButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginHorizontal:'auto' 
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
  excelButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  excelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  downloadButton: {
    backgroundColor: '#9C27B0',
  },
  uploadButton: {
    backgroundColor: '#00BCD4',
  },
  excelButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TopicHierarchyManagement;
