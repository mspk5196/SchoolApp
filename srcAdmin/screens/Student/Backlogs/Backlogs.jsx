import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import styles from './BacklogsStyles';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn';

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
              source={require('../../../assets/StudentHome/Issuelog/staff.png')} 
              style={styles.profileImage} 
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}>
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Discipline Log</Text>
      </View>
      
      <View style={{ flex: 1 }}>
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