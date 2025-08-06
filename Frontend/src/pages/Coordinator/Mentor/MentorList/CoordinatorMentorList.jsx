import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import BackIcon from "../../../../assets/CoordinatorPage/MentorList/leftarrow.svg";
import styles from './MentorListStyles';
import { API_URL } from '../../../../utils/env.js'
const Staff = require('../../../../assets/CoordinatorPage/MentorList/staff.png');
import Search from '../../../../assets/CoordinatorPage/MentorList/search.svg'
import Nodata from '../../../../components/General/Nodata';

const CoordinatorMentorList = ({ navigation, route }) => {
  const { coordinatorData, activeGrade } = route.params;
  const [searchText, setSearchText] = useState('');
  const [filteredMentor, setFilteredMentor] = useState([]);
  const [mentors, setMentor] = useState([])
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGradeMentors()
  }, [coordinatorData])

  const fetchGradeMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getGradeMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeID: activeGrade,
          // Include any other necessary parameters
        }),
      });

      const data = await response.json();
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

  // Loading component
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0C36FF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading mentors...</Text>
      </View>
    );
  }
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

    <View style={[styles.container, { flex: 1 }]}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Mentor List</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search style={styles.searchicon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor='grey'
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      >
        {(searchText ? filteredMentor : mentors).length === 0 ? (
          <Nodata message="No mentors found" />
        ) : (
          (searchText ? filteredMentor : mentors).map((mentor, index) => (
            <TouchableOpacity
              key={mentor.id}
              style={styles.listItem}
              onPress={() => handleMentorPress(mentor)}
            >
              {mentor.photo_url ? (
                <Image source={getProfileImageSource(mentor.photo_url)} style={styles.studentAvatar} />
              ) : (
                <Image source={Staff} style={styles.studentAvatar} />
              )}
              <View style={styles.listContent}>
                <Text style={styles.listName}>{mentor.name}</Text>
                <Text style={styles.listId}>{mentor.roll}</Text>
              </View>
              <View style={styles.removeButton}>
                <Text style={styles.removeText}>View</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>

  );
};

export default CoordinatorMentorList;
