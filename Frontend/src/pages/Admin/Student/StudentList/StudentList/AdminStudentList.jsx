import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Pressable } from 'react-native';
import PreviousIcon from '../../../../../assets/AdminPage/StudentHome/studentprofile/PrevBtn.svg';
import styles from './StudentListStyles';
const Staff = require('../../../../../assets/AdminPage/StudentHome/studentprofile/staff.png');
import Search from '../../../../../assets/AdminPage/StudentHome/studentprofile/search.svg';
import Homeicon from '../../../../../assets/AdminPage/Basicimg/Home.svg';
import { API_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nodata from '../../../../../components/General/Nodata';

const AdminStudentList = ({ navigation, route }) => {
  const { gradeId } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [adminData, setAdminData] = useState()

  useEffect(() => {
    fetchAdminData();
    if (gradeId) {
      fetchSections(gradeId);
    }
  }, [gradeId]);

  useEffect(() => {
    if (selectedSection) {
      fetchStudents(selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.roll.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchText, students]);

  const fetchAdminData = async () => {
    const storedData = await AsyncStorage.getItem('adminData');
    if (storedData) {
      setAdminData(storedData)
    }
  }

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.gradeSections);
        if (data.gradeSections) {
          setSelectedSection(data.gradeSections[0].id);
          setActiveSection(0);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchStudents = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/section/${sectionId}/students`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSectionSelect = (index, sectionId) => {
    setActiveSection(index);
    setSelectedSection(sectionId);
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Staff;
    }
  };

  return (
    <View style={[{ flex: 1 }, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student List</Text>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {sections.map((section, index) => (
          <Pressable
            key={section.id}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => handleSectionSelect(index, section.id)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>Section {section.section_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <Search style={styles.searchicon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#767676"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {students.length > 0 ? (
          (searchText ? filteredStudents : students).map((student, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => navigation.navigate('AdminStudentDetails', { student })}
            >
              <Image source={getProfileImageSource(student.profile_photo)} style={styles.studentAvatar} />
              <View style={styles.listContent}>
                <Text style={styles.listName}>{student.name}</Text>
                <Text style={styles.listId}>{student.roll}</Text>
              </View>
              <View style={styles.removeButton}>
                <Text style={styles.removeText}>View</Text>
              </View>
            </TouchableOpacity>
          ))
        ):(
          <Nodata/>
        )}

      </ScrollView>
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon />
      </TouchableOpacity>
    </View>
  );
};

export default AdminStudentList;