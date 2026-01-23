import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput, 
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import styles from './MentorMappingStyles';
import { Header, HorizontalChipSelector } from '../../../../components';
import ApiService from '../../../../utils/ApiService';

const staff = require('../../../../assets/General/staff.png');
const API_URL = 'http://10.150.255.254:6000';

const CoordinatorMentorMapping = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData, selectedGrade: initialGrade } = params;

  const [selectedGrade, setSelectedGrade] = useState(initialGrade || null);
  const [sections, setSections] = useState([]);
  const [unassignedMentors, setUnassignedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState(null);


  useEffect(() => {
    if (selectedGrade) {
      fetchSectionsWithMentors();
    }
  }, [selectedGrade]);


  const fetchSectionsWithMentors = async () => {
    if (!selectedGrade) return;
    // console.log(selectedGrade);
    
    setLoading(true);
    try {
      const response = await ApiService.makeRequest('/coordinator/getSectionsWithMentors', {
        method: 'POST',
        body: JSON.stringify({ gradeId: selectedGrade.grade_id }),
      });

      const data = await response.json();

      if (data.success) {
        setSections(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Error', 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedMentors = async () => {
    try {
      const response = await ApiService.makeRequest('/coordinator/getUnassignedMentors', {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        setUnassignedMentors(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching unassigned mentors:', error);
      Alert.alert('Error', 'Failed to load mentors');
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedMentorId) {
      Alert.alert('Validation', 'Please select a mentor');
      return;
    }

    if (!selectedSection) {
      Alert.alert('Error', 'No section selected');
      return;
    }

    try {
      const response = await ApiService.makeRequest('/coordinator/assignMentorToSection', {
        method: 'POST',
        body: JSON.stringify({
          mentorId: selectedMentorId,
          sectionId: selectedSection.section_id,
          assignedBy: userData?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Mentor assigned successfully');
        setIsModalVisible(false);
        setSelectedSection(null);
        setSelectedMentorId(null);
        setSearchText('');
        fetchSectionsWithMentors();
      } else {
        Alert.alert('Error', data.message || 'Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      Alert.alert('Error', 'Failed to assign mentor');
    }
  };

  const handleUnassignMentor = (section) => {
    Alert.alert(
      'Unassign Mentor',
      `Are you sure you want to unassign ${section.mentor_name} from ${section.section_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.makeRequest('/coordinator/unassignMentorFromSection', {
                method: 'POST',
                body: JSON.stringify({
                  mentorId: section.mentor_id,
                  sectionId: section.section_id,
                }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Success', 'Mentor unassigned successfully');
                fetchSectionsWithMentors();
              } else {
                Alert.alert('Error', data.message || 'Failed to unassign mentor');
              }
            } catch (error) {
              console.error('Error unassigning mentor:', error);
              Alert.alert('Error', 'Failed to unassign mentor');
            }
          },
        },
      ]
    );
  };

  const openAssignModal = (section) => {
    setSelectedSection(section);
    setSelectedMentorId(null);
    setSearchText('');
    fetchUnassignedMentors();
    setIsModalVisible(true);
  };

  const handleSectionPress = (section) => {
    if (section.mentor_id) {
      // Navigate to student list page
      navigation.navigate('CoordinatorSectionStudents', {
        section: section,
        grade: selectedGrade,
      });
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const uri = `${normalizedPath}`;
      return { uri };
    }
    return staff;
  };

  const filteredMentors = unassignedMentors.filter((mentor) =>
    mentor.mentor_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderSectionCard = ({ item }) => (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={() => handleSectionPress(item)}
      activeOpacity={0.7}
      disabled={!item.mentor_id}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Icon name="google-classroom" size={28} color="#3B82F6" />
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionName}>Section {item.section_name}</Text>
          <Text style={styles.studentCount}>
            {item.student_count} {item.student_count === 1 ? 'Student' : 'Students'}
          </Text>
        </View>
      </View>

      {item.mentor_id ? (
        <View style={styles.mentorInfo}>
          <Image 
            source={getProfileImageSource(item.profile_photo)} 
            style={styles.mentorAvatar} 
          />
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{item.mentor_name}</Text>
            <Text style={styles.mentorSpec}>{item.specification}</Text>
            <Text style={styles.mentorRoll}>ID: {item.mentor_roll}</Text>
          </View>
          <TouchableOpacity
            style={styles.unassignButton}
            onPress={() => handleUnassignMentor(item)}
          >
            <Icon name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => openAssignModal(item)}
        >
          <Icon name="account-plus" size={20} color="#FFFFFF" />
          <Text style={styles.assignButtonText}>Assign Mentor</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderMentorItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.mentorItem,
        selectedMentorId === item.mentor_id && styles.selectedMentorItem,
      ]}
      onPress={() => setSelectedMentorId(item.mentor_id)}
      activeOpacity={0.7}
    >
      <Image 
        source={getProfileImageSource(item.profile_photo)} 
        style={styles.mentorItemAvatar} 
      />
      <View style={styles.mentorItemInfo}>
        <Text style={styles.mentorItemName}>{item.mentor_name}</Text>
        <Text style={styles.mentorItemSpec}>{item.specification}</Text>
        <Text style={styles.mentorItemRoll}>ID: {item.mentor_roll}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        {selectedMentorId === item.mentor_id ? (
          <Icon name="radiobox-marked" size={24} color="#3B82F6" />
        ) : (
          <Icon name="radiobox-blank" size={24} color="#94A3B8" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="account-off" size={80} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No Sections Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedGrade
          ? `No sections available for ${selectedGrade.grade_name}`
          : 'Please select a grade to view sections'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Mentor Mapping"
        navigation={navigation}
        showBackButton={true}
        backgroundColor="#FFFFFF"
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading sections...</Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            renderItem={renderSectionCard}
            keyExtractor={(item) => item.section_id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchSectionsWithMentors();
              setRefreshing(false);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Assign Mentor Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Assign Mentor to {selectedSection?.section_name}
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search mentors..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredMentors}
            renderItem={renderMentorItem}
            keyExtractor={(item) => item.mentor_id.toString()}
            contentContainerStyle={styles.mentorListContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyMentorList}>
                <Icon name="account-search" size={60} color="#CBD5E1" />
                <Text style={styles.emptyMentorText}>
                  {searchText ? 'No mentors found' : 'All mentors are assigned'}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={[
              styles.modalAssignButton,
              !selectedMentorId && styles.modalAssignButtonDisabled,
            ]}
            onPress={handleAssignMentor}
            disabled={!selectedMentorId}
          >
            <Text style={styles.modalAssignButtonText}>Assign Mentor</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};



export default CoordinatorMentorMapping;
