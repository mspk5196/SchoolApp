import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { API_URL } from '../../../../utils/env.js'
import PreviousIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import styles from './BackLogsStyle';
import Nodata from '../../../../components/General/Nodata';
const Staff = require('../../../../assets/CoordinatorPage/BackLogs/staff.png');

const CoordinatorBackLogs = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  console.log(activeGrade);
  
  const [activeSection, setActiveSection] = useState('A');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeGrade) {
      fetchSections();
    }
  }, [activeGrade]);

  useEffect(() => {
    if (selectedSection) {
      fetchBacklogs(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/grades/${activeGrade}/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.gradeSections);
        // console.log(data.gradeSections);

        if (data.gradeSections.length > 0) {
          setSelectedSection(data.gradeSections[0].id);
          setActiveSection(data.gradeSections[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBacklogs = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/backlogs/${sectionId}`);
      const data = await response.json();
      if (data.success) {
        setAssessmentData(data.overdueStudents);
        // console.log(data.overdueStudents);

      }
    } catch (error) {
      console.error('Error fetching backlogs:', error);
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Staff;
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    if (selectedSection) {
      setRefreshing(true);
      await fetchBacklogs(selectedSection);
      setRefreshing(false);
    }
  };

  // Loading component
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation && navigation.goBack()}>
            <PreviousIcon color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Backlogs</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading backlogs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderAssessmentCard = (item, index) => {

    return (

      <View style={styles.card} key={index}>
        <View style={styles.cardLeftContent}>
          <View style={styles.profileSection}>
            <Image source={getProfileImageSource(item?.profile_photo)} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{item.student_name}</Text>
              <Text style={styles.idText}>{item.student_roll}</Text>
              <Text style={styles.levelText}>Level {item.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRightContent}>
          <Text style={styles.subjectText}>{item.subject_name}</Text>
          <Text style={styles.daysText}>{item.days_overdue} Days</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}>
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Backlogs</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsection}
        nestedScrollEnabled={true}
      >
        {sections?.map((section, index) => (
          <Pressable
            key={section.id}
            style={[
              styles.gradeselection,
              activeSection === section.id && styles.activeButton,
            ]}
            onPress={() => {
              setActiveSection(section.id);
              setSelectedSection(section.id);
            }}>
            <Text style={[
              styles.gradeselectiontext,
              activeSection === section.id && styles.activeText,
            ]}>
              Section {section.section_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0C36FF']}
              tintColor="#0C36FF"
            />
          }
        >
          {assessmentData.length > 0 ? (
            assessmentData.map((item, index) => renderAssessmentCard(item, index))
          ) : (
            <Nodata message="No backlogs found" />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CoordinatorBackLogs;