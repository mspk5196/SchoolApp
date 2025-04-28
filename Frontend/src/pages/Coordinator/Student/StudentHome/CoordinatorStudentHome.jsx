import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/CoordinatorPage/StudentHome/Home.svg';
import StudentProfileIcon from '../../../../assets/CoordinatorPage/StudentHome/ProfileIcon.svg';
import IssueIcon from '../../../../assets/CoordinatorPage/StudentHome/IssueIcon.svg';
import BacklogsIcon from '../../../../assets/CoordinatorPage/StudentHome/BacklogsIcon.svg';
import ConceptGraphIcon from '../../../../assets/CoordinatorPage/StudentHome/ConceptIcon.svg';

import styles from './StudentHomeStyle';

const CoordinatorStudentHome = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  console.log(coordinatorData);
   
  // const [activeSection, setActiveSection] = useState(null);

  const data = [
    {
      data: [
        { id: '1', title: 'Student Profile', bgColor: '#65558F12', iconColor: '#6A5ACD', Icon: <StudentProfileIcon width={50} height={50} />, color: '#65558F' },
        { id: '2', title: 'Issues Log', bgColor: '#FFF3DC', iconColor: '#EEAA16', Icon: <IssueIcon width={50} height={50} />, color: '#EEAA16' },
        { id: '3', title: 'Backlogs', bgColor: '#FFD6EE', iconColor: '#D81B60', Icon: <BacklogsIcon width={50} height={50} />, color: '#AD5191' },
        { id: '4', title: 'Concept Graph', bgColor: '#C9F7F5', iconColor: '#3557FF', Icon: <ConceptGraphIcon width={50} height={50} />, color: '#0FBEB3' },
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
    <SafeAreaView flexgrow={1} flex={1}>
      <View style={styles.Header}>
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.navigate('CoordinatorMain')} />
        <Text style={styles.HeaderTxt}>Students</Text>
      </View>



      {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {["Section A", "Section B", "Section C", "Section D", "Section E", "Section F", "Section G"].map((section, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>{section}</Text>
          </Pressable>
        ))}
      </ScrollView> */}


      <SectionList
        vertical={true}
        scrollEnabled={true}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <Pressable
            onPress={() => {
              if (item.title === 'Student Profile') {
                navigation.navigate('CoordinatorStudentProfile', {coordinatorData});
              } else if (item.title === 'Issues Log') {
                navigation.navigate('CoordinatorStudentDisciplineLog', {coordinatorData});
              }
              else if (item.title === 'Backlogs') {
                navigation.navigate('CoordinatorBackLogs', {coordinatorData});
              }
              else if (item.title === 'Concept Graph') {
                navigation.navigate('CoordinatorConceptGraph', {coordinatorData});
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

export default CoordinatorStudentHome;
