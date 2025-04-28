import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { API_URL } from '@env'
import BackIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';
import styles from './BackLogsStyle';

const CoordinatorBackLogs = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [activeSection, setActiveSection] = useState(null);

  const [sections, setSections] = useState([])

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gradeID: coordinatorData.grade_id }),
        });

        const data = await response.json();
        console.log('Grade Sections Data API Response:', data);

        if (data.success) {
          setSections(data.gradeSections);
          if (data.gradeSections.length > 0) {
            setActiveSection(data.gradeSections[0].id);
          }
        } else {
          Alert.alert('No Sections Found', 'No section is associated with this grade');
        }
      } catch (error) {
        console.error('Error fetching sections data:', error);
        Alert.alert('Error', 'Failed to fetch sections data');
      }
    };

    fetchSections();
  }, [coordinatorData]);

  const assessmentData = [
    {
      id: '2024V1023',
      name: 'Prakash Raj',
      level: 'Level 2 Assessment',
      subject: 'Science',
      days: '4 days',
    },
    {
      id: '2024V1023',
      name: 'Prakash Raj',
      level: 'Level 2 Assessment',
      subject: 'Science',
      days: '4 days',
    },
    // ... other assessment data ...
    {
      id: '2024V1023',
      name: 'Prakash Raj',
      level: 'Level 2 Assessment',
      subject: 'Science',
      days: '4 days',
    },
  ];

  // Render assessment card component
  const renderAssessmentCard = (item, index) => {
    return (
      <View key={index} style={styles.card}>
        <View style={styles.cardLeftContent}>
          <View style={styles.profileSection}>
            <Image
              source={require('../../../../assets/CoordinatorPage/BackLogs/profile-placeholder.png')}
              style={styles.profileImage}
              defaultSource={require('../../../../assets/CoordinatorPage/BackLogs/profile-placeholder.png')}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.idText}>{item.id}</Text>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRightContent}>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <Text style={styles.daysText}>{item.days}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={styles.BackIcon.width} height={styles.BackIcon.height} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Backlogs</Text>
      </View>

      {/* Main Container with fixed layout */}
      <View style={{ flex: 1 }}>
        {/* Section Tabs with fixed height */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionTabsContent}
          >
            {sections.map(section => (
              <TouchableOpacity
                key={section.id}
                style={[styles.sectionTab, activeSection === section.id && styles.activeTab]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeTabText]}>
                  Section {section.section_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Assessment Cards in a separate ScrollView */}
        <ScrollView
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {assessmentData.map((item, index) => renderAssessmentCard(item, index))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CoordinatorBackLogs;