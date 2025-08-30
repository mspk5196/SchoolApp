import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Home.svg';
import CollegeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/College.svg';
import CollegeIcon2 from '../../../../assets/CoordinatorPage/ScheduleHome/College2.svg';
import ExamIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Exam.svg';
import InvigilatorIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Invigilator.svg';
import styles from './ScheduleHomeStyle';
import SectionSelectionModal from '../../../../components/Coordinator/SectionSelectionModal';
import { API_URL } from '../../../../utils/env';

const CoordinatorScheduleHome = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params;
  const [activeGrade, setActiveGrade] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);

  // Add this function to generate Excel template
  // In CoordinatorScheduleHome.jsx
  const generateExcelTemplate = async (section) => {
    try {
      // Use the backend endpoint to generate and download the template
      const downloadUrl = `${API_URL}/api/coordinator/generate-schedule-template/${activeGrade}/${section.id}`;

      // Open the download URL in browser (this will trigger file download)
      Linking.openURL(downloadUrl);

    } catch (error) {
      console.error('Error generating template:', error);
      alert('Error generating template: ' + error.message);
    }
  };

  const handleSectionSelect = (section) => {
    setActiveSection(section);
    generateExcelTemplate(section);
  };

  const uploadingScheduleSheet = () => {
    if (!activeGrade) {
      Alert.alert('Please select a grade first');
      return;
    }
    Alert.alert('Schedule sheet', 'Do you want to generate template or upload filled sheet?', [
      {
        text: 'Generate Template',
        onPress: () => {
          setShowSectionModal(true);
        },
      },
      {
        text: 'Upload Filled Sheet',
        onPress: () => {
          // Handle upload filled sheet
        },
      },
    ]);
  };


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
        { id: '5', title: 'Student Schedule', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <CollegeIcon2 width={50} height={50} />, color: '#3557FF' },
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
              } else if (item.title === 'Student Schedule') {
                navigation.navigate('CoordinatorStudentSchedule', { activeGrade });
              }
            }}
          >
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.title} Icon={item.Icon} bgColor={item.bgColor} color={item.color} />
            </ScrollView>
          </Pressable>
        )}
      />

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => uploadingScheduleSheet()}
      >
        <Text style={styles.uploadButtonText}>Upload Schedule sheet</Text>
      </TouchableOpacity>

      <SectionSelectionModal
        visible={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        gradeId={activeGrade}
        onSectionSelect={handleSectionSelect}
      />
    </SafeAreaView>
  );
};

export default CoordinatorScheduleHome;
