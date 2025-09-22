import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { API_URL } from '../../../../utils/env.js';
import Modal from 'react-native-modal';
import BackIcon from '../../../../assets/CoordinatorPage/SubjectMentor/leftarrow.svg';
import staff from '../../../../assets/CoordinatorPage/SubjectMentor/staff.png';
import Tickicon from '../../../../assets/CoordinatorPage/SubjectMentor/tickicon.svg';
import Tickbox from '../../../../assets/CoordinatorPage/SubjectMentor/tickbox.svg';
import Tick from '../../../../assets/CoordinatorPage/SubjectMentor/tick.svg';
import Oneperson from '../../../../assets/CoordinatorPage/SubjectMentor/oneperson.svg';
import Hat from '../../../../assets/CoordinatorPage/SubjectMentor/hat.svg';
import Nodata from '../../../../components/General/Nodata';
import styles from './SubjectMentorStyles';

const CoordinatorSubjectMentor = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  const [activeSubject, setActiveSubject] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [subjects, setSubject] = useState([]);
  const [enroledMentors, setEnroledMentors] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Create a reference for the horizontal scroll view
  const scrollViewRef = React.useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGradeMentor(), getGradeSubject()]);
      setLoading(false);
    };
    loadData();
  }, [coordinatorData]);

  useEffect(() => {
    if (activeSubject) {
      fetchEnroledSubjectMentors(activeSubject);
    }
  }, [activeSubject]);

  // Update available mentors when enrolled mentors change
  useEffect(() => {
    if (mentors.length > 0 && enroledMentors.length >= 0) {
      // Get the IDs of enrolled mentors
      const enrolledMentorIds = enroledMentors.map(mentor => mentor.id);

      // Filter out mentors who are already enrolled
      const filteredMentors = mentors.filter(mentor =>
        !enrolledMentorIds.includes(mentor.id)
      );

      setAvailableMentors(filteredMentors);
    }
  }, [mentors, enroledMentors]);

  // Mentors for that grade
  const fetchGradeMentor = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getSubjectGradeMentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });

      const data = response
      console.log('Grade Mentor Data API Response:', data);

      if (data.success) {
        setMentors(data.gradeMentor);
      } else {
        Alert.alert('No Mentors Found', 'No mentors is associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
    }
  };

  //For subject selection
  const getGradeSubject = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getMentorGradeSubject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeID: activeGrade }),
      });

      const data = response
      console.log('Section students Data API Response:', data);

      if (data.success) {
        setSubject(data.mentorGradeSubjects);
        if (data.success && data.mentorGradeSubjects.length > 0) {
          // Set the initial active subject
          setActiveSubject(data.mentorGradeSubjects[0].subject_id);
        }
      } else {
        Alert.alert('No Subject Found', 'No subject is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching subjects data:', error);
      Alert.alert('Error', 'Failed to fetch subject data');
    }
  };

  // Fetch mentors assigned to a specific subject
  const fetchEnroledSubjectMentors = (subjectId) => {
    apiFetch(`/coordinator/mentor/getEnroledSubjectMentors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeID: activeGrade,
        subjectID: subjectId
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setEnroledMentors(data.gradeEnroledMentor);
          console.log(data.gradeEnroledMentor);
          
        } else {
          setEnroledMentors([]);
        }
      })
      .catch(error => {
        console.error('Error fetching mentors:', error);
        Alert.alert('Error', 'Failed to fetch mentors');
      });
  };

  // Assign mentors to subject
  const assignMentorsToSubject = () => {
    if (selectedFaculties.length === 0) {
      Alert.alert('No Selection', 'Please select at least one mentor');
      return;
    }

    const requests = selectedFaculties.map(mentorId => {
      return apiFetch(`/coordinator/mentor/assignMentorToSubject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentorId,
          subject_id: activeSubject,
          grade_id: activeGrade
        }),
      });
    });

    Promise.all(requests)
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(results => {
        const allSuccess = results.every(result => result.success);
        if (allSuccess) {
          Alert.alert('Success', 'Mentors assigned successfully');
          fetchEnroledSubjectMentors(activeSubject);
          setIsModalVisible(false);
          setSelectedFaculties([]);
        } else {
          Alert.alert('Error', 'Some mentors could not be assigned');
        }
      })
      .catch(error => {
        console.error('Error assigning mentors:', error);
        Alert.alert('Error', 'Failed to assign mentors');
      });
  };

  const toggleSelection = id => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter(item => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };

  const handleSubjectChange = (subjectID, index) => {
    setActiveSubject(subjectID);
    // Reset selection when subject changes
    setSelectedFaculties([]);
    
    // Simple centering approach using the index of the selected item
    if (scrollViewRef.current) {
      // Find the subject's index
      const selectedIndex = subjects.findIndex(subject => subject.subject_id === subjectID);
      
      // Scroll to this index with automatic centering
      // We use 120 as estimated width of each item with margins
      const position = Math.max(0, selectedIndex * 120 - 100);
      
      // Use a small timeout to ensure the UI has updated
      setTimeout(() => {
        // Animate scroll to the calculated position
        scrollViewRef.current.scrollTo({ x: position, animated: true });
      }, 20);
    }
  };

  // Prepare for modal opening
  const openAddMentorModal = () => {
    setSearchText('');
    setSelectedFaculties([]);
    setIsModalVisible(true);
  };

  // Render the top part: navbar only (no subject tabs)
  const renderHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.SubNavbar}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Subject Mentor</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  // Render the footer with Add button
  const renderFooter = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={openAddMentorModal}>
      <Text style={styles.addButtonText}>+ Add Subject Mentor</Text>
    </TouchableOpacity>
  );

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
    if (activeSubject) {
      await fetchEnroledSubjectMentors(activeSubject);
    }
    setRefreshing(false);
  };

  // Loading component
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackIcon
            width={styles.BackIcon.width}
            height={styles.BackIcon.height}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Subject Mentor</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0C36FF" />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading subject mentors...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed header section */}
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Subject Mentor</Text>
      </View>

      {/* Subject tabs in separate container */}
      <View style={styles.subjectTabsContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.classnavsubject}
        >
          {subjects.map((subject, index) => (
            <Pressable
              key={subject.subject_id}
              style={[
                styles.subjectselection,
                activeSubject === subject.subject_id && styles.activeButton,
              ]}
              onPress={() => handleSubjectChange(subject.subject_id, index)}>
              <Text
                style={[
                  styles.gradeselectiontext,
                  activeSubject === subject.subject_id && styles.activeText,
                ]}>
                {subject.subject_name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={enroledMentors}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
        ListEmptyComponent={<Nodata message="No subject mentors found" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* <Image source={staff} style={styles.avatar} /> */}
            {item.file_path ? (
              <Image source={getProfileImageSource(item.file_path)} style={styles.avatar} />
            ) : (
              <Image source={staff} style={styles.avatar} />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specification}>
                Specification ({item.specification})
              </Text>
              <Text style={styles.facultyId}>Faculty ID: {item.roll}</Text>
            </View>
            <TouchableOpacity style={styles.moreIcon}>
              <Text style={styles.moreText}></Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={renderFooter}
        style={styles.mentorList}
        contentContainerStyle={styles.listContent}
      />

      {/* Add subject mentor modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}
        swipeDirection="down"
        onSwipeComplete={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search faculty"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          {availableMentors.length === 0 ? (
            <View style={styles.noMentorsContainer}>
              <Text style={styles.noMentorsText}>No available mentors to assign</Text>
            </View>
          ) : (
            <FlatList
              data={availableMentors.filter(mentor =>
                mentor.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    selectedFaculties.includes(item.id) && styles.selectedCard,
                  ]}
                  onPress={() => toggleSelection(item.id)}>
                  <View style={styles.facultyDetails}>
                    <View style={styles.staffName}>
                      <Oneperson />
                      <Text style={styles.facultyName}>{item.name}</Text>
                    </View>
                    <View style={styles.Hat}>
                      <Hat />
                      <Text style={styles.facultySpec}>
                        Specification ({item.specification})
                      </Text>
                    </View>
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
              style={styles.facultyList}
            />
          )}

          <TouchableOpacity
            style={[
              styles.selectButton,
              availableMentors.length === 0 && styles.disabledButton
            ]}
            onPress={assignMentorsToSubject}
            disabled={availableMentors.length === 0}>
            <Text style={styles.selectButtonText}>
              Select Faculties <Tickicon />
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CoordinatorSubjectMentor;