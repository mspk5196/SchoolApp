import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal, Alert } from 'react-native';
import styles from './MentorDetailsStyles';
import { API_URL } from '../../../../utils/env.js';
import Staff from '../../../../assets/CoordinatorPage/MentorMapping/staff.png';
import Mentorimg from '../../../../assets/CoordinatorPage/MentorMapping/mentor.svg';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CoordinatorMentorDetails = ({ route, navigation }) => {

  const { mentor } = route.params;
  const tabs = ['Student', 'Subject Mentor'];
  const [activeTab, setActiveTab] = useState('Student');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSectionStudents();
    fetchMentorSubjects();
  }, [mentor]);

  const fetchSectionStudents = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getMentorSectionStudents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: mentor.section_id,mentorID:mentor.id }),
      });

      const data = response
      // console.log('Section students Data API Response:', data);

      if (data.success) {
        setStudents(data.sectionStudents);
      } else {
        Alert.alert('No Students Found', 'No students is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching section data:', error);
      Alert.alert('Error', 'Failed to fetch section data');
    }
  };

  const fetchMentorSubjects = async () => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getGradeSubjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: mentor.section_id }),  
      });

      const data = response
      // console.log('Section subjects Data API Response:', data);

      if (data.success) {
        const initializedSubjects = data.mentorSubjects.map(subject => ({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          facultyName: subject.sectionMentorName || 'Faculty name +',
          facultyId: subject.sectionMentorRoll || 'Faculty ID +',
          sectionMentorPhoto: subject.sectionMentorPhoto,
          selectedStaff: null
        }));
        setSubjects(initializedSubjects);
      } else {
        Alert.alert('No Subject Found', 'No subject is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching subjects data:', error);
      Alert.alert('Error', 'Failed to fetch subject data');
    }
  };

  const fetchAddedSubjectMentor = async (subjectID) => {
    try {
      const response = await apiFetch(`/coordinator/mentor/getEnroledGradeSubjectMentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeID: mentor.grade_id,
          subjectID
        }),
      });

      const data = response
      // console.log('Subject mentor Data API Response:', data);

      if (data.success) {
        setStaffMembers(data.enroledGradeSubjectMentor);
        setModalVisible(true);
      } else {
        Alert.alert('No Mentor Found', 'No mentor is associated with this subject');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
    }
  };

  const handleOpenStaffModal = async (subjectID) => {
    setSelectedSubjectIndex(subjectID);
    await fetchAddedSubjectMentor(subjectID);
  };

  const handleSelectStaff = (staff) => {
    if (selectedSubjectIndex !== null) {
      const updatedSubjects = subjects.map(subject => {
        if (subject.subject_id === selectedSubjectIndex) {
          return {
            ...subject,
            facultyName: staff.name,
            facultyId: staff.roll,
            selectedStaff: staff
          };
        }
        return subject;
      });
      setSubjects(updatedSubjects);
      setModalVisible(false);
      assignSubjectToMentorSection(staff.mentor_id, selectedSubjectIndex, mentor.grade_id, mentor.section_id);
    }
  };

  const assignSubjectToMentorSection = async (mentorId, subjectId, gradeId, sectionId) => {
    try {
      const response = await apiFetch(`/coordinator/mentor/assignSubjectToMentorSection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentorId,
          subject_id: subjectId,
          grade_id: gradeId,
          section_id: sectionId
        }),
      });

      const data = response
      if (data.success) {
        Alert.alert('Success', 'Mentor assigned to subject successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      Alert.alert('Error', 'Failed to assign mentor');
    }
  };

  const removeMentorStudents = async (mentorId, studentId) => {
    // console.log(mentorId, studentId);
    
    try {
      const response = await apiFetch(`/coordinator/mentor/removeMentorStudents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorID: mentorId,
          studentID: studentId,
        }),
      });

      const data = response
      if (data.success) {
        Alert.alert('Success', 'Mentor assigned to subject successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      Alert.alert('Error', 'Failed to assign mentor');
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
      return Staff;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.SubNavbar}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#000" style={styles.BackIcon}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTxt}>Mentor Mapping</Text>
        </View>
      </View>

      {/* Mentor Info Card */}
      <View style={styles.card}>
        {mentor.file_path ? (
          <Image source={getProfileImageSource(mentor.file_path)} style={styles.avatar} />
        ) : (
          <Image source={Staff} style={styles.avatar} />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.name}>{mentor.mentor_name}</Text>
          <Text style={styles.facultyId}>Faculty ID: {mentor.mentor_roll}</Text>
          <Text style={styles.specification}>Class {mentor.grade_id} - {mentor.section_name}</Text>
        </View>
        <TouchableOpacity style={styles.moreIcon}>
          <Text style={styles.moreText}>{mentor.student_count}</Text>
          <MaterialCommunityIcons name="account-multiple" color="#000" size={24} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      >
        {activeTab === 'Student' ? (
          students.length > 0 ? (
            <View>
              {students.map((student, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {student.profile_photo ? (
                      <Image source={getProfileImageSource(student.profile_photo)} style={styles.studentAvatar} />
                    ) : (
                      <Image source={Staff} style={styles.studentAvatar} />
                    )}
                    <View style={styles.listContent}>
                      <Text style={styles.listName}>{student.name}</Text>
                      <Text style={styles.listId}>{student.roll}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={()=>removeMentorStudents(student.id, mentor.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.listItem}>
              <Text style={{ alignSelf: 'center', fontSize: 15, marginHorizontal: 'auto' }}>No students</Text>
            </View>
          )

        ) : (
          subjects.length > 0 ? (
            <View>
              {subjects.map((subject, index) => (
                <View key={index} style={styles.listItemSub}>
                  <View style={styles.subjectIcon} />
                  <View style={{ marginVertical: 'auto' }}>
                    {subject.sectionMentorPhoto ? (
                      <Image source={getProfileImageSource(subject.sectionMentorPhoto)} style={styles.avatar} />
                    ) : (
                      <Mentorimg width={50} height={50} style={styles.avatar} />
                    )}
                  </View>
                  <View style={styles.listContent}>
                    <Text style={styles.listName}>{subject.subject_name}</Text>
                    <TouchableOpacity onPress={() => handleOpenStaffModal(subject.subject_id)}>
                      <Text style={[styles.listId, { color: subject.selectedStaff ? 'rgb(45, 45, 45)' : 'rgb(45, 45, 45)', fontSize: 14 }]}>
                        {subject.facultyName}
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.listId, { color: subject.selectedStaff ? 'rgb(45, 45, 45)' : 'rgb(45, 45, 45)', fontSize: 14 }]}>
                      {subject.facultyId}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.listItem}>
              <Text style={{ alignSelf: 'center', fontSize: 15, marginHorizontal: 'auto' }}>No subjects</Text>
            </View>
          )

        )}
      </ScrollView>

      {/* Staff Selection Modal Popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Staff</Text>

            <ScrollView style={styles.staffList}>
              {staffMembers.map((staff, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.staffItem}
                  onPress={() => handleSelectStaff(staff)}
                >
                  {staff.file_path ? (
                    <Image source={getProfileImageSource(staff.file_path)} style={styles.avatar} />
                  ) : (
                    <Image source={Staff} style={styles.avatar} />
                  )}
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <Text style={styles.staffId}>{staff.roll}</Text>
                    {staff.assigned_section_id && (
                      <Text style={[styles.staffId, { color: 'gray' }]}>
                        Already assigned to section {staff.assigned_section_id}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorMentorDetails;