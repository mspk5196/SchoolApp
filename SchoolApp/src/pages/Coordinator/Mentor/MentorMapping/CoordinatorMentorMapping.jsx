import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { API_URL } from '../../../../utils/env.js';
import BackIcon from '../../../../assets/CoordinatorPage/MentorMapping/leftarrow.svg';
import staff from '../../../../assets/CoordinatorPage/MentorMapping/staff.png';
import Tickicon from '../../../../assets/CoordinatorPage/MentorMapping/tickicon.svg';
import Tickbox from '../../../../assets/CoordinatorPage/MentorMapping/tickbox.svg';
import Tick from '../../../../assets/CoordinatorPage/MentorMapping/tick.svg';
import Person from '../../../../assets/CoordinatorPage/MentorMapping/person.svg';
import OnePerson from '../../../../assets/CoordinatorPage/MentorMapping/oneperson.svg';
import Hat from '../../../../assets/CoordinatorPage/MentorMapping/hat.svg';
import Nodata from '../../../../components/General/Nodata';

import styles from './MentorMappingStyles';

const CoordinatorMentorMapping = ({ navigation, route }) => {
// console.log("hi");

  const { coordinatorData, activeGrade } = route.params;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [mentors, setMentors] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGradeSections()
  }, [coordinatorData]);

  useEffect(() => {
    if (activeSection) {
      fetchSectionMentor();
    }
  }, [activeSection]);

  const fetchGradeSections = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });

      const data = response
      console.log('Grade Sections Data API Response:', data);

      if (data.success) {
        setSections(data.gradeSections);
        if (data.gradeSections.length > 0) {
          setActiveSection(data.gradeSections[0].id);
        }
      } else {
        Alert.alert('No Sections Found', 'No section is associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching sections data:', error);
      Alert.alert('Error', 'Failed to fetch sections data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionMentor = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getSectionMentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeGrade: activeGrade }),
      });

      const data = response
      console.log('Section mentor Data API Response:', data);

      if (data.success) {
        setMentors(data.sectionMentor);
      } else {
        Alert.alert('No Mentor Found', 'No mentor is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
    }
  };

  const fetchGradeMentors = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getGradeNonEnroledMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });

      const data = response
      console.log('Grade Mentors not enroled Data API Response:', data);

      if (data.success) {
        console.log(data.gradeMentors);

        setFaculties(data.gradeMentors);
      } else {
        Alert.alert('No Mentors Found', 'No mentors is associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching mentors data:', error);
      Alert.alert('Error', 'Failed to fetch mentors data');
    }
  };


  const getNextSection = () => {
    if (mentors.length === 0) return 'A';
    const lastSection = mentors[mentors.length - 1].specification;
    return String.fromCharCode(lastSection.charCodeAt(0) + 1);
  };

  const toggleSelection = (id) => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter((item) => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };


  const addSelectedMentors = async () => {
    try {
      if (selectedFaculties.length === 0) {
        Alert.alert('Error', 'Please select at least one faculty');
        return;
      }
  
      const selectedMentors = faculties.filter(faculty =>
        selectedFaculties.includes(faculty.id)
      );
  
      // Get current sections for the grade
      const sectionsResponse = await apiFetch(`/coordinator/getGradeSections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });
  
      const sectionsData = await sectionsResponse.json();
  
      if (!sectionsData.success) {
        Alert.alert('Error', 'Failed to fetch grade sections');
        return;
      }
  
      // Get all existing sections
      let existingSections = sectionsData.gradeSections;
      console.log("Existing sections:", existingSections);
  
      // Generate new section names starting from the next letter after the last section
      const sectionNames = existingSections.map(sec => sec.section_name).sort();
      let nextSectionChar = 'A';
      
      if (sectionNames.length > 0) {
        // Find the last section name and get the next character
        const lastSection = sectionNames[sectionNames.length - 1];
        nextSectionChar = String.fromCharCode(lastSection.charCodeAt(0) + 1);
      }
      
      console.log("Next section will start from:", nextSectionChar);
      
      // Process each selected mentor
      let successCount = 0;
      
      for (let i = 0; i < selectedMentors.length; i++) {
        const mentor = selectedMentors[i];
        const newSectionName = String.fromCharCode(nextSectionChar.charCodeAt(0) + i);
        
        console.log(`Creating section ${newSectionName} for mentor ${mentor.mentor_name}`);
        
        try {
          // Create new section in DB
          const newSectionRes = await apiFetch(`/coordinator/createSection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newSectionName,
              grade_id: activeGrade,
            }),
          });
  
          const newSectionData = await newSectionRes.json();
          
          if (!newSectionData.success) {
            console.error(`Failed to create new section ${newSectionName}`);
            continue;
          }
          
          const sectionId = newSectionData.section_id;
          console.log(`Successfully created section ${newSectionName} with ID ${sectionId}`);
          
          // Assign mentor to the newly created section
          const assignResponse = await apiFetch(`/coordinator/mentor/assignMentorToSection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mentor_id: mentor.id,
              section_id: sectionId,
              grade_id: activeGrade,
            }),
          });
  
          const assignData = await assignResponse.json();
  
          if (!assignData.success) {
            console.error(`Failed to assign mentor ${mentor.id} to section ${sectionId}`);
          } else {
            console.log(`Successfully assigned mentor ${mentor.mentor_name} to section ${newSectionName}`);
            successCount++;
          }
        } catch (err) {
          console.error(`Error processing mentor ${mentor.mentor_name}:`, err);
        }
      }
  
      if (successCount > 0) {
        Alert.alert('Success', `${successCount} mentor(s) assigned to new sections successfully`);
      } else {
        Alert.alert('Error', 'Failed to assign mentors to sections');
      }
      
      fetchSectionMentor(); // Refresh the mentor list
      fetchGradeSections(); // Refresh the section list
      setIsModalVisible(false);
      setSelectedFaculties([]);
      
    } catch (error) {
      console.error('Error assigning mentors:', error);
      Alert.alert('Error', 'Failed to assign mentors to sections');
    }
  };


  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return staff;
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSectionMentor();
    setRefreshing(false);
  };

  // Loading component
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.SubNavbar}>
          <View style={styles.header}>
            <BackIcon
              width={styles.BackIcon.width}
              height={styles.BackIcon.height}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTxt}>Mentor Mapping</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading mentors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // const handleSectionChange = (section) => {
  //   setActiveSection(section);
  //   console.log(section);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.SubNavbar}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Mentor Mapping</Text>
        </View>
      </View>

      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
        style={{ flexGrow: 0 }}
        nestedScrollEnabled={true}
      >
        {sections.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]}
            onPress={() => handleSectionChange(section.id)}
          >
            <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>
              Section {section.section_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      <View>
        <FlatList
          data={mentors}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0C36FF']}
              tintColor="#0C36FF"
            />
          }
          ListEmptyComponent={<Nodata message="No mentors found" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CoordinatorMentorDetails', { mentor: item })}
            >
              {item.file_path ? (
                <Image source={getProfileImageSource(item.file_path)} style={styles.avatar} />
              ) : (
                <Image source={staff} style={styles.avatar} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.mentor_name}</Text>
                <Text style={styles.specification}>Section - {item.section_name}</Text>
                <Text style={styles.facultyId}>Faculty ID: {item.mentor_roll}</Text>
              </View>
              <TouchableOpacity style={styles.moreIcon}>
                <Text style={styles.moreText}>{item.student_count}</Text>
                <Person height={20} width={20} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.mentorList}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => { fetchGradeMentors(); setIsModalVisible(true) }}>
          <Text style={styles.addButtonText}>+ Add Mentor</Text>
        </TouchableOpacity>

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchBox}
              placeholder="Search faculty"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />

            <FlatList
              data={faculties.filter((faculty) =>
                faculty.mentor_name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    selectedFaculties.includes(item.id) && styles.selectedCard,
                  ]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <View>
                    <View style={styles.staffName}>
                      <OnePerson />
                      <Text style={styles.facultyName}>{item.mentor_name}</Text>
                    </View>
                    <View style={styles.Hat}>
                      <Hat />
                      <Text style={styles.facultySpec}>
                        Specification ({item.specification})
                      </Text>
                    </View>
                    <Text style={styles.facultyId}>Faculty ID: {item.mentor_roll}</Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedFaculties.includes(item.id) ? (
                      <Tickbox width={30} />
                    ) : (
                      <Tick width={30} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.selectButton} onPress={addSelectedMentors}>
              <Text style={styles.selectButtonText}>Select Faculties</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default CoordinatorMentorMapping;
