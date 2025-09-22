import { apiFetch } from "../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import styles from './StudentSubjectSelectionStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../utils/env.js';
import Nodata from '../../../components/General/Nodata';

const StudentSubjectSelectionPage = ({ navigation }) => {
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchSubjects = async (isRefreshing = false) => {
    if (!studentData?.section_id) return;
    
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await apiFetch(`/student/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId: studentData.section_id }),
      });
      const data = response
      setSectionSubjects(data.subjects || []);

    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to fetch subjects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (studentData?.section_id) {
      fetchSubjects();
    }
  }, [studentData]);

  const onRefresh = async () => {
    await fetchSubjects(true);
  };

  const handleSubjectPress = (subject) => {
    navigation.navigate('StudentSubjectActivityPage', {
      subject: subject.subject_name,
      subjectID: subject.subject_id
    });
  };

  const renderSubjectCard = (subject, index) => {
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
      <TouchableOpacity
        key={subject.subject_id}
        style={[
          styles.subjectCard,
          { backgroundColor: colorScheme.bg }
        ]}
        onPress={() => handleSubjectPress(subject)}
      >
        <View style={styles.subjectIcon}>
          <Text style={[styles.subjectIconText, { color: colorScheme.text }]}>
            {subject.subject_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[
          styles.subjectText,
          { color: colorScheme.text }
        ]}>
          {subject.subject_name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Materials</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Materials</Text>
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      >
        {sectionSubjects.length > 0 ? (
          <View style={styles.subjectsGrid}>
            {sectionSubjects.map((subject, index) => renderSubjectCard(subject, index))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Nodata />
            <Text style={styles.noDataText}>No subjects available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentSubjectSelectionPage;
