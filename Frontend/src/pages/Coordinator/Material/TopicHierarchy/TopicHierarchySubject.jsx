import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import BackIcon from '../../../../assets/CoordinatorPage/MaterialHome/Back.svg';
import { API_URL } from "../../../../utils/env.js";

const TopicHierarchySubject = ({ navigation, route }) => {
  const { grade, subject, subjectID, gradeID, coordinatorData } = route.params || {};
  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  useEffect(() => {
    fetchTopicHierarchy();
  }, [subjectID]);

  const fetchTopicHierarchy = async (isRefreshing = false) => {
    console.log(`Fetching topic hierarchy for subjectID: ${subjectID}, gradeID: ${gradeID}`);
    
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/api/topics/hierarchy/${subjectID}/${gradeID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success) {
        // The API returns a hierarchical structure, so we can use it directly
        setTopicHierarchy(data.hierarchy || []);
      } else {
        setTopicHierarchy([]);
        if (!isRefreshing) {
          Alert.alert("Info", "No topics found for this subject");
        }
      }
    } catch (error) {
      console.error("Error fetching topic hierarchy:", error);
      if (!isRefreshing) {
        Alert.alert("Error", "Failed to fetch topic hierarchy");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const organizeTopicsHierarchy = (topics) => {
    const topicMap = {};
    const rootTopics = [];

    // Create a map of all topics
    topics.forEach(topic => {
      topicMap[topic.id] = { ...topic, children: [] };
    });

    // Build the hierarchy
    topics.forEach(topic => {
      if (topic.parent_id === null) {
        rootTopics.push(topicMap[topic.id]);
      } else if (topicMap[topic.parent_id]) {
        topicMap[topic.parent_id].children.push(topicMap[topic.id]);
      }
    });

    return rootTopics;
  };

  const toggleTopicExpansion = (topicId) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const onRefresh = () => {
    fetchTopicHierarchy(true);
  };

  const renderTopicItem = (topic, level = 0) => {
    const hasChildren = topic.children && topic.children.length > 0;
    const isExpanded = expandedTopics.has(topic.id);
    const indentWidth = level * 20;

    return (
      <View key={topic.id} style={{ marginLeft: indentWidth }}>
        <TouchableOpacity
          style={styles.topicContainer}
          onPress={() => {
            if (hasChildren) {
              toggleTopicExpansion(topic.id);
            } else {
              navigation.navigate('TopicDetailsPage', {
                topic,
                subject,
                subjectID,
                grade,
                gradeID,
                coordinatorData
              });
            }
          }}
        >
          <View style={styles.topicHeader}>
            <View style={styles.topicTitleRow}>
              {hasChildren && (
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▼' : '▶'}
                </Text>
              )}
              <Text style={styles.topicTitle}>
                {level > 0 ? '└─ ' : ''}{topic.topic_name}
              </Text>
            </View>
            <Text style={styles.topicDetails}>
              Level {topic.level} • Code: {topic.topic_code}
              {topic.has_assessment ? ' • Assessment' : ''}
              {topic.has_homework ? ' • Homework' : ''}
            </Text>
            <Text style={styles.topicStatus}>
              {topic.is_bottom_level ? 'Bottom Level Topic' : 'Parent Topic'}
              {topic.expected_completion_days && ` • ${topic.expected_completion_days} days`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {topic.children.map(child => renderTopicItem(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackIcon
            width={24}
            height={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{subject} - {grade}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={styles.loadingText}>Loading topic hierarchy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={24}
          height={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{subject} - Topic Hierarchy</Text>
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
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                navigation.navigate('AddTopicPage', {
                  subjectID,
                  subject,
                  grade,
                  gradeID,
                  coordinatorData,
                  parentId: null // Root level topic
                });
              }}
            >
              <Text style={styles.primaryButtonText}>+ Add Root Topic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                navigation.navigate('TopicMaterialsOverview', {
                  subjectID,
                  subject,
                  grade,
                  gradeID,
                  coordinatorData
                });
              }}
            >
              <Text style={styles.secondaryButtonText}>📚 Manage Materials</Text>
            </TouchableOpacity>
          </View>
          
          {topicHierarchy && topicHierarchy.length > 0 ? (
            <View style={styles.hierarchyContainer}>
              <Text style={styles.sectionTitle}>Topic Hierarchy</Text>
              {topicHierarchy.map(topic => renderTopicItem(topic))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Topics Found</Text>
              <Text style={styles.emptySubtitle}>
                Create your first topic to get started with the hierarchy system
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  navigation.navigate('AddTopicPage', {
                    subjectID,
                    subject,
                    grade,
                    gradeID,
                    coordinatorData,
                    parentId: null
                  });
                }}
              >
                <Text style={styles.primaryButtonText}>+ Create First Topic</Text>
              </TouchableOpacity>
            </View>
          )}
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
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0C36FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0C36FF'
  },
  secondaryButtonText: {
    color: '#0C36FF',
    fontWeight: 'bold',
    fontSize: 14
  },
  hierarchyContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  topicContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0C36FF'
  },
  topicHeader: {
    flex: 1
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    width: 16
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  topicDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  topicStatus: {
    fontSize: 11,
    color: '#888',
    marginTop: 2
  },
  childrenContainer: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 8
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24
  }
};

export default TopicHierarchySubject;
