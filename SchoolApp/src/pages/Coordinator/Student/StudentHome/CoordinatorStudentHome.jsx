import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/CoordinatorPage/StudentHome/Home.svg';
import StudentProfileIcon from '../../../../assets/CoordinatorPage/StudentHome/ProfileIcon.svg';
import IssueIcon from '../../../../assets/CoordinatorPage/StudentHome/IssueIcon.svg';
import BacklogsIcon from '../../../../assets/CoordinatorPage/StudentHome/BacklogsIcon.svg';
import ConceptGraphIcon from '../../../../assets/CoordinatorPage/StudentHome/ConceptIcon.svg';

import styles from './StudentHomeStyle';

const CoordinatorStudentHome = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params;
  console.log(coordinatorData);

  const [activeGrade, setActiveGrade] = useState();

  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const data = [
    {
      data: [
        { id: '1', title: 'Student Profile', bgColor: '#65558F12', iconColor: '#6A5ACD', Icon: <StudentProfileIcon width={50} height={50} />, color: '#65558F' },
        { id: '2', title: 'Issues Log', bgColor: '#FFF3DC', iconColor: '#EEAA16', Icon: <IssueIcon width={50} height={50} />, color: '#EEAA16' },
        { id: '3', title: 'Backlogs', bgColor: '#FFD6EE', iconColor: '#D81B60', Icon: <BacklogsIcon width={50} height={50} />, color: '#AD5191' },
        // { id: '4', title: 'Concept Graph', bgColor: '#C9F7F5', iconColor: '#3557FF', Icon: <ConceptGraphIcon width={50} height={50} />, color: '#0FBEB3' },
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
        <Text style={styles.HeaderTxt}>Students</Text>
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
              if (item.title === 'Student Profile') {
                navigation.navigate('CoordinatorStudentProfile', { coordinatorData, activeGrade });
              } else if (item.title === 'Issues Log') {
                navigation.navigate('CoordinatorStudentDisciplineLog', { coordinatorData, activeGrade });
              }
              else if (item.title === 'Backlogs') {
                navigation.navigate('CoordinatorBackLogs', { coordinatorData, activeGrade });
              }
              // else if (item.title === 'Concept Graph') {
              //   navigation.navigate('CoordinatorConceptGraph', { coordinatorData, activeGrade });
              // }

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

export default CoordinatorStudentHome;
