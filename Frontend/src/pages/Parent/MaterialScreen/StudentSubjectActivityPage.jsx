import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import styles from './StudentSubjectActivityStyle';
import { API_URL } from "../../../utils/env.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentSubjectActivityPage = ({ navigation, route }) => {
  const { subject, subjectID } = route.params || {};
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentData && studentData.section_id) {
      fetchActivities();
    }
  }, [studentData, subjectID]);

  const fetchStudentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/student/getMaterialsAndCompletedLevels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: studentData.section_id,
          subject_id: subjectID,
          student_roll: studentData.roll
        })
      });
      const data = await response.json();
      
      if (data.success && data.activities) {
        setActivities(data.activities);
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
    navigation.navigate('StudentPageMaterialScreen', {
      subject,
      subjectID,
      activity: activity.activity_name,
      activityID: activity.activity_id,
      section_subject_activity_id: activity.section_subject_activity_id,
      activityData: activity // Pass the entire activity data including materials and completed levels
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
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
            <Text style={styles.materialCount}>
              {activity.materials.length} materials
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentSubjectActivityPage;
