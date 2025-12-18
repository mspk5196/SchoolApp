import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './MentorListStyles';
const Staff = require('../../../../assets/General/staff.png');
import Nodata from '../../../../components/General/Nodata';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../../utils/ApiService';
import { API_URL } from '../../../../config/env';
import { Header } from '../../../../components';

const CoordinatorMentorList = ({ navigation, route }) => {
  const params = route.params && route.params.data ? route.params.data : (route.params || {});
  const { userData, selectedGrade: activeGrade } = params;
  
  const [searchText, setSearchText] = useState('');
  const [filteredMentor, setFilteredMentor] = useState([]);
  const [mentors, setMentor] = useState([])
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const authTokenRef = useRef(null);

  useEffect(() => {
    fetchGradeMentors()
  }, [userData, activeGrade])

  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const fetchGradeMentors = async () => {
    try {
      setLoading(true);
      const response = await ApiService.post(`/coordinator/mentor/getGradeMentors`, {
        gradeID: activeGrade.grade_id
      });

      // console.log('Grade mentors Data API Response:', response);

      if (response.success) {
        setMentor(response.gradeMentors);
      } else {
        Alert.alert('No Mentors Found', 'No mentors are associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching mentors data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on the search text
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = mentors.filter((mentor) =>
      mentor.name.toLowerCase().includes(text.toLowerCase()) ||
      mentor.roll.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMentor(filtered);
  };

  // Navigate to mentor details when a card is clicked
  const handleMentorPress = (mentor) => {
    navigation.navigate('CoordinatorMentorListDetails', { mentor, data: { userData, selectedGrade: activeGrade } });
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGradeMentors();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Header title={'Mentor List'} navigation={navigation}/>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading mentors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const uri = `${API_URL}/${normalizedPath}`;
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      
      return { uri };
    } else {
      return Staff;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title={'Mentor List'} navigation={navigation}/>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{mentors.length} Mentors</Text>
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor='#94A3B8'
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={searchText ? filteredMentor : mentors}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={<Nodata message="No mentors found" />}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item: mentor }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => handleMentorPress(mentor)}
            activeOpacity={0.7}
          >
            <View style={styles.mentorCard}>
              {mentor.photo_url ? (
                <Image source={getProfileImageSource(mentor.photo_url)} style={styles.mentorAvatarGrid} />
              ) : (
                <Image source={Staff} style={styles.mentorAvatarGrid} />
              )}
              <View style={styles.gridContent}>
                <Text style={styles.gridName} numberOfLines={1}>{mentor.name}</Text>
                <Text style={styles.gridId}>ID: {mentor.roll}</Text>
                {mentor.sections && (
                  <View style={styles.sectionBadge}>
                    <Icon name="people-outline" size={12} color="#3B82F6" />
                    <Text style={styles.sectionText}>{mentor.sections}</Text>
                  </View>
                )}
                {mentor.student_count > 0 && (
                  <View style={styles.studentCountBadge}>
                    <Icon name="person-outline" size={12} color="#10B981" />
                    <Text style={styles.studentCountText}>{mentor.student_count} students</Text>
                  </View>
                )}
              </View>
              <View style={styles.viewIconContainer}>
                <MaterialIcon name="chevron-right" size={20} color="#3B82F6" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default CoordinatorMentorList;
