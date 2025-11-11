import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Image, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import styles from './MentorListStyles';
const Staff = require('../../../../assets/CoordinatorPage/MentorList/staff.png');
import Nodata from '../../../../components/General/Nodata';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const CoordinatorMentorList = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  const [searchText, setSearchText] = useState('');
  const [filteredMentor, setFilteredMentor] = useState([]);
  const [mentors, setMentor] = useState([])
  const [sam_mentors, setSamMentors] = useState([])
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const authTokenRef = useRef(null);

  useEffect(() => {
    fetchGradeMentors()
  }, [coordinatorData])

  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const fetchGradeMentors = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/coordinator/mentor/getGradeMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeID: activeGrade
        }),
      });

      const data = response
      console.log('Grade mentors Data API Response:', data);

      if (data.success) {
        setMentor(data.gradeMentors);
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
    navigation.navigate('CoordinatorMentorListDetails', { mentor });
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mentor List</Text>
        </View>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor List</Text>
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
            {mentor.photo_url ? (
              <Image source={getProfileImageSource(mentor.photo_url)} style={styles.mentorAvatarGrid} />
            ) : (
              <Image source={Staff} style={styles.mentorAvatarGrid} />
            )}
            <View style={styles.gridContent}>
              <Text style={styles.gridName} numberOfLines={1}>{mentor.name}</Text>
              <Text style={styles.gridId}>ID: {mentor.roll}</Text>
            </View>
            <View style={styles.viewIconContainer}>
              <MaterialIcon name="chevron-right" size={20} color="#3B82F6" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default CoordinatorMentorList;
