import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, SectionList, Alert, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import styles from './MaterialHomeStyle';
import Nodata from '../../../../components/General/Nodata';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as materialApi from '../../../../utils/materialApi';
import ApiService from '../../../../utils/ApiService';

const CoordinatorMaterialHome = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params || {};
  const [gradeSubject, setGradeSubject] = useState([]);
  const [activeGrade, setActiveGrade] = useState();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState();

  useEffect(() => {
    fetchGradeSubjects();
  }, [activeGrade]);
  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const fetchGradeSubjects = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await materialApi.getGradeSubjects(activeGrade);
      
      if (result && result.success) {
        // Transform the data to create a list of subjects with their activities
        const subjectsWithActivities = result.gradeSubjects.map((subject, index) => ({
          ...subject,
          key: `${subject.subject_id}-${index}` // Create a unique key
        }));

        setGradeSubject([{
          title: 'Subjects',
          data: subjectsWithActivities
        }]);
      } else {
        setGradeSubject([]);
        if (!isRefreshing) {
          Alert.alert("No Subjects", result?.message || "No subjects for this section");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (!isRefreshing) {
        Alert.alert("Error", "Failed to fetch subjects");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const fetchSections = async () => {
    try {

      const response = await ApiService.makeRequest(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeID: activeGrade,
        }),
      });

      if (response) {
        const result = await response.json();
        setSections(result.gradeSections || []);
        console.log('Fetched Grade Sections:', result.gradeSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [activeGrade]);
  useEffect(() => {
    if (sections.length > 0) {
      setSelectedSection(sections[0].id);
    }
  }, [sections]);

  const onRefresh = () => {
    if (activeGrade) {
      fetchGradeSubjects(true);
    }
  };

  const Cards = ({ title, Icon, bgColor, color }) => {
    // Only used for Level Promotion now
    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {Icon}
        <Text style={[styles.cardText, { color: color }]}>{title}</Text>
      </View>
    );
  };

  // Loading component
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.Header}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" onPress={() => navigation.goBack()} />
          <Text style={styles.HeaderTxt}>Material</Text>
        </View>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
          <LottieView
            source={require('../../../../assets/General/lottie_loading.json')}
            autoPlay
            loop
            speed={0.5}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      flexgrow={1}
      flex={1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#0C36FF']}
          tintColor="#0C36FF"
        />
      }
    >
      <View style={styles.Header}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" onPress={() => navigation.goBack()} />
        <Text style={styles.HeaderTxt}>Material</Text>
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
      {sections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContainer}
        >
          {sections?.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionTab, activeGrade === section.id && styles.activeSectionTab]}
              onPress={() => setSelectedSection(section.id)}
            >
              <Text style={[styles.sectionTabText, activeGrade === section.id && styles.activeSectionTabText]}>
                Section {section.section_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {gradeSubject.length > 0 && gradeSubject[0].data.length > 0 ? (
        <SectionList
          sections={gradeSubject}
          keyExtractor={(item) => item.key} // Use the unique key we created
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: (item.subject_id % 2) ? '#C9F7F5' : '#65558F12' }]}>
              <Pressable
                style={styles.centeredCardContent}
              // onPress={() => {
              //   navigation.navigate('TopicHierarchySubject', {
              //     grade: `Grade ${activeGrade}`,
              //     gradeID: activeGrade,
              //     subject: item.subject_name,
              //     subjectID: item.subject_id,
              //     coordinatorData,
              //     coordinatorGrades
              //   });
              // }}
              >
                <Text style={[styles.cardText, styles.centeredText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>
                  {item.subject_name}
                </Text>
                {/* Management Options */}
                <View style={styles.cardManagementOptions}>
                  <TouchableOpacity
                    style={[styles.managementButton, { borderColor: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}
                    onPress={() => navigation.navigate('TopicHierarchyManagement', {
                      coordinatorData,
                      coordinatorGrades,
                      activeGrade,
                      selectedSubjectId: item.subject_id,
                      selectedSubjectName: item.subject_name,
                      selectedSectionId: selectedSection
                    })}
                  >
                    <Text style={[styles.managementButtonText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>📚 Topic Hierarchy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.managementButton, { borderColor: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}
                    onPress={() => {
                      navigation.navigate('BatchManagementHome', {
                        coordinatorData,
                        coordinatorGrades,
                        activeGrade,
                        selectedSubjectId: item.subject_id,
                        selectedSubjectName: item.subject_name,
                        selectedSectionId: selectedSection
                      })
                      console.log('Navigated to BatchManagementHome with:', {
                        coordinatorData,
                        coordinatorGrades,
                        activeGrade,
                        selectedSubjectId: item.subject_id,
                        selectedSubjectName: item.subject_name,
                        selectedSectionId: selectedSection
                      });

                    }}
                  >
                    <Text style={[styles.managementButtonText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>👥 Batches</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>

            </View>
          )}
          renderSectionHeader={() => null}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Nodata
            message="No subjects found for this grade"
            style={styles.noDataContent}
          />
        </View>
      )}

      {/* {activeGrade && (
        <Pressable
          onPress={() => {
            navigation.navigate('LevelPromotion', {
              grade: `Grade ${activeGrade}`,
              gradeID: activeGrade,
              gradeSubject: gradeSubject
            });
          }}
        >
          <Cards
            title="Level Promotion"
            Icon={<LevelPromotionIcon width={50} height={50} />}
            bgColor='#EBEEFF'
            color='#3557FF'
          />
        </Pressable>
      )} */}
    </ScrollView>
  );
}

export default CoordinatorMaterialHome;