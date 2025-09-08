import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView, SectionList, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import HomeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/Home.svg';
import CollegeIcon from '../../../../assets/CoordinatorPage/ScheduleHome/College.svg';
import CollegeIcon2 from '../../../../assets/CoordinatorPage/ScheduleHome/College2.svg';
import StudentSchedule from '../../../../assets/CoordinatorPage/ScheduleHome/student_schedule.png';
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
  const [modalMode, setModalMode] = useState('template'); // 'template' or 'upload'
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setActiveGrade(activeGrade)
  }, [coordinatorData])

  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  // Fetch sections for the selected grade
  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeID: gradeId }),
      });
      const result = await response.json();
      if (result.success) {
        setSections(result.gradeSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to fetch sections');
    }
  };

  // Generate Excel template
  const generateExcelTemplate = async (section) => {
    try {
      const downloadUrl = `${API_URL}/api/coordinator/generate-schedule-template/${activeGrade}/${section.id}`;
      Linking.openURL(downloadUrl);
    } catch (error) {
      console.error('Error generating template:', error);
      Alert.alert('Error', 'Error generating template: ' + error.message);
    }
  };

  // Handle section selection based on modal mode
  const handleSectionSelect = (section) => {
    setActiveSection(section);
    setShowSectionModal(false);
    
    if (modalMode === 'template') {
      generateExcelTemplate(section);
    } else if (modalMode === 'upload') {
      uploadScheduleFile(section.id);
    }
  };

  // Handle file upload for filled sheet
  const uploadScheduleFile = async (sectionId) => {
    try {
      // Pick document
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        // Show loading state
        // Alert.alert('Processing', 'Uploading and processing schedule sheet...');

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('scheduleSheet', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
        formData.append('sectionId', sectionId.toString());

        // Upload to backend
        const response = await fetch(`${API_URL}/api/coordinator/schedule/process-schedule-sheet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const responseData = await response.json();

        if (responseData.success) {
          console.log("Uploaded successfully");

          const errorMessage = responseData.data.errors && responseData.data.errors.length > 0
            ? `\n\nWarnings:\n${responseData.data.errors.slice(0, 3).join('\n')}${responseData.data.errors.length > 3 ? '\n...' : ''}`
            : '';

          Alert.alert(
            'Success', 
            `Schedule uploaded successfully!\nProcessed: ${responseData.data.processedRows}/${responseData.data.totalRows} rows${errorMessage}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to view the uploaded schedule
                  // navigation.navigate('CoordinatorAcademicSchedule', { 
                  //   activeGrade,
                  //   refreshData: true 
                  // });
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', responseData.message || 'Failed to process schedule sheet');
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Error uploading schedule:', error);
        Alert.alert('Error', 'Failed to upload schedule sheet: ' + error.message);
      }
    }
  };

  // Enhanced upload function with section selection
  const uploadingScheduleSheet = async () => {
    if (!activeGrade) {
      Alert.alert('Error', 'Please select a grade first');
      return;
    }

    // Fetch sections for the active grade first
    await fetchSections(activeGrade);
    
    Alert.alert(
      'Schedule Sheet Options', 
      'Choose an option:',
      [
        {
          text: 'Generate Template',
          onPress: () => {
            setModalMode('template');
            setShowSectionModal(true);
          },
        },
        {
          text: 'Upload Filled Sheet',
          onPress: () => {
            setModalMode('upload');
            setShowSectionModal(true);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const data = [
    {
      data: [
        { id: '1', title: 'Academic Schedule', bgColor: '#C9F7F5', iconColor: '#6A5ACD', Icon: <CollegeIcon width={50} height={50} />, color: '#0FBEB3' },
        { id: '2', title: 'Exam Schedule', bgColor: '#65558F12', iconColor: '#EEAA16', Icon: <ExamIcon width={50} height={50} />, color: '#65558F' },
        { id: '3', title: 'Invigilation Duties', bgColor: '#FFF3DC', iconColor: '#D81B60', Icon: <InvigilatorIcon width={50} height={50} />, color: '#EEAA16' },
        { id: '4', title: 'Weekly Schedules', bgColor: '#EBEEFF', iconColor: '#3557FF', Icon: <CollegeIcon2 width={50} height={50} />, color: '#3557FF' },
        { id: '5', title: 'Student Schedule', bgColor: '#ec3352', Icon: <Image source={StudentSchedule} style={{ width: 50, height: 50 }} />, color: '#ffffffff' },
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
        onPress={uploadingScheduleSheet}
      >
        <Text style={styles.uploadButtonText}>Upload Schedule Sheet</Text>
      </TouchableOpacity>

      {/* Enhanced Section Selection Modal */}
      <SectionSelectionModal
        visible={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        gradeId={activeGrade}
        sections={sections}
        modalMode={modalMode}
        onSectionSelect={handleSectionSelect}
      />
    </SafeAreaView>
  );
};

export default CoordinatorScheduleHome;