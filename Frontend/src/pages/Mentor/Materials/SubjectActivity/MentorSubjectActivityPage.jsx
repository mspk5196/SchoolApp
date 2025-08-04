import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import styles from './SubjectActivityStyle';
import BackIcon from '../../../../assets/CoordinatorPage/Subjects/Back.svg';
import { API_URL } from "../../../../utils/env.js";

const MentorSubjectActivityPage = ({ navigation, route }) => {
  const { subject, subjectID, gradeID, grade } = route.params || {};
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [gradeID]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/mentor/getGradeSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeID }),
      });
      const data = await response.json();
      
      if (data.success) {
        // Find the activities for the current subject
        const currentSubject = data.gradeSubjects.find(s => s.subject_id === subjectID);
        if (currentSubject) {
          setActivities(currentSubject.activities);
        }
      } else {
        Alert.alert("Error", data.message || "Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityPress = (activity) => {
    navigation.navigate('MentorSubjectPage', {
      grade,
      gradeID,
      subject,
      subjectID,
      activity: activity.activity_name,
      activityID: activity.activity_id,
      section_subject_activity_id: activity.section_subject_activity_id
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.backIcon.width}
          height={styles.backIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>{subject} Activities</Text>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {activities.map((activity, index) => (
          <Pressable
            key={activity.activity_id}
            style={[
              styles.activityCard,
              { backgroundColor: (index % 2) ? '#C9F7F5' : '#65558F12' }
            ]}
            onPress={() => handleActivityPress(activity)}
          >
            <Text style={[
              styles.activityText,
              { color: (index % 2) ? '#0FBEB3' : '#65558F' }
            ]}>
              {activity.activity_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default MentorSubjectActivityPage;
