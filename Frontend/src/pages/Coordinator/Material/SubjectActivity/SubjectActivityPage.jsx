import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import styles from '../Subject/SubjectStyle';
import BackIcon from '../../../../assets/CoordinatorPage/MaterialHome/Back.svg';
import { API_URL } from "../../../../utils/env.js";

const SubjectActivityPage = ({ navigation, route }) => {
  const { grade, subject, subjectID, gradeID, coordinatorData } = route.params || {};
  const [topicHierarchy, setTopicHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTopicHierarchy();
  }, [subjectID]);

  const fetchTopicHierarchy = async (isRefreshing = false) => {
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
        // Flatten the hierarchy for simple list display
        const flattenTopics = (topics) => {
          let result = [];
          topics.forEach(topic => {
            result.push(topic);
            if (topic.children && topic.children.length > 0) {
              result = result.concat(flattenTopics(topic.children));
            }
          });
          return result;
        };
        
        setTopicHierarchy(flattenTopics(data.data.hierarchy || []));
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

  const onRefresh = () => {
    fetchTopicHierarchy(true);
  };

  const renderTopicItem = (topic) => {
    return (
      <TouchableOpacity
        key={topic.id}
        style={[styles.levelContainer, { marginTop: 15, marginLeft: topic.level * 20 }]}
        onPress={() => {
          navigation.navigate('TopicDetailsPage', {
            topic,
            subject,
            subjectID,
            grade,
            gradeID,
            coordinatorData
          });
        }}
      >
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>
            {topic.level > 1 ? '└─ ' : ''}{topic.topic_name}
          </Text>
          <Text style={styles.expectedDate}>
            Level {topic.level} • {topic.has_assessment ? 'Has Assessment' : 'No Assessment'}
            {topic.has_homework ? ' • Has Homework' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>{subject} - {grade}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading topic hierarchy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>{subject} - {grade}</Text>
      </View>

      <ScrollView 
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      >
        <View style={styles.gradeContainer}>
          <Text style={styles.gradeText}>Topic Hierarchy</Text>
          
          {/* Add Topic Button */}
          <TouchableOpacity
            style={[styles.levelContainer, { backgroundColor: '#0C36FF', marginTop: 15 }]}
            onPress={() => {
              navigation.navigate('AddTopicPage', {
                subjectID,
                subject,
                grade,
                gradeID,
                coordinatorData
              });
            }}
          >
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, { color: 'white' }]}>+ Add New Topic</Text>
              <Text style={[styles.expectedDate, { color: '#E6F0FF' }]}>Create a new topic in the hierarchy</Text>
            </View>
          </TouchableOpacity>
          
          {topicHierarchy && topicHierarchy.length > 0 ? (
            topicHierarchy.map((topic) => renderTopicItem(topic))
          ) : (
            <View style={styles.noMaterialsContainer}>
              <Text style={styles.noMaterialsText}>No topics found for this subject</Text>
              <Text style={[styles.noMaterialsText, { fontSize: 14, marginTop: 5 }]}>
                Tap "Add New Topic" to create your first topic
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectActivityPage;
