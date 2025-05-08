import React from 'react';
import { Text, View, Pressable, ScrollView, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../assets/GeneralAssests/backarrow.svg';
import CollegeIcon from '../../../assets/EnrollmentHome/College.svg';
import CollegeStudentIcon from '../../../assets/EnrollmentHome/CollegeStudent.svg';
import ExamIcon from '../../../assets/EnrollmentHome/Exam.svg';
import InfraStructureIcon from '../../../assets/EnrollmentHome/InfraStructure.svg';
import styles from './EnrollmentHomeStyle';

const EnrollmentHome = ({ navigation }) => {

  const data = [
   {
     data: [
       { id: '1', title: 'Student Enrollment', bgColor: '#C9F7F5', iconColor: '#6A5ACD', Icon: <CollegeStudentIcon width={50} height={50}  />, color: '#0FBEB3' },
       { id: '2', title: 'Mentor Enrollment', bgColor: '#FFDAF0', iconColor: '#EEAA16', Icon: <CollegeIcon width={50} height={50}  />, color: '#AD5191' },
       { id: '3', title: 'Subject & Activity Enrollment', bgColor: '#65558F12', iconColor: '#D81B60', Icon: <ExamIcon width={50} height={50}  />, color: '#65558F' },
       { id: '4', title: 'InfraStructure Enrollment', bgColor: '#FFF3DC', iconColor: '#3557FF', Icon: <InfraStructureIcon width={50} height={50}  />, color: '#EEAA16' },
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
      <View style={styles.Header}>
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.goBack()}/>
        <Text style={styles.HeaderTxt}>Enrollment</Text>
      </View>

      <SectionList
      vertical={true}
      scrollEnabled={true}
  sections={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    
    <Pressable
    onPress={() => {
      if (item.title === 'Student Enrollment') {
        navigation.navigate('StudentEnrollment');
      } else if (item.title === 'Mentor Enrollment') {
        navigation.navigate('MentorEnrollment'); }
        else if (item.title === 'Subject & Activity Enrollment') {
          navigation.navigate('SubjectAllotment');
        } 
        else if (item.title === 'InfraStructure Enrollment') {
          navigation.navigate('InfrastructureEnrollment');
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

export default EnrollmentHome;
