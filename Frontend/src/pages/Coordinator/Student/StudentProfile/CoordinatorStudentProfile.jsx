import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Pressable, Alert } from 'react-native';
import { API_URL } from '@env'
import BackIcon from "../../../../assets/CoordinatorPage/StudentProfile/leftarrow.svg";
import styles from './StudentProfileStyles';
const Staff = require('../../../../assets/CoordinatorPage/StudentProfile/staff.png');
import Search from '../../../../assets/CoordinatorPage/StudentProfile/search.svg';

const CoordinatorStudentProfile = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  
  const [searchText, setSearchText] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [sections, setSections] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchSectionStudents();
  }, [activeSection]) 
  // Fetch sections for the active grade
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gradeID: activeGrade }),
        });

        const data = await response.json();
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
      }
    };

    fetchSections();
  }, [coordinatorData]);

  const fetchSectionStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/student/getSectionStudents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionID: activeSection }),
      });

      const data = await response.json();
      console.log('Section students Data API Response:', data);

      if (data.success) {
        setStudents(data.sectionStudent);
      } else {
        Alert.alert('No Students Found', 'No students is associated with this section');
      }
    } catch (error) {
      console.error('Error fetching students data:', error);
      Alert.alert('Error', 'Failed to fetch students data');
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
      return Staff;
    }
  };

  // Filter students based on the search text
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(text.toLowerCase()) ||
      student.id.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  return (

    <View style={[styles.container, { flex: 1 }]}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Student List</Text>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {sections.map((section, index) => (
          <Pressable
            key={section.id}
            style={[styles.gradeselection, activeSection === section.id && styles.activeButton]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === section.id && styles.activeText]}>Section {section.section_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search style={styles.searchicon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          value={searchText}
          placeholderTextColor='grey'
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {(searchText ? filteredStudents : students).map((student, index) => (
          <TouchableOpacity
            key={student.id}
            style={styles.listItem}
            onPress={()=>navigation.navigate('CoordinatorStudentProfileDetails',{student})}
          >
            {/* <Image source={Staff} style={styles.studentAvatar} /> */}
            <Image source={getProfileImageSource(student.profile_photo)} style={styles.studentAvatar} />
            <View style={styles.listContent}>
              <Text style={styles.listName}>{student.name}</Text>
              <Text style={styles.listId}>{student.roll}</Text>
            </View>
            <View style={styles.removeButton}>
              <Text style={styles.removeText}>View</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>

  );
};

export default CoordinatorStudentProfile;
