import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/Home.svg';
import CollegeIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/College.svg';
import CollegeStudentIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/CollegeStudent.svg';
import ExamIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/Exam.svg';
import InfraStructureIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/InfraStructure.svg';
import LearningIcon from '../../../../assets/CoordinatorPage/EnrollmentHome/learning.svg';
import styles from './EnrollmentHomeStyle';

const CoordinatorEnrollmentHome = ({ navigation, route }) => {

  const { coordinatorData, coordinatorGrades } = route.params;
  const [activeGrade, setActiveGrade] = useState();

  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const data = [
    {
      data: [
        { id: '1', title: 'Student Enrollment', bgColor: '#C9F7F5', iconColor: '#6A5ACD', Icon: <CollegeStudentIcon width={50} height={50} />, color: '#0FBEB3' },
        { id: '2', title: 'Mentor Enrollment', bgColor: '#FFDAF0', iconColor: '#EEAA16', Icon: <CollegeIcon width={50} height={50} />, color: '#AD5191' },
        { id: '3', title: 'Subject & Activity Enrollment', bgColor: '#65558F12', iconColor: '#D81B60', Icon: <ExamIcon width={50} height={50} />, color: '#65558F' },
        { id: '4', title: 'InfraStructure Enrollment', bgColor: '#FFF3DC', iconColor: '#3557FF', Icon: <InfraStructureIcon width={50} height={50} />, color: '#EEAA16' },
        { id: '5', title: 'Student Topic Enrollment', bgColor: '#ff7043', iconColor: '#3557FF', Icon: <LearningIcon width={50} height={50} />, color: '#ffffffff' },
      ],
    },
  ];


  const Cards = ({ title, Icon, bgColor, color }) => (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      {Icon}
      <Text style={[styles.cardText, { color: color }]}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView flexgrow={1} flex={0}>
      <View style={styles.Header}>
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.navigate('CoordinatorMain')} />
        <Text style={styles.HeaderTxt}>Enrollment</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
      >
        {coordinatorGrades?.map(grade => (
          <TouchableOpacity
            key={grade.grade_id}
            style={[styles.sectionTab, activeGrade === grade.grade_id && styles.activeSectionTab]}
            onPress={() => setActiveGrade(grade.grade_id)}
          >
            <Text style={[styles.sectionTabText, activeGrade === grade.grade_id && styles.activeSectionTabText]}>
              Grade {grade.grade_id}
            </Text>
          </TouchableOpacity>
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
              if (item.title === 'Student Enrollment') {
                navigation.navigate('StudentEnrollment', { coordinatorData, activeGrade });
              } else if (item.title === 'Mentor Enrollment') {
                navigation.navigate('MentorEnrollment', { coordinatorData, activeGrade });
              }
              else if (item.title === 'Subject & Activity Enrollment') {
                navigation.navigate('SubjectAllotment', { coordinatorData,activeGrade });
              }
              else if (item.title === 'InfraStructure Enrollment') {
                navigation.navigate('InfrastructureEnrollment', { coordinatorData, activeGrade });
              }
              else if (item.title === 'Student Topic Enrollment') {
                navigation.navigate('StudentTopicEnrollment', { coordinatorData, activeGrade });
              }

            }}
          >
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.title} Icon={item.Icon} bgColor={item.bgColor} color={item.color} />
            </ScrollView>
          </Pressable>
        )}
      />

    </SafeAreaView>
  );
};

export default CoordinatorEnrollmentHome;
