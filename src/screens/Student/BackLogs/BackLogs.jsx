import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import BackIcon from '../../../assets/BackLogs/Back.svg';
import styles from './BackLogsStyle';

const BackLogs = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('A');

  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
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
              source={require('../../../assets/BackLogs/profile-placeholder.png')} 
              style={styles.profileImage} 
              defaultSource={require('../../../assets/BackLogs/profile-placeholder.png')}
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
                key={section}
                style={[styles.sectionTab, activeSection === section && styles.activeTab]}
                onPress={() => setActiveSection(section)}
              >
                <Text style={[styles.sectionTabText, activeSection === section && styles.activeTabText]}>
                  Section {section}
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

export default BackLogs;