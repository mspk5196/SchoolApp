import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';

const ActivityTypeConfiguration = ({ navigation, route }) => {
  const { sectionId, sectionName, gradeId } = route.params;
  
  const [subjects, setSubjects] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentMarkingType, setCurrentMarkingType] = useState('attentiveness');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSubjects(),
        fetchActivityTypes(),
        fetchConfigurations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: sectionId }),
      });

      const result = await response.json();
      if (result.success) {
        setSubjects(result.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getActivityTypesWithConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: sectionId }),
      });

      const result = await response.json();
      if (result.success) {
        setActivityTypes(result.activityTypes || []);
      }
    } catch (error) {
      console.error('Error fetching activity types:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getActivityTypeConfigurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: sectionId }),
      });

      const result = await response.json();
      if (result.success) {
        setConfigurations(result.configurations || []);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const getConfigurationForSubjectActivity = (subjectId, activityTypeId) => {
    return configurations.find(
      c => c.subject_id === subjectId && c.activity_type_id === activityTypeId
    );
  };

  const openConfigModal = (subject, activityType) => {
    const existingConfig = getConfigurationForSubjectActivity(subject.id, activityType.id);
    
    setSelectedSubject(subject);
    setSelectedActivity(activityType);
    setCurrentMarkingType(existingConfig?.current_marking_type || activityType.default_marking_type);
    setShowConfigModal(true);
  };

  const saveConfiguration = async () => {
    try {
      const response = await fetch(`${API_URL}/coordinator/updateActivityTypeConfiguration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: sectionId,
          subjectId: selectedSubject.id,
          activityTypeId: selectedActivity.id,
          markingType: currentMarkingType,
          updatedBy: 1 // Replace with actual coordinator ID
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Configuration updated successfully!');
        setShowConfigModal(false);
        fetchConfigurations();
      } else {
        Alert.alert('Error', result.message || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      Alert.alert('Error', 'Failed to update configuration');
    }
  };

  const getMarkingTypeColor = (markingType) => {
    switch (markingType) {
      case 'attentiveness': return '#28a745';
      case 'marks': return '#007bff';
      case 'flexible': return '#6f42c1';
      default: return '#666';
    }
  };

  const getMarkingTypeIcon = (markingType) => {
    switch (markingType) {
      case 'attentiveness': return '👀';
      case 'marks': return '📊';
      case 'flexible': return '🔄';
      default: return '❓';
    }
  };

  const renderSubjectItem = ({ item: subject }) => (
    <View style={styles.subjectCard}>
      <Text style={styles.subjectName}>{subject.subject_name}</Text>
      <Text style={styles.subjectInfo}>Grade: {subject.grade_name}</Text>
      
      <View style={styles.activityTypesContainer}>
        {activityTypes.map((activityType) => {
          const config = getConfigurationForSubjectActivity(subject.id, activityType.id);
          const currentMarking = config?.current_marking_type || activityType.default_marking_type;
          
          return (
            <TouchableOpacity
              key={activityType.id}
              style={[
                styles.activityTypeItem,
                { borderColor: getMarkingTypeColor(currentMarking) }
              ]}
              onPress={() => openConfigModal(subject, activityType)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityTypeName}>
                  {activityType.activity_type}
                </Text>
                <Text style={styles.activityIcon}>
                  {getMarkingTypeIcon(currentMarking)}
                </Text>
              </View>
              
              <View style={[
                styles.markingTypeBadge,
                { backgroundColor: getMarkingTypeColor(currentMarking) }
              ]}>
                <Text style={styles.markingTypeText}>
                  {currentMarking.charAt(0).toUpperCase() + currentMarking.slice(1)}
                </Text>
              </View>
              
              {config && (
                <Text style={styles.lastUpdated}>
                  Updated: {new Date(config.updated_at).toLocaleDateString()}
                </Text>
              )}
              
              {!config && (
                <Text style={styles.defaultSetting}>
                  (Default Setting)
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Configuration</Text>
      </View>

      <View style={styles.sectionInfo}>
        <Text style={styles.sectionTitle}>
          ⚙️ {sectionName} - Activity Type Configuration
        </Text>
        <Text style={styles.sectionDescription}>
          Configure marking types for each subject and activity combination.
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Marking Types:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>👀</Text>
            <Text style={styles.legendText}>Attentiveness</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>📊</Text>
            <Text style={styles.legendText}>Marks</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🔄</Text>
            <Text style={styles.legendText}>Flexible</Text>
          </View>
        </View>
      </View>

      {/* Subjects List */}
      <FlatList
        data={subjects}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.subjectsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchData}
      />

      {/* Configuration Modal */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configure Marking Type</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSubject && selectedActivity && (
              <>
                <Text style={styles.modalSubtitle}>
                  Subject: {selectedSubject.subject_name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Activity: {selectedActivity.activity_type}
                </Text>

                <View style={styles.markingOptions}>
                  <Text style={styles.optionsTitle}>Select Marking Type:</Text>
                  
                  {selectedActivity.activity_type === 'Member Activity' || 
                   selectedActivity.activity_type === 'ECA' ? (
                    // Flexible activities can choose between attentiveness and marks
                    <>
                      <TouchableOpacity
                        style={[
                          styles.markingOption,
                          currentMarkingType === 'attentiveness' && styles.selectedOption
                        ]}
                        onPress={() => setCurrentMarkingType('attentiveness')}
                      >
                        <Text style={styles.optionIcon}>👀</Text>
                        <View style={styles.optionInfo}>
                          <Text style={styles.optionTitle}>Attentiveness</Text>
                          <Text style={styles.optionDescription}>
                            Track student engagement levels (Very Attentive, Attentive, Average, etc.)
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.markingOption,
                          currentMarkingType === 'marks' && styles.selectedOption
                        ]}
                        onPress={() => setCurrentMarkingType('marks')}
                      >
                        <Text style={styles.optionIcon}>📊</Text>
                        <View style={styles.optionInfo}>
                          <Text style={styles.optionTitle}>Marks</Text>
                          <Text style={styles.optionDescription}>
                            Record numerical scores and grades for performance evaluation
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Fixed activities show their default marking type
                    <View style={styles.fixedMarkingInfo}>
                      <Text style={styles.fixedMarkingTitle}>
                        {getMarkingTypeIcon(selectedActivity.default_marking_type)} Fixed Marking Type
                      </Text>
                      <Text style={styles.fixedMarkingDescription}>
                        {selectedActivity.activity_type} activities use{' '}
                        <Text style={styles.markingTypeHighlight}>
                          {selectedActivity.default_marking_type}
                        </Text>{' '}
                        marking by default and cannot be changed.
                      </Text>
                    </View>
                  )}
                </View>

                {(selectedActivity.activity_type === 'Member Activity' || 
                  selectedActivity.activity_type === 'ECA') && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveConfiguration}
                  >
                    <Text style={styles.saveButtonText}>💾 Save Configuration</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
  },
  legend: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  subjectsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subjectCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  activityTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityTypeItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activityIcon: {
    fontSize: 16,
  },
  markingTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  markingTypeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#666',
  },
  defaultSetting: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  markingOptions: {
    marginTop: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  markingOption: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  fixedMarkingInfo: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  fixedMarkingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  fixedMarkingDescription: {
    fontSize: 14,
    color: '#856404',
  },
  markingTypeHighlight: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default ActivityTypeConfiguration;
