import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/AdminPage/StudentHome/Home.svg';
import StudentProfileIcon from '../../../../assets/AdminPage/StudentHome/ProfileIcon.svg';
import IssueIcon from '../../../../assets/AdminPage/StudentHome/IssueIcon.svg';
import BacklogsIcon from '../../../../assets/AdminPage/StudentHome/BacklogsIcon.svg';
import Progressicon from '../../../../assets/AdminPage/StudentHome/Progressicon.svg';
import Gradcap from '../../../../assets/AdminPage/StudentHome/Gradcap.svg';
import Homeicon from '../../../../assets/AdminPage/Basicimg/Home.svg';
import styles from './StudentHomeStyles';
import {API_URL} from '../../../../utils/env.js'

const AdminStudentHome = ({ navigation }) => { 
  const [activeSection, setActiveSection] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades`);
      const data = await response.json();
      if (data.success) {
        const sortedGrades = (data.grades || []).sort((a, b) => a.id - b.id);
        setGrades(sortedGrades);
        if (data.grades.length > 0) {
          setSelectedGrade(data.grades[0].id);
          setActiveSection(0);
        } 
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const data = [
    {
      data: [
        { id: '1', title: 'Student List', bgColor: '#65558F12', iconColor: '#6A5ACD', Icon: <StudentProfileIcon />, color: '#65558F' },
        { id: '2', title: 'Issues Log', bgColor: '#FFF3DC', iconColor: '#EEAA16', Icon: <IssueIcon />, color: '#EEAA16' },
        { id: '3', title: 'Backlogs', bgColor: '#FFD6EE', iconColor: '#D81B60', Icon: <BacklogsIcon />, color: '#AD5191' },
        // { id: '4', title: 'Academic progress', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <Progressicon />, color: '#3557FF' },
        // { id: '5', title: 'Academic Schedule ', bgColor: '#C9F7F5', iconColor: '#3557FF', Icon: <Gradcap />, color: '#0FBEB3' },
      ],
    },
  ];

  const Cards = ({ title, Icon, bgColor, color }) => (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {Icon}
      <Text style={[styles.cardText, { color: color }]}>{title}</Text>
    </View>
  );

  const handleGradeSelect = (index, gradeId) => {
    setActiveSection(index);
    setSelectedGrade(gradeId);
  };

  return (
    <SafeAreaView flexgrow={1} flex={1} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <HomeIcon height={25} width={25} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Students</Text>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {grades.map((grade, index) => (
          <Pressable
            key={grade.id}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => handleGradeSelect(index, grade.id)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>{grade.grade_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        vertical={true}
        scrollEnabled={true}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (selectedGrade) {
                if (item.title === 'Student List') {
                  navigation.navigate('AdminStudentList', { gradeId: selectedGrade });
                } else if (item.title === 'Issues Log') {
                  navigation.navigate('AdminStudentIssuelogs', { gradeId: selectedGrade });
                }
                else if (item.title === 'Backlogs') {
                  navigation.navigate('AdminStudentBacklogs', { gradeId: selectedGrade });
                }
                else if (item.title === 'Concept Graph') {
                  navigation.navigate('ConceptGraph', { gradeId: selectedGrade });
                }
              }
            }}
          >
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.title} Icon={item.Icon} bgColor={item.bgColor} color={item.color} />
            </ScrollView>
          </Pressable>
        )}
      />
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentHome;