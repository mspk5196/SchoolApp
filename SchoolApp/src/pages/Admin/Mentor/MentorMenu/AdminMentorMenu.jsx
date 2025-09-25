import React, { useEffect, useState } from 'react';
import { Text, View, SectionList, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Menusty';
import SubjectIcon from '../../../../assets/AdminPage/MentorHome/subject.svg';
import MentorListIcon from '../../../../assets/AdminPage/MentorHome/mentorlist.svg';
import DisciplineIcon from '../../../../assets/AdminPage/MentorHome/mapping.svg';
import Freehour from '../../../../assets/AdminPage/MentorHome/Freehour.svg';
import HomeIcon from '../../../../assets/AdminPage/MentorHome/home.svg';
import {API_URL} from '../../../../utils/env.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../../../utils/apiClient.js';

const data = [
  {
    data: [
      {
        id: '1',
        title: 'Mentor List',
        bgColor: '#EBEEFF',
        iconColor: '#1E40AF',
        Icon: MentorListIcon,
        color: '#3557FF',
      },
      {
        id: '2',
        title: 'Discipline log',
        bgColor: '#FFF3DC',
        iconColor: '#FFA000',
        Icon: DisciplineIcon,
        color: '#EEAA16',
      },
      {
        id: '3',
        title: 'Subject Mentor',
        bgColor: '#65558F1F',
        iconColor: '#6A5ACD',
        Icon: SubjectIcon,
        color: '#65558F',
      },
      {
        id: '4',
        title: 'Free hour',
        bgColor: '#FFD6EE',
        iconColor: '#FFA000',
        Icon: Freehour,
        color: '#AD5191',
      },
    ],
  },
];

const MentorCard = ({ title, Icon, bgColor, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.card, { backgroundColor: bgColor }]}>
    <Icon style={styles.icon} />
    <Text style={[styles.cardText, { color: color }]}>{title}</Text>
  </TouchableOpacity>
);

const AdminMentorMenu = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(null);
  const [grades, setGrades] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    fetchGrades();
    fetchAdminData();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await apiFetch(`/admin/grades`);
      const data = response
      if (data.success) {
        const sortedGrades = (data.grades || []).sort((a, b) => a.id - b.id);
        setGrades(sortedGrades);
        if (data.grades.length > 0) {
          setSelectedGrade(data.grades[0].id);
          setActiveGrade(data.grades[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAdminData = async() =>{
    try {
        const storedData = await AsyncStorage.getItem('adminData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAdminData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  }

  const handleGradeSelect = (gradeId) => {
    setActiveGrade(gradeId);
    setSelectedGrade(gradeId);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <HomeIcon height={25} width={25} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {grades.map((grade, index) => (
          <Pressable
            key={grade.id}
            style={[styles.gradeselection, activeGrade === grade.id && styles.activeButton]}
            onPress={() => handleGradeSelect(grade.id)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === grade.id && styles.activeText]}>{grade.grade_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        sections={data}
        keyExtractor={item => item.id}
        style={styles.scrollView}
        renderItem={({ item }) => (
          <MentorCard
            title={item.title}
            Icon={item.Icon}
            bgColor={item.bgColor}
            color={item.color}
            onPress={() => {
              if (item.title === 'Subject Mentor') {
                navigation.navigate('AdminSubjectMentor',{selectedGrade});
              } else if (item.title === 'Free hour') {
                navigation.navigate('AdminFreeHour',{selectedGrade});
              } else if (item.title === 'Mentor List') {
                navigation.navigate('AdminMentorList',{selectedGrade});
              } else if (item.title === 'Discipline log') {
                navigation.navigate('AdminMentorDisciplineLog',{selectedGrade, adminData});
              }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default AdminMentorMenu;
