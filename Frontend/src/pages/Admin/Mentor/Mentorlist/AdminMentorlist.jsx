import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Animated, Alert } from 'react-native';
import Leftarrow from "../../../../assets/AdminPage/Basicimg/PrevBtn.svg";
import styles from './MentorlistStyles';
const Staff = require('../../../../assets/AdminPage/Basicimg/staff.png');
import Search from '../../../../assets/AdminPage/MentorHome/search.svg';
import { API_URL } from '@env'


const AdminMentorlist = ({ navigation, route }) => {
  const { selectedGrade } = route.params;
  const [searchText, setSearchText] = useState('');
  const [filteredMentor, setFilteredMentor] = useState([]);

  const [mentors, setMentor] = useState([])

  useEffect(() => {
    fetchGradeMentors()
  }, [selectedGrade])

  const fetchGradeMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/mentor/getGradeMentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeID: selectedGrade,
        }),
      });

      const data = await response.json();
      // console.log('Grade mentors Data API Response:', data);

      if (data.success) {
        setMentor(data.gradeMentors);
        // console.log(data.gradeMentors);
      } else {
        Alert.alert('No Mentors Found', 'No mentors are associated with this grade');
      }
    } catch (error) {
      console.error('Error fetching mentors data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
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
    navigation.navigate('AdminMentorListDetails', { mentor });
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

    <View style={[styles.container, { flex: 1 }]}>
      <View style={styles.header}>
        <Leftarrow
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

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {(searchText ? filteredMentor : mentors).map((mentor, index) => (
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
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminMentorlist;