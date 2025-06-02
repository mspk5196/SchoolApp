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
} from 'react-native';
import { API_URL } from '@env'
import PreviousIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import styles from './BackLogsStyle';
import Nodata from '../../../../components/General/Nodata';

const CoordinatorBackLogs = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  console.log(activeGrade);
  
  const [activeSection, setActiveSection] = useState('A');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);

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
        >
          {assessmentData.length > 0 ? (
            assessmentData.map((item, index) => renderAssessmentCard(item, index))
          ) : (
            <Nodata />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CoordinatorBackLogs;