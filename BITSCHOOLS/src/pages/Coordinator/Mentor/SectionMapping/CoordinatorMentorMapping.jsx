import React, { useEffect, useRef, useState } from 'react';
import {
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
import staff from '../../../../assets/General/staff.png';
import Nodata from '../../../../components/General/Nodata';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './MentorMappingStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from '../../../../utils/ApiService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, HorizontalChipSelector } from '../../../../components';

const CoordinatorMentorMapping = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData, selectedGrade } = params;
  console.log('route.params.data or params =>', params);
  const gradeId = selectedGrade && (selectedGrade.grade_id);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [mentors, setMentors] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [reassignMentors, setReassignMentors] = useState([]);
  const [reassignSelectedMentor, setReassignSelectedMentor] = useState(null);
  const [reassignSearch, setReassignSearch] = useState('');
  const [targetSectionId, setTargetSectionId] = useState(null);

  useEffect(() => {
    fetchGradeSections()
  }, [userData]);

  useEffect(() => {
    if (activeSection) {
      fetchSectionMentor();
    }
  }, [activeSection]);

  const fetchGradeSections = async () => {
    console.log(selectedGrade);

    try {
      setLoading(true);
      const response = await ApiService.makeRequest(`/general/getGradeSections`, {
        method: 'POST',
        body: JSON.stringify({ gradeID: gradeId }),
      });

      const data = await response.json();
      console.log('Grade Sections Data API Response:', data);

      if (data.success) {
        setSections(data.data);
        if (data.data.length > 0) {
          setActiveSection(data.data[0].id);
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
        body: JSON.stringify({ gradeID: gradeId }),
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

  const fetchMentors = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getGradeNonEnroledMentors`, {
        method: 'GET'
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
        body: JSON.stringify({ gradeID: gradeId }),
      });

      const sectionsData = await sectionsResponse

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
              grade_id: gradeId,
            }),
          });

          const newSectionData = await newSectionRes;

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
              grade_id: gradeId,
            }),
          });

          const assignData = await assignResponse

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


  const authTokenRef = useRef(null);
  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    // console.log(authTokenRef.current);

    // console.log('Profile Path:', profilePath);
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const uri = `${API_URL}/${normalizedPath}`;
      // return { uri: fullImageUrl };
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
    } else {
      return staff;
    }
  };

  const openReassignModal = async (sectionId) => {
    setTargetSectionId(sectionId);
    setReassignSelectedMentor(null);
    setReassignSearch('');
    try {
      const response = await apiFetch(`/coordinator/mentor/getGradeNonEnroledMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: gradeId }),
      });
      const data = response;
      if (data.success) {
        setReassignMentors(data.gradeMentors || []);
        setReassignModalVisible(true);
      } else {
        Alert.alert('No Mentors Available', 'All mentors are already assigned to sections');
      }
    } catch (error) {
      console.error('Error fetching available mentors:', error);
      Alert.alert('Error', 'Failed to fetch available mentors');
    }
  };

  const confirmReassign = async () => {
    if (!targetSectionId) {
      Alert.alert('Error', 'No target section selected');
      return;
    }
    if (!reassignSelectedMentor) {
      Alert.alert('Select Mentor', 'Please select a mentor to assign to this section');
      return;
    }
    try {
      const result = await apiFetch(`/coordinator/mentor/reassignMentorForSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: reassignSelectedMentor,
          section_id: targetSectionId,
          grade_id: gradeId,
        }),
      });
      if (result?.success) {
        Alert.alert('Success', 'Mentor reassigned to section successfully');
        setReassignModalVisible(false);
        setTargetSectionId(null);
        setReassignSelectedMentor(null);
        await fetchSectionMentor();
      } else {
        Alert.alert('Error', result?.message || 'Failed to reassign mentor');
      }
    } catch (err) {
      console.error('Error reassigning mentor:', err);
      Alert.alert('Error', 'Failed to reassign mentor');
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
      <View style={styles.container}>
        <Header
          title="Mentor Mapping"
          navigation={navigation}
          showBackButton={true}
          backgroundColor="#FFFFFF"
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading mentors...</Text>
        </View>
      </View>
    );
  }

  // const handleSectionChange = (section) => {
  //   setActiveSection(section);
  //   console.log(section);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.SubNavbar}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#000"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Mentor Mapping</Text>
        </View>
      </View>

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
              <View style={styles.moreIcon}>
                <TouchableOpacity style={{ alignItems: 'center', marginRight: 8 }}>
                  <Text style={styles.moreText}>{item.student_count}</Text>
                  <MaterialCommunityIcons name="account-multiple" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openReassignModal(item.section_id)} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                  <MaterialCommunityIcons name="swap-horizontal" size={22} color="#0C36FF" />
                </TouchableOpacity>
              </View>
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
                      <MaterialCommunityIcons name="account" size={20} color="#000" />
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
                      <MaterialCommunityIcons name="checkbox-marked" size={24} color="#000" />
                    ) : (
                      <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="#000" />
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

        {/* Reassign mentor modal */}
        <Modal
          isVisible={reassignModalVisible}
          onBackdropPress={() => setReassignModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchBox}
              placeholder="Search faculty"
              value={reassignSearch}
              onChangeText={(text) => setReassignSearch(text)}
            />

            <FlatList
              data={reassignMentors.filter((m) =>
                (m.mentor_name || m.name)?.toLowerCase().includes(reassignSearch.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    reassignSelectedMentor === item.id && styles.selectedCard,
                  ]}
                  onPress={() => setReassignSelectedMentor(item.id)}
                >
                  <View>
                    <View style={styles.staffName}>
                      <MaterialCommunityIcons name="account" size={20} color="#000" />
                      <Text style={styles.facultyName}>{item.mentor_name || item.name}</Text>
                    </View>
                    <View style={styles.Hat}>
                      <Hat />
                      <Text style={styles.facultySpec}>
                        Specification ({item.specification})
                      </Text>
                    </View>
                    <Text style={styles.facultyId}>Faculty ID: {item.mentor_roll || item.roll}</Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {reassignSelectedMentor === item.id ? (
                      <MaterialCommunityIcons name="radiobox-marked" size={24} color="#0C36FF" />
                    ) : (
                      <MaterialCommunityIcons name="radiobox-blank" size={24} color="#000" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.selectButton} onPress={confirmReassign}>
              <Text style={styles.selectButtonText}>Reassign Mentor</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default CoordinatorMentorMapping;
