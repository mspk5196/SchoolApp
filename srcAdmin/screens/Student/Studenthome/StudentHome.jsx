import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../assets/StudentHome/Home';
import StudentProfileIcon from '../../../assets/StudentHome/ProfileIcon.svg';
import IssueIcon from '../../../assets/StudentHome/IssueIcon.svg';
import BacklogsIcon from '../../../assets/StudentHome/BacklogsIcon.svg';
import Progressicon from '../../../assets/StudentHome/Progressicon.svg';
import Gradcap from '../../../assets/StudentHome/Gradcap.svg';

import styles from './StudentHomeStyles';

const StudentHome = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState(null);

  const data = [
   {
     data: [
       { id: '1', title: 'Student List', bgColor: '#65558F12', iconColor: '#6A5ACD', Icon: <StudentProfileIcon   />, color: '#65558F' },
       { id: '2', title: 'Issues Log', bgColor: '#FFF3DC', iconColor: '#EEAA16', Icon: <IssueIcon />, color: '#EEAA16' },
       { id: '3', title: 'Backlogs', bgColor: '#FFD6EE', iconColor: '#D81B60', Icon: <BacklogsIcon />, color: '#AD5191' },
       { id: '4', title: 'Academic progress', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <Progressicon />, color: '#3557FF' },
       { id: '5', title: 'Academic Schedule ', bgColor: '#C9F7F5', iconColor: '#3557FF', Icon: <Gradcap />, color: '#0FBEB3' },
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
    <SafeAreaView flexgrow={1} flex={1} style={styles.container}>    
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <HomeIcon height={25} width={25}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
      </View>

   
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7","Grade 8"].map((section, index) => (
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
      if (item.title === 'Student List') {
        navigation.navigate('StudentList');
      } else if (item.title === 'Issues Log') {
        navigation.navigate('IssueLogs'); }
        else if (item.title === 'Backlogs') {
          navigation.navigate('BackLogs');
        } 
        else if (item.title === 'Concept Graph') {
          navigation.navigate('ConceptGraph');
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

export default StudentHome;
