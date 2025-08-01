import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Animated, Alert } from 'react-native';
import Leftarrow from "../../../../assets/AdminPage/Basicimg/PrevBtn.svg";
import styles from './CoordinatorListStyle';
const Staff = require('../../../../assets/AdminPage/Basicimg/staff.png');
import Search from '../../../../assets/AdminPage/MentorHome/search.svg';
import { API_URL } from '../../../../utils/env.js'


const AdminCoordinatorList = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCoordinators, setFilteredCoordinator] = useState([]);

  const [coordinators, setCoordinators] = useState([])
  const [coordinatorRoles, setCoordinatorRoles] = useState([]);

  useEffect(() => {
    fetchCoordinators()
  }, [])

  const fetchCoordinators = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/getAllCoordinators`, {
        method: 'GET'
      });

      const data = await response.json();
      // console.log('Grade Coordinators Data API Response:', data);

      if (data.success) {
        setCoordinators(data.coordinators);
        // console.log(data.gradeCoordinators);
      } else {
        Alert.alert('No Coordinators Found', 'No Coordinators are associated');
      }
    } catch (error) {
      console.error('Error fetching Coordinators data:', error);
      Alert.alert('Error', 'Failed to fetch coordinators data');
    }
  };

  // Filter students based on the search text
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = coordinators.filter((coordinator) =>
      coordinator.name.toLowerCase().includes(text.toLowerCase()) ||
      coordinator.roll.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCoordinator(filtered);
  };

  const fetchCoordinatorRoles = async (phoneNumber, coordinator) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/getRoles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const coordinatorInfo = data.data[0]; // if only one entry expected
        setCoordinatorRoles(coordinatorInfo.roles);

        navigation.navigate('AdminCoordinatorlistDetails', {
          coordinator,
          roles: coordinatorInfo.roles,
          grades: coordinatorInfo.grades
        });
      } else {
        Alert.alert('Error', 'No roles found for this coordinator');
      }
    } catch (error) {
      console.error('Error fetching coordinator roles:', error);
      Alert.alert('Error', 'Failed to fetch coordinator roles');
    }
  };


  // Navigate to mentor details when a card is clicked
  const handleCoordinatorPress = async (coordinator) => {
    // Fetch coordinator roles based on the selected coordinator's phone number
    await fetchCoordinatorRoles(coordinator.phone, coordinator);
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
        <Text style={styles.headerTxt}>Coordinator List</Text>
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
        {(searchText ? filteredCoordinators : coordinators).map((coordinator, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => handleCoordinatorPress(coordinator)}
          >
            {coordinator.file_path ? (
              <Image source={getProfileImageSource(coordinator.file_path)} style={styles.studentAvatar} />
            ) : (
              <Image source={Staff} style={styles.studentAvatar} />
            )}
            <View style={styles.listContent}>
              <Text style={styles.listName}>{coordinator.name}</Text> 
              <Text style={styles.listId}>{coordinator.roll}</Text>
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

export default AdminCoordinatorList;