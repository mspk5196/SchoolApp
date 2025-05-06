import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import styles from './BacklogsStyles';
import PreviousIcon from '../../../../assets/AdminPage/Basicimg/PrevBtn.svg';
import Homeicon from '../../../../assets/AdminPage/Basicimg/Home.svg';
import {API_URL} from '@env'

const AdminStudentBacklogs = ({ navigation, route }) => {
  const { gradeId } = route.params || {};
  const [activeSection, setActiveSection] = useState('A');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);

  useEffect(() => {
    if (gradeId) {
      fetchSections(gradeId);
    }
  }, [gradeId]);

  useEffect(() => {
    if (selectedSection) {
      fetchBacklogs(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
        if (data.sections.length > 0) {
          setSelectedSection(data.sections[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchBacklogs = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/backlogs`);
      const data = await response.json();
      if (data.success) {
        setAssessmentData(data.backlogs);
      }
    } catch (error) {
      console.error('Error fetching backlogs:', error);
    }
  };

  const renderAssessmentCard = (item, index) => {
    return (
      <View key={index} style={styles.card}>
        <View style={styles.cardLeftContent}>
          <View style={styles.profileSection}>
            <Image 
              source={require('../../../../assets/AdminPage/StudentHome/Issuelog/staff.png')} 
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
        <Text style={styles.headerTitle}>Student Backlogs</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsection}
        nestedScrollEnabled={true}>
        {sections?.map((section, index) => (
          <Pressable
            key={section.id}
            style={[
              styles.gradeselection,
              activeSection === index && styles.activeButton,
            ]}
            onPress={() => {
              setActiveSection(index);
              setSelectedSection(section.id);
            }}>
            <Text style={[
              styles.gradeselectiontext,
              activeSection === index && styles.activeText,
            ]}>
              {section.section_name}
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
          {assessmentData.map((item, index) => renderAssessmentCard(item, index))}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon/>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentBacklogs;