import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native';
import styles from '../../Coordinator/Materials/MaterialHomePage/MaterialHomeStyle';
import Nodata from '../../../components/General/Nodata';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as materialApi from '../../../utils/materialApi/mentorMaterialApi.js';
import ApiService from '../../../utils/ApiService';
import { Header, HorizontalChipSelector } from '../../../components';

const MentorMaterialHome = ({ navigation, route }) => {
  const params = route?.params || {};
  const { userData } = params;
  //   console.log(userData);


  const [grades, setGrades] = useState([]);
  const [gradeSubject, setGradeSubject] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState();
  const [activeSectionSelection, setActiveSectionSelection] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSections();
    }
  }, [selectedGrade]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await ApiService.makeRequest('/general/getGrades', {
        method: 'GET'
      });
      const data = await response.json();
      //   console.log(data);

      if (data.success && Array.isArray(data.data)) {
        setGrades(data.data);
        if (data.data.length > 0) {
          setSelectedGrade(data.data[0]);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to load grades');
      }
    } catch (error) {
      console.error('Error fetching mentor grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionSubjects = async (isRefreshing = false, sectionId) => {
    const secId = sectionId || selectedSection;
    if (!selectedGrade || !selectedGrade.id || !secId) {
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // console.log(secId);
      const result = await materialApi.getSectionSubjects(secId);
      
      if (result && result.success && Array.isArray(result.gradeSubjects) && result.gradeSubjects.length > 0) {
        const subjectsWithKeys = result.gradeSubjects.map((subject, index) => ({
          ...subject,
          section_id: secId,
          key: `${secId}-${subject.subject_id}-${index}`,
        }));

        setGradeSubject([
          {
            title: 'Subjects',
            data: subjectsWithKeys,
          },
        ]);
      } else {
        setGradeSubject([]);
        if (!isRefreshing) {
          Alert.alert('No Subjects', 'No subjects for this section');
        }
      }
    } catch (error) {
      console.error('Error fetching subjects for mentor:', error);
      if (!isRefreshing) {
        Alert.alert('Error', 'Failed to fetch subjects');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedGrade || !selectedGrade.id) return;

    try {
      const response = await ApiService.makeRequest('/general/getGradeSections', {
        method: 'POST',
        body: JSON.stringify({ gradeID: selectedGrade.id }),
      });
      const data = await response.json();
      //   console.log(data);

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Map API shape { section_id, section_name } to local { id, section_name }
        const mappedSections = data.data.map((sec) => ({
          id: sec.section_id,
          section_name: `Section ${sec.section_name}`,
        }));

        setSections(mappedSections);

        // Default to first section and load its subjects
        setSelectedSection(mappedSections[0].id);
        setActiveSectionSelection(mappedSections[0]);
        fetchSectionSubjects(false, mappedSections[0].id);
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections for mentor:', error);
      Alert.alert('Error', 'Failed to fetch sections data');
    }
  };

  const onRefresh = () => {
    if (selectedGrade && selectedSection) {
      fetchSectionSubjects(true);
    }
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section.id);
    setActiveSectionSelection(section);
    fetchSectionSubjects(false, section.id);
  };

  if (loading && !refreshing && gradeSubject.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Header title="Materials" navigation={navigation} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
          <LottieView
            source={require('../../../assets/General/lottie_loading.json')}
            autoPlay
            loop
            speed={0.5}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SectionList
      sections={gradeSubject}
      keyExtractor={(item) => item.key}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={(
        <View>
          <Header title="Materials" navigation={navigation} />

          <HorizontalChipSelector
            data={grades}
            selectedItem={selectedGrade}
            onSelectItem={setSelectedGrade}
            idKey="id"
            nameKey="grade_name"
          />

          {selectedGrade && sections.length > 0 && (
            <HorizontalChipSelector
              data={sections}
              selectedItem={activeSectionSelection}
              onSelectItem={handleSectionChange}
              idKey="id"
              nameKey="section_name"
            />
          )}
        </View>
      )}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: item.subject_id % 2 ? '#C9F7F5' : '#65558F12' },
          ]}
        >
          <Pressable style={styles.centeredCardContent}>
            <Text
              style={[
                styles.cardText,
                styles.centeredText,
                { color: item.subject_id % 2 ? '#0FBEB3' : '#65558F' },
              ]}
            >
              {item.subject_name}
            </Text>
            <View style={styles.cardManagementOptions}>
              <TouchableOpacity
                style={[
                  styles.managementButton,
                  { borderColor: item.subject_id % 2 ? '#0FBEB3' : '#65558F' },
                ]}
                onPress={() =>
                  navigation.navigate('MentorTopicHierarchy', {
                    userData,
                    grades,
                    selectedGrade,
                    selectedSubjectId: item.subject_id,
                    selectedSubjectName: item.subject_name,
                    selectedSectionId: item.section_id,
                  })
                }
              >
                <Text
                  style={[
                    styles.managementButtonText,
                    { color: item.subject_id % 2 ? '#0FBEB3' : '#65558F' },
                  ]}
                >
                  📚 Topic Hierarchy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.managementButton,
                  { borderColor: item.subject_id % 2 ? '#0FBEB3' : '#65558F' },
                ]}
                onPress={() =>
                  navigation.navigate('MentorBatchOverview', {
                    userData,
                    grades,
                    selectedGrade,
                    selectedSubjectId: item.subject_id,
                    selectedSubjectName: item.subject_name,
                    selectedSectionId: item.section_id,
                  })
                }
              >
                <Text
                  style={[
                    styles.managementButtonText,
                    { color: item.subject_id % 2 ? '#0FBEB3' : '#65558F' },
                  ]}
                >
                  👥 Batches
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      )}
      renderSectionHeader={() => null}
      ListEmptyComponent={(
        <View style={styles.noDataContainer}>
          <Nodata
            message="No subjects found for this grade"
            style={styles.noDataContent}
          />
        </View>
      )}
    />
  );
};

export default MentorMaterialHome;
