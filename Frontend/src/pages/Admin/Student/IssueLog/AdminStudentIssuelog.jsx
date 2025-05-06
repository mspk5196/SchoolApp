import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import PreviousIcon from '../../../../assets/AdminPage/Basicimg/PrevBtn.svg';
import PhoneIcon from '../../../../assets/AdminPage/StudentHome/Issuelog/Phone.svg';
import MessageIcon from '../../../../assets/AdminPage/StudentHome/Issuelog/MessageSquare.svg';
import styles from './IssuelogStyls';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '../../../../assets/AdminPage/StudentHome/studentprofile/search.svg';
import Homeicon from '../../../../assets/AdminPage/Basicimg/Home.svg';
import {API_URL} from '@env'

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
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.regNo.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchText, disciplineData]);

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
        if (data.sections.length > 0) {
          setSelectedSection(data.sections[0].id);
          setActiveSection(0);
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
        setDisciplineData(data.issues);
      }
    } catch (error) {
      console.error('Error fetching discipline data:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSectionSelect = (index, sectionId) => {
    setActiveSection(index);
    setSelectedSection(sectionId);
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
        {sections?.map((section, index) => (
          <Pressable
            key={section.id}
            style={[
              styles.gradeselection,
              activeSection === index && styles.activeButton,
            ]}
            onPress={() => handleSectionSelect(index, section.id)}>
            <Text
              style={[
                styles.gradeselectiontext,
                activeSection === index && styles.activeText,
              ]}>
              {section.section_name}
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
                <Image
                  source={require('../../../../assets/AdminPage/StudentHome/Issuelog/staff.png')}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.regNo}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={styles.cardLine} >
                <Text style={styles.cardReason}>{item.reason}</Text>
                </View>
                <View style={styles.regBar}>
                  <Text style={styles.registeredBy}>
                    Mentor : {item.registeredBy}
                  </Text>
                  <TouchableOpacity style={styles.actionButtonCall}>
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
        <Homeicon/>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminStudentIssuelog;