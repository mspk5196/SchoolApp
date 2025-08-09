import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Home.svg';
import CollegeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/College.svg';
import CollegeIcon2 from '../../../../assets/CoordinatorPage/ScheduleHome/College2.svg';
import ExamIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Exam.svg';
import InvigilatorIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Invigilator.svg';
import styles from './ScheduleHomeStyle';

const CoordinatorScheduleHome = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params;
  const [activeGrade, setActiveGrade] = useState(null);
  const [activeSection, setActiveSection] = useState(null);


  useEffect(() => {
    setActiveGrade(activeGrade)
  }, [coordinatorData])
  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const data = [
    {
      data: [
        { id: '1', title: 'Academic Schedule', bgColor: '#C9F7F5', iconColor: '#6A5ACD', Icon: <CollegeIcon width={50} height={50} />, color: '#0FBEB3' },
        { id: '2', title: 'Exam Schedule', bgColor: '#65558F12', iconColor: '#EEAA16', Icon: <ExamIcon width={50} height={50} />, color: '#65558F' },
        { id: '3', title: 'Invigilation Duties', bgColor: '#FFF3DC', iconColor: '#D81B60', Icon: <InvigilatorIcon width={50} height={50} />, color: '#EEAA16' },
        { id: '4', title: 'Weekly Schedules', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <CollegeIcon2 width={50} height={50} />, color: '#3557FF' },
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
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.goBack()} />
        <Text style={styles.HeaderTxt}>Schedule</Text>
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
              if (item.title === 'Academic Schedule') {
                navigation.navigate('CoordinatorAcademicSchedule', { activeGrade });
              } else if (item.title === 'Exam Schedule') {
                navigation.navigate('CoordinatorExamSchedule', { activeGrade });
              } else if (item.title === 'Invigilation Duties') {
                navigation.navigate('CoordinatorInvigilationDuties', { activeGrade });
              } else if (item.title === 'Weekly Schedules') {
                navigation.navigate('CoordinatorWeeklySchedule', { activeGrade });
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

export default CoordinatorScheduleHome;
