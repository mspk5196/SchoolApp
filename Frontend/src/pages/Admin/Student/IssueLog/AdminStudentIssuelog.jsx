import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import PreviousIcon from '../../../../assets/AdminPage/Basicimg/PrevBtn.svg';
import PhoneIcon from '../../../../assets/AdminPage/StudentHome/Issuelog/Phone.svg';
import MessageIcon from '../../../../assets/AdminPage/StudentHome/Issuelog/MessageSquare.svg';
import styles from './IssuelogStyls';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '../../../../assets/AdminPage/StudentHome/studentprofile/search.svg';
import Homeicon from '../../../../assets/AdminPage/Basicimg/Home.svg';
import { API_URL } from '@env'
const Staff = '../../../../assets/AdminPage/StudentHome/Issuelog/staff.png'

const AdminStudentIssuelog = ({ navigation, route }) => {
  const { gradeId } = route.params || {};
  const [activeSection, setActiveSection] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [disciplineData, setDisciplineData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (gradeId) {
      fetchSections(gradeId);
    }
  }, [gradeId]);

  useEffect(() => {
    if (selectedSection) {
      fetchDisciplineData(selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    const filtered = disciplineData.filter(item =>
      item.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.roll.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, disciplineData]);

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.gradeSections);
        console.log(data.gradeSections);

        if (data.gradeSections) {
          setSelectedSection(data.gradeSections[0].id);
          setActiveSection(data.gradeSections[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchDisciplineData = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/discipline-issues`);
      const data = await response.json();
      if (data.success) {
        console.log(data.issues);

        setDisciplineData(data.issues);
      }
    } catch (error) {
      console.error('Error fetching discipline data:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
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

  const handleCallPress = (phone) => {
      // Open phone dialer with the contact's phone number
      Linking.openURL(`tel:${phone}`);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}>
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Discipline Log</Text>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.classnavsection}
        nestedScrollEnabled={true}>
        {sections.map((section, index) => (
          <Pressable
            key={section.id}
            style={[
              styles.gradeselection,
              activeSection === section.id && styles.activeButton,
            ]}
            onPress={() => handleSectionSelect(section.id)}>
            <Text
              style={[
                styles.gradeselectiontext,
                activeSection === section.id && styles.activeText,
              ]}>
              Section {section.section_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <Search />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#767676"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.cardContainer}>
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {item.profile_photo ? (
                  <Image source={getProfileImageSource(item.profile_photo)} style={styles.avatar} />
                ) : (
                  <Image source={Staff} style={styles.avatar} />
                )}
                <View>
                  <Text style={styles.cardTitle}>{item.student_name}</Text>
                  <Text style={styles.cardSubtitle}>{item.roll}</Text>
                </View>
                <Text style={styles.cardDate}>{new Date(item.registered_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={styles.cardLine} >
                  <Text style={styles.cardReason}>{item.complaint}</Text>
                </View>
                <View style={styles.regBar}>
                  <Text style={styles.registeredBy}>
                    Mentor : {item.registered_by_name}
                  </Text>
                  <TouchableOpacity style={styles.actionButtonCall} onPress={()=>handleCallPress(item.registered_by_phone)}>
                    <PhoneIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonMsg}>
                    <MessageIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No students found</Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <Homeicon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentIssuelog;