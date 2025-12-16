import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../../utils/ApiService';
import styles from './VenueMappingStyle';
import { Header } from '../../../../components';

// Recursive renderer for hierarchical activity tree
const ActivityNode = ({ node, level = 0, onSelect }) => {
  return (
    <View style={{ paddingLeft: level * 16 }}>
      <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 16 }} onPress={() => onSelect(node)}>
        <Text style={{ fontSize: 14, color: '#333' }}>{node.activity_name}</Text>
      </TouchableOpacity>
      {Array.isArray(node.children) && node.children.length > 0 && (
        node.children.map(child => (
          <ActivityNode key={child.id} node={child} level={level + 1} onSelect={onSelect} />
        ))
      )}
    </View>
  );
};

const VenueMapping = ({ navigation, route }) => {
  const { venueId, venueName } = route.params;

  const [loading, setLoading] = useState(false);
  const [mappingType, setMappingType] = useState(null); // 'grade', 'section', 'batch', 'activity'
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]); // hierarchical tree
  const [existingMappings, setExistingMappings] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchGrades(),
        fetchExistingMappings()
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await ApiService.get('/coordinator/enrollment/mapping/grades');
      setGrades(response || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSections = async (gradeId) => {
    try {
      const response = await ApiService.post('/coordinator/enrollment/mapping/sections', { gradeId });
      setSections(response || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchBatches = async (sectionId) => {
    try {
      const response = await ApiService.post('/coordinator/enrollment/mapping/batches', { sectionId });
      setBatches(response || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchSubjects = async (sectionId) => {
    try {
      const resp = await ApiService.post('/coordinator/getSectionSubjects', { sectionId });
      const data = Array.isArray(resp) ? resp : (resp?.data || []);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchActivities = async (sectionId, subjectId) => {
    try {
      const response = await ApiService.post('/coordinator/enrollment/mapping/activities', { sectionId, subjectId });
      const tree = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      setActivities(tree);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchExistingMappings = async () => {
    try {
      const response = await ApiService.post('/coordinator/enrollment/mapping/get', { venueId });
      setExistingMappings(response || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setGradeModalVisible(false);
    setMappingType('grade');
    // Fetch sections for the selected grade
    fetchSections(grade.id);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    fetchBatches(section.id);
    fetchSubjects(section.id);
    setSectionModalVisible(false);
    setMappingType('section');
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    // derive subject from batch and store
    if (batch && (batch.subject_id || batch.subject_name)) {
      setSelectedSubject({ id: batch.subject_id, subject_name: batch.subject_name });
    }
    setBatchModalVisible(false);
    // if context complete, fetch activities and open activity modal
    if (selectedSection && (batch?.subject_id)) {
      fetchActivities(selectedSection.id, batch.subject_id);
      setMappingType('activity');
      setActivityModalVisible(true);
    } else {
      setMappingType('batch');
    }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setActivityModalVisible(false);
    setMappingType('activity');
  };

  const handleCreateMapping = async () => {
    if (!mappingType) {
      Alert.alert('Error', 'Please select a mapping type');
      return;
    }

    let mappingData = { venueId };

    if (mappingType === 'grade') {
      if (!selectedGrade) {
        Alert.alert('Error', 'Please select a grade');
        return;
      }
      mappingData.gradeId = selectedGrade.id;
    } else if (mappingType === 'section') {
      if (!selectedGrade || !selectedSection) {
        Alert.alert('Error', 'Please select grade and section');
        return;
      }
      mappingData.gradeId = selectedGrade.id;
      mappingData.sectionId = selectedSection.id;
    } else if (mappingType === 'batch') {
      if (!selectedGrade || !selectedSection || !selectedBatch) {
        Alert.alert('Error', 'Please select grade, section and batch');
        return;
      }
      mappingData.gradeId = selectedGrade.id;
      mappingData.sectionId = selectedSection.id;
      mappingData.batchId = selectedBatch.id;
    } else if (mappingType === 'activity') {
      if (!selectedActivity) {
        Alert.alert('Error', 'Please select an activity');
        return;
      }

      // Always include available context so that
      // grade_id, section_id, batch_id are also stored
      if (selectedGrade) {
        mappingData.gradeId = selectedGrade.id;
      }
      if (selectedSection) {
        mappingData.sectionId = selectedSection.id;
      }
      if (selectedBatch) {
        mappingData.batchId = selectedBatch.id;
      }
      mappingData.contextActivityId = selectedActivity.id;
    } else {
      Alert.alert('Error', 'Please complete the selection');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.post('/coordinator/enrollment/mapping/create', mappingData);
      if (response?.success) {
        Alert.alert('Success', 'Mapping created successfully', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedGrade(null);
              setSelectedSection(null);
              setSelectedBatch(null);
              setSelectedActivity(null);
              setMappingType(null);
              fetchExistingMappings();
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create mapping');
      console.error('Error creating mapping:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    Alert.alert('Delete Mapping', 'Are you sure you want to delete this mapping?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const response = await ApiService.post('/coordinator/enrollment/mapping/delete', { mappingId });
            if (response?.success) {
              Alert.alert('Success', 'Mapping deleted successfully');
              fetchExistingMappings();
            }
          } catch (error) {
            Alert.alert('Error', error?.message || 'Failed to delete mapping');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const getMappingLabel = (mapping) => {
    if (mapping.grade_name) return mapping.grade_name;
    if (mapping.section_name) return `${mapping.grade_name} - ${mapping.section_name}`;
    if (mapping.batch_name) return mapping.batch_name;
    if (mapping.activity_name) return mapping.activity_name;
    return 'Unknown';
  };

  const renderMappingType = () => {
    return (
      <View style={styles.mappingTypeContainer}>
        <Text style={styles.label}>Select Mapping Type</Text>
        <View style={styles.typeButtonsContainer}>
          <TouchableOpacity
            style={[styles.typeButton, mappingType === 'grade' && styles.typeButtonActive]}
            onPress={() => {
              setMappingType('grade');
              setGradeModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="book" size={24} color={mappingType === 'grade' ? '#fff' : '#333'} />
            <Text style={[styles.typeButtonText, mappingType === 'grade' && styles.typeButtonTextActive]}>Grade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, mappingType === 'section' && styles.typeButtonActive]}
            onPress={() => {
              if (selectedGrade) {
                setSectionModalVisible(true);
              } else {
                setMappingType('section');
                setGradeModalVisible(true);
              }
            }}
          >
            <MaterialCommunityIcons name="layers" size={24} color={mappingType === 'section' ? '#fff' : '#333'} />
            <Text style={[styles.typeButtonText, mappingType === 'section' && styles.typeButtonTextActive]}>Section</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, mappingType === 'batch' && styles.typeButtonActive]}
            onPress={() => {
              setMappingType('batch');
              if (!selectedGrade) { setGradeModalVisible(true); return; }
              if (!selectedSection) { setSectionModalVisible(true); return; }
              setBatchModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="group" size={24} color={mappingType === 'batch' ? '#fff' : '#333'} />
            <Text style={[styles.typeButtonText, mappingType === 'batch' && styles.typeButtonTextActive]}>Batch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, mappingType === 'activity' && styles.typeButtonActive]}
            onPress={() => {
              setMappingType('activity');
              if (!selectedGrade) { setGradeModalVisible(true); return; }
              if (!selectedSection) { setSectionModalVisible(true); return; }
              if (!selectedSubject) { setSubjectModalVisible(true); return; }
              fetchActivities(selectedSection.id, selectedSubject.id);
              setActivityModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="star" size={24} color={mappingType === 'activity' ? '#fff' : '#333'} />
            <Text style={[styles.typeButtonText, mappingType === 'activity' && styles.typeButtonTextActive]}>Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSelectionSummary = () => {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.label}>Selection Summary</Text>
        <View style={styles.summaryItem}>
          {selectedGrade && <Text style={styles.summaryText}>Grade: {selectedGrade.grade_name}</Text>}
          {selectedSection && <Text style={styles.summaryText}>Section: {selectedSection.section_name}</Text>}
          {selectedSubject && <Text style={styles.summaryText}>Subject: {selectedSubject.subject_name || selectedSubject.name}</Text>}
          {mappingType === 'batch' && selectedBatch && (
            <Text style={styles.summaryText}>Batch: {selectedBatch.batch_name}</Text>
          )}
          {mappingType === 'activity' && selectedActivity && (
            <Text style={styles.summaryText}>Activity: {selectedActivity.activity_name}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Header */}
      <Header title={`Map Venue: ${venueName}`} navigation={navigation}/>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3557FF" />
        </View>
      )}

      {!loading && (
        <ScrollView style={styles.content}>
          {renderMappingType()}

          {mappingType && renderSelectionSummary()}

          {/* Create Button */}
          {mappingType && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateMapping}
              disabled={loading}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Create Mapping</Text>
            </TouchableOpacity>
          )}

          {/* Existing Mappings */}
          <View style={styles.existingMappingsContainer}>
            <Text style={styles.label}>Existing Mappings</Text>
            {existingMappings.length > 0 ? (
              <View>
                {existingMappings.map((mapping) => (
                  <View key={mapping.id} style={styles.mappingItem}>
                    <View style={styles.mappingContent}>
                      <MaterialCommunityIcons name="map-marker" size={20} color="#3557FF" />
                      <Text style={styles.mappingLabel}>{getMappingLabel(mapping)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMapping(mapping.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noMappingsText}>No mappings yet. Create one above!</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Grade Selection Modal */}
      <Modal visible={gradeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Grade</Text>
              <TouchableOpacity onPress={() => setGradeModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={grades}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleGradeSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.grade_name}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* Section Selection Modal */}
      <Modal visible={sectionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Section</Text>
              <TouchableOpacity onPress={() => setSectionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSectionSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.section_name}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* Batch Selection Modal */}
      <Modal visible={batchModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Batch</Text>
              <TouchableOpacity onPress={() => setBatchModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={batches}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleBatchSelect(item)}
                >
                  <Text style={styles.modalItemText}>{`${item.subject_name} - ${item.batch_name}`}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal visible={subjectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setSubjectModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={subjects}
              keyExtractor={(item) => (item.id ?? item.subject_id).toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setSelectedSubject({ id: (item.id ?? item.subject_id), subject_name: item.subject_name || item.name }); setSubjectModalVisible(false); }}
                >
                  <Text style={styles.modalItemText}>{item.subject_name || item.name}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* Activity Selection Modal */}
      <Modal visible={activityModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Activity</Text>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {Array.isArray(activities) && activities.map(node => (
                <ActivityNode key={node.id} node={node} onSelect={handleActivitySelect} />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VenueMapping;
