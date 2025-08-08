import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/MaterialHome/Back.svg';
import { API_URL } from "../../../../utils/env.js";

const TopicDetailsPage = ({ navigation, route }) => {
  const { topic, subject, subjectID, grade, gradeID, coordinatorData } = route.params || {};
  const [topicDetails, setTopicDetails] = useState(topic);
  const [materials, setMaterials] = useState([]);
  const [homework, setHomework] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTopicData();
  }, [topic.id]);

  const fetchTopicData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      // Fetch topic materials
      const materialsResponse = await fetch(`${API_URL}/api/coordinator/topics/${topic.id}/materials`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      const materialsData = await materialsResponse.json();
      if (materialsData.success) {
        setMaterials(materialsData.data || []);
      }

      // Fetch topic homework if it has homework
      if (topic.has_homework) {
        // TODO: Implement homework API endpoint
        // For now, we'll just set empty array
        setHomework([]);
        
        // Future implementation:
        // const homeworkResponse = await fetch(`${API_URL}/api/coordinator/topics/${topic.id}/homework`, {
        //   method: "GET",
        //   headers: { "Content-Type": "application/json" }
        // });
        // 
        // const homeworkData = await homeworkResponse.json();
        // if (homeworkData.success) {
        //   setHomework(homeworkData.data || []);
        // }
      }

    } catch (error) {
      console.error("Error fetching topic data:", error);
      if (!isRefreshing) {
        Alert.alert("Error", "Failed to fetch topic data");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchTopicData(true);
  };

  const handleDeleteTopic = () => {
    Alert.alert(
      "Delete Topic",
      "Are you sure you want to delete this topic? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: confirmDeleteTopic
        }
      ]
    );
  };

  const confirmDeleteTopic = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/topics/${topic.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "Success",
          "Topic deleted successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      Alert.alert("Error", "Failed to delete topic");
    }
  };

  const MaterialTypeCard = ({ materials, type, icon, color }) => {
    const typeMaterials = materials.filter(m => m.material_type === type);
    
    return (
      <TouchableOpacity
        style={[styles.materialTypeCard, { borderLeftColor: color }]}
        onPress={() => {
          navigation.navigate('TopicMaterialsPage', {
            topic: topicDetails,
            materialType: type,
            subject,
            subjectID,
            grade,
            gradeID,
            coordinatorData
          });
        }}
      >
        <View style={styles.materialTypeHeader}>
          <Text style={styles.materialTypeIcon}>{icon}</Text>
          <View style={styles.materialTypeInfo}>
            <Text style={styles.materialTypeName}>{type.replace('_', ' ')}</Text>
            <Text style={styles.materialTypeCount}>
              {typeMaterials.length} material{typeMaterials.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{topicDetails.topic_name}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      >
        <View style={styles.content}>
          {/* Topic Information Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Topic Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Topic Code:</Text>
              <Text style={styles.infoValue}>{topicDetails.topic_code}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level:</Text>
              <Text style={styles.infoValue}>{topicDetails.level}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order:</Text>
              <Text style={styles.infoValue}>{topicDetails.order_sequence}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Days:</Text>
              <Text style={styles.infoValue}>{topicDetails.expected_completion_days} days</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pass Percentage:</Text>
              <Text style={styles.infoValue}>{topicDetails.pass_percentage}%</Text>
            </View>
            <View style={styles.badgeContainer}>
              {topicDetails.has_assessment && (
                <View style={[styles.badge, { backgroundColor: '#E6F7FF' }]}>
                  <Text style={[styles.badgeText, { color: '#1890FF' }]}>Has Assessment</Text>
                </View>
              )}
              {topicDetails.has_homework && (
                <View style={[styles.badge, { backgroundColor: '#F6FFED' }]}>
                  <Text style={[styles.badgeText, { color: '#52C41A' }]}>Has Homework</Text>
                </View>
              )}
              {topicDetails.is_bottom_level && (
                <View style={[styles.badge, { backgroundColor: '#FFF2E8' }]}>
                  <Text style={[styles.badgeText, { color: '#FA8C16' }]}>Bottom Level</Text>
                </View>
              )}
            </View>
          </View>

          {/* Materials Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Materials</Text>
            <MaterialTypeCard 
              materials={materials}
              type="Academic"
              icon="📚"
              color="#1890FF"
            />
            <MaterialTypeCard 
              materials={materials}
              type="Classwork_Period"
              icon="✏️"
              color="#52C41A"
            />
            <MaterialTypeCard 
              materials={materials}
              type="Assessment"
              icon="📝"
              color="#FA8C16"
            />
          </View>

          {/* Homework Section */}
          {topicDetails.has_homework && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Homework</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    navigation.navigate('AddHomeworkPage', {
                      topic: topicDetails,
                      subject,
                      subjectID,
                      grade,
                      gradeID,
                      coordinatorData
                    });
                  }}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {homework.length > 0 ? (
                homework.map((hw, index) => (
                  <TouchableOpacity
                    key={hw.id || index}
                    style={styles.homeworkItem}
                    onPress={() => {
                      navigation.navigate('HomeworkDetailsPage', {
                        homework: hw,
                        topic: topicDetails,
                        subject,
                        subjectID,
                        grade,
                        gradeID,
                        coordinatorData
                      });
                    }}
                  >
                    <Text style={styles.homeworkTitle}>{hw.homework_title}</Text>
                    <Text style={styles.homeworkDescription} numberOfLines={2}>
                      {hw.description}
                    </Text>
                    <Text style={styles.homeworkDuration}>
                      Estimated: {hw.estimated_duration} minutes
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No homework assigned yet</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate('EditTopicPage', {
                  topic: topicDetails,
                  subject,
                  subjectID,
                  grade,
                  gradeID,
                  coordinatorData
                });
              }}
            >
              <Text style={styles.editButtonText}>✏️ Edit Topic</Text>
            </TouchableOpacity>

            {!topicDetails.is_bottom_level && (
              <TouchableOpacity
                style={styles.addSubTopicButton}
                onPress={() => {
                  navigation.navigate('AddTopicPage', {
                    subjectID,
                    subject,
                    grade,
                    gradeID,
                    coordinatorData,
                    parentId: topicDetails.id
                  });
                }}
              >
                <Text style={styles.addSubTopicButtonText}>+ Add Sub-Topic</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTopic}
            >
              <Text style={styles.deleteButtonText}>🗑️ Delete Topic</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  materialTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4
  },
  materialTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  materialTypeIcon: {
    fontSize: 24,
    marginRight: 12
  },
  materialTypeInfo: {
    flex: 1
  },
  materialTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  materialTypeCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  addButton: {
    backgroundColor: '#0C36FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  homeworkItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  homeworkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  homeworkDuration: {
    fontSize: 12,
    color: '#888'
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20
  },
  actionButtonsContainer: {
    gap: 12
  },
  editButton: {
    backgroundColor: '#0C36FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  addSubTopicButton: {
    backgroundColor: '#52C41A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  addSubTopicButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  deleteButton: {
    backgroundColor: '#FF4D4F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
};

export default TopicDetailsPage;
