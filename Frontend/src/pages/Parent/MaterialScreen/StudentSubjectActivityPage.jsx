import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, Alert, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import styles from './StudentSubjectActivityStyle.jsx';
import { API_URL } from "../../../utils/env.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../../../assets/ParentPage/basic-img/Backicon.svg'

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerText}>{subject} Activities</Text>
        {/* <View style={styles.backButton} /> */}
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.activitiesGrid}>
          {activities.map((activity, index) => {
            const cardColors = [
              { bg: '#FF6B6B', text: '#FFFFFF' },
              { bg: '#4ECDC4', text: '#FFFFFF' },
              { bg: '#45B7D1', text: '#FFFFFF' },
              { bg: '#96CEB4', text: '#FFFFFF' },
              { bg: '#FFEAA7', text: '#2D3436' },
              { bg: '#DDA0DD', text: '#FFFFFF' },
              { bg: '#98D8C8', text: '#2D3436' },
              { bg: '#F7DC6F', text: '#2D3436' },
            ];
            
            const colorScheme = cardColors[index % cardColors.length];
            
            return (
              <Pressable
                key={activity.activity_id}
                style={[
                  styles.activityCard,
                  { backgroundColor: colorScheme.bg }
                ]}
                onPress={() => handleActivityPress(activity)}
              >
                <View style={styles.activityIcon}>
                  <Text style={[styles.activityIconText, { color: colorScheme.text }]}>
                    {activity.activity_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.activityText,
                  { color: colorScheme.text }
                ]}>
                  {activity.activity_name}
                </Text>
                <Text style={[styles.materialCount, { color: '#2D3436' }]}>
                  {activity.materials.length} materials
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentSubjectActivityPage;
