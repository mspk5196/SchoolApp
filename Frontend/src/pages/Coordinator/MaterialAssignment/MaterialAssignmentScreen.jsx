import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../../utils/env.js';

const MaterialAssignmentScreen = ({ navigation, route }) => {
  const { activeGrade, sectionId } = route.params;
  
  const [scheduleData, setScheduleData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchScheduleData();
    fetchAssignments();
  }, [sectionId, activeDay]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/coordinator/getWeeklySchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: sectionId,
          day: activeDay
        }),
      });

      const result = await response.json();
      if (result.success) {
        setScheduleData(result.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsForSubject = async (subjectId, activityType) => {
    try {
      const response = await fetch(`${API_URL}/coordinator/getMaterialsForAssignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: sectionId,
          subjectId: subjectId,
          activityType: activityType
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMaterials(result.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);

      const response = await fetch(`${API_URL}/coordinator/getPeriodMaterialAssignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: sectionId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAssignments(result.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handlePeriodPress = (period) => {
    setSelectedPeriod(period);
    fetchMaterialsForSubject(period.subject_id, period.activity_type);
    setShowMaterialModal(true);
  };

  const assignMaterial = async (material, topicTitle) => {
    try {
      const response = await fetch(`${API_URL}/coordinator/assignMaterialToPeriod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyScheduleId: selectedPeriod.id,
          materialId: material?.id || null,
          topicTitle: topicTitle || material?.title || material?.topic_title,
          assignedBy: 1 // Replace with actual coordinator ID
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Material assigned successfully!');
        setShowMaterialModal(false);
        fetchScheduleData();
        fetchAssignments();
      } else {
        Alert.alert('Error', result.message || 'Failed to assign material');
      }
    } catch (error) {
      console.error('Error assigning material:', error);
      Alert.alert('Error', 'Failed to assign material');
    }
  };

  const getAssignmentForPeriod = (periodId) => {
    return assignments.find(a => a.daily_schedule_id === periodId);
  };

  const renderScheduleItem = ({ item }) => {
    const assignment = getAssignmentForPeriod(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.scheduleItem, assignment && styles.assignedItem]}
        onPress={() => handlePeriodPress(item)}
      >
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {item.start_time} - {item.end_time}
          </Text>
          <Text style={styles.sessionText}>Period {item.session_no}</Text>
        </View>
        
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectText}>{item.subject_name}</Text>
          <Text style={styles.activityText}>{item.activity_type}</Text>
          <Text style={styles.mentorText}>👨‍🏫 {item.mentor_name}</Text>
        </View>
        
        {assignment && (
          <View style={styles.materialInfo}>
            <Text style={styles.materialTitle} numberOfLines={2}>
              📚 {assignment.material_title || assignment.topic_title}
            </Text>
            <Text style={styles.assignedDate}>
              Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {!assignment && (
          <View style={styles.noMaterialInfo}>
            <Text style={styles.noMaterialText}>📝 Tap to assign material</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMaterialItem = ({ item }) => (
    <TouchableOpacity
      style={styles.materialItem}
      onPress={() => assignMaterial(item)}
    >
      <View style={styles.materialHeader}>
        <Text style={styles.materialItemTitle} numberOfLines={2}>
          {item.title || item.topic_title}
        </Text>
        {item.is_topic_based && (
          <View style={styles.topicBadge}>
            <Text style={styles.topicBadgeText}>Topic</Text>
          </View>
        )}
        {item.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {item.level}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.materialType}>📄 {item.material_type}</Text>
      {item.topic_title && item.topic_title !== item.title && (
        <Text style={styles.materialTopic}>🎯 {item.topic_title}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Assignment</Text>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, activeDay === day && styles.activeDayButton]}
            onPress={() => setActiveDay(day)}
          >
            <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schedule List */}
      <FlatList
        data={scheduleData}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.scheduleList}
        showsVerticalScrollIndicator={false}
      />

      {/* Material Assignment Modal */}
      <Modal
        visible={showMaterialModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMaterialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assign Material for {selectedPeriod?.subject_name}
              </Text>
              <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {selectedPeriod?.activity_type} • Period {selectedPeriod?.session_no}
            </Text>

            {/* Topic-based Materials */}
            {materials.topic_based && materials.topic_based.length > 0 && (
              <View style={styles.materialSection}>
                <Text style={styles.sectionTitle}>📖 Topic-based Materials</Text>
                <FlatList
                  data={materials.topic_based}
                  renderItem={renderMaterialItem}
                  keyExtractor={(item) => `topic_${item.id}`}
                  showsVerticalScrollIndicator={false}
                  maxHeight={200}
                />
              </View>
            )}

            {/* Level-based Materials */}
            {materials.level_based && materials.level_based.length > 0 && (
              <View style={styles.materialSection}>
                <Text style={styles.sectionTitle}>📊 Level-based Materials</Text>
                <FlatList
                  data={materials.level_based}
                  renderItem={renderMaterialItem}
                  keyExtractor={(item) => `level_${item.id}`}
                  showsVerticalScrollIndicator={false}
                  maxHeight={200}
                />
              </View>
            )}

            {(!materials.topic_based?.length && !materials.level_based?.length) && (
              <View style={styles.noMaterialsContainer}>
                <Text style={styles.noMaterialsText}>
                  No materials available for this subject and activity type.
                </Text>
              </View>
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
  daySelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeDayButton: {
    backgroundColor: '#007bff',
  },
  dayText: {
    color: '#666',
    fontWeight: '500',
  },
  activeDayText: {
    color: '#fff',
  },
  scheduleList: {
    flex: 1,
    padding: 16,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignedItem: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  timeContainer: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionText: {
    fontSize: 14,
    color: '#666',
  },
  subjectContainer: {
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mentorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  materialInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e20',
  },
  assignedDate: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
  },
  noMaterialInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noMaterialText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
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
    marginBottom: 8,
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
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  materialSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  materialItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  materialItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  topicBadge: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  topicBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  materialType: {
    fontSize: 12,
    color: '#666',
  },
  materialTopic: {
    fontSize: 12,
    color: '#6f42c1',
    marginTop: 2,
  },
  noMaterialsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noMaterialsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
};

export default MaterialAssignmentScreen;
