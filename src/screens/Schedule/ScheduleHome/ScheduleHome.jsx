import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../assets/ScheduleHome/Home.svg';
import CollegeIcon from '../../../assets/ScheduleHome/College.svg';
import CollegeIcon2 from '../../../assets/ScheduleHome/College2.svg';
import ExamIcon from '../../../assets/ScheduleHome/Exam.svg';
import InvigilatorIcon from '../../../assets/ScheduleHome/Invigilator.svg';
import styles from './ScheduleHomeStyle';

const ScheduleHome = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const data = [
   {
     data: [
       { id: '1', title: 'Academic Schedule', bgColor: '#C9F7F5', iconColor: '#6A5ACD', Icon: <CollegeIcon width={50} height={50}  />, color: '#0FBEB3' },
       { id: '2', title: 'Exam Schedule', bgColor: '#65558F12', iconColor: '#EEAA16', Icon: <ExamIcon width={50} height={50}  />, color: '#65558F' },
       { id: '3', title: 'Invigilation Duties', bgColor: '#FFF3DC', iconColor: '#D81B60', Icon: <InvigilatorIcon width={50} height={50}  />, color: '#EEAA16' },
       { id: '4', title: 'Weekly Schedules', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <CollegeIcon2 width={50} height={50}  />, color: '#3557FF' },
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
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.goBack()}/>
        <Text style={styles.HeaderTxt}>Schedule</Text>
      </View>
  
   
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavgrade} nestedScrollEnabled={true}>
        {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((grade, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeGrade === index && styles.activeButton]}
            onPress={() => setActiveGrade(index)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === index && styles.activeText]}>{grade}</Text>
          </Pressable>
        ))}
      </ScrollView>

   
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {["Section A", "Section B", "Section C", "Section D", "Section E", "Section F", "Section G"].map((section, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>{section}</Text>
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
      if (item.title === 'Exam Schedule') {
        navigation.navigate('ExamSchedule');
      } else if (item.title === 'Invigilation Duties') {
        navigation.navigate('InvigilationDuties'); }
        else if (item.title === 'Academic Schedule') {
          navigation.navigate('AcademicSchedule');
        } 
        else if (item.title === 'Weekly Schedules') {
          navigation.navigate('WeeklySchedule');
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

export default ScheduleHome;
