import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, Pressable, SectionList, Alert, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import styles from './MaterialHomeStyle';
import Nodata from '../../../../components/General/Nodata';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as materialApi from '../../../../utils/materialApi';
import ApiService from '../../../../utils/ApiService';
import { Header, HorizontalChipSelector } from '../../../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorMaterialHome = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData } = params;

  const [grades, setGrades] = useState([]);
  const [gradeSubject, setGradeSubject] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState();

  const [activeSectionSelection, setActiveSectionSelection] = useState(null);

  useEffect(() => {
    fetchgrades()
  }, [])
  useEffect(() => {
    fetchGradeSubjects();
  }, [selectedGrade]);

  const fetchgrades = async () => {
    try {
      const asyncGrades = await AsyncStorage.getItem('coordinatorGrades');
      const parsedGrades = asyncGrades ? JSON.parse(asyncGrades) : [];
      setGrades(parsedGrades);

      if (parsedGrades.length > 0) {
        setSelectedGrade(parsedGrades[0]);
      }
    } catch (error) {
      console.error('Error fetching coordinator grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const fetchGradeSubjects = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await materialApi.getGradeSubjects(selectedGrade.grade_id);

      if (result && result.success) {

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
        body: JSON.stringify({ gradeID: selectedGrade.grade_id }),
      });
      const data = await response.json();
      
      if (data.success && data.gradeSections.length > 0) {
        setSections(data.gradeSections);
        setActiveSection(data.gradeSections[0].id);
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sections data');
    }
  };

  const handleSectionChange = (sectionId) => {
    console.log(sectionId.id);

    setSelectedSection(sectionId.id);
    setActiveSectionSelection(sectionId);
  };

  useEffect(() => {
    fetchSections();
  }, [selectedGrade]);
  useEffect(() => {
    if (sections.length > 0) {
      setSelectedSection(sections[0].id);
    }
  }, [sections]);

  const onRefresh = () => {
    if (selectedGrade) {
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
        <Header title="Loading..." />
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
      <Header
        title="Enrollment Home"
        navigation={navigation}
      />
      
      <HorizontalChipSelector
        data={grades}
        selectedItem={selectedGrade}
        onSelectItem={setSelectedGrade}
        idKey="grade_id"
        nameKey="grade_name" />
      {selectedGrade && sections.length > 0 &&
        <HorizontalChipSelector
          data={sections}
          selectedItem={activeSectionSelection}
          onSelectItem={handleSectionChange}
          idKey="id"
          nameKey="section_name" />
      }

      {gradeSubject.length > 0 && gradeSubject[0].data.length > 0 ? (
        <SectionList
          sections={gradeSubject}
          keyExtractor={(item) => item.key} // Use the unique key we created
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: (item.subject_id % 2) ? '#C9F7F5' : '#65558F12' }]}>
              <Pressable
                style={styles.centeredCardContent}
              >
                <Text style={[styles.cardText, styles.centeredText, { color: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}>
                  {item.subject_name}
                </Text>
                {/* Management Options */}
                <View style={styles.cardManagementOptions}>
                  <TouchableOpacity
                    style={[styles.managementButton, { borderColor: (item.subject_id % 2) ? '#0FBEB3' : '#65558F' }]}
                    onPress={() => navigation.navigate('TopicHierarchyManagement', {
                      userData,
                      grades,
                      selectedGrade,
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
                        userData,
                        grades,
                        selectedGrade,
                        selectedSubjectId: item.subject_id,
                        selectedSubjectName: item.subject_name,
                        selectedSectionId: selectedSection
                      })
                      console.log('Navigated to BatchManagementHome with:', {
                        userData,
                        grades,
                        selectedGrade,
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

      {/* {selectedGrade && (
        <Pressable
          onPress={() => {
            navigation.navigate('LevelPromotion', {
              grade: `Grade ${selectedGrade}`,
              gradeID: selectedGrade,
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