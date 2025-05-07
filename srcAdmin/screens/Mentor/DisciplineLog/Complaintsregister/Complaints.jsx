import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  SectionList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PreviousIcon from '../../../../assets/Basicimg/PrevBtn.svg';
import styles from './Complaintssty';
import Search from '../../../../assets/StudentHome/studentprofile/search.svg';

const DisciplineLogSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sample data for demonstration
  const allUsers = [
    { id: '1', name: 'Prakash Raj K', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '2', name: 'Prakash Raj G N', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '3', name: 'Prakash Raju P', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '4', name: 'Prakash Raja K L', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '5', name: 'Suganth R', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '6', name: 'Sujith T', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '7', name: 'Vishal A', image: require('../../../../assets/Basicimg/staff.png') },
    { id: '8', name: 'Mahesh R', image: require('../../../../assets/Basicimg/staff.png') },
  ];

  // Load recent searches from AsyncStorage
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const savedSearches = await AsyncStorage.getItem('recentSearches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Failed to load recent searches', error);
      }
    };

    loadRecentSearches();
  }, []);

  // Save recent searches to AsyncStorage whenever it changes
  useEffect(() => {
    const saveRecentSearches = async () => {
      try {
        await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      } catch (error) {
        console.error('Failed to save recent searches', error);
      }
    };

    if (recentSearches.length > 0) {
      saveRecentSearches();
    }
  }, [recentSearches]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filteredResults = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    // Add user to recent searches if not already there
    const isAlreadyInRecent = recentSearches.some(item => item.id === user.id);
    
    if (!isAlreadyInRecent) {
      setRecentSearches(prev => {
        const newSearches = [user, ...prev];
        // Keep only the last 5 searches
        return newSearches.slice(0, 5);
      });
    }
    
    // Navigate to user details or perform your desired action
    // navigation.navigate('UserDetails', { userId: user.id });
    
    // Clear search
    setSearchQuery('');
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches', error);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
    >
      <Image source={item.image} style={styles.userImage} />
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {title === 'Recent Searches' && recentSearches.length > 0 && (
        <TouchableOpacity onPress={clearRecentSearches}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const sections = [
    ...(recentSearches.length > 0 ? [{
      title: 'Recent Searches',
      data: recentSearches,
    }] : []),
    {
      title: 'All Users',
      data: allUsers,
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discipline Log</Text>
      </View>

      <View style={styles.searchContainer}>
      <Search style={styles.searchicon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name "
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          autoCapitalize="none"
        />
      </View>

      {searchQuery.length > 0 ? (
        
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
        />

      ) : (
        <View>
        <SectionList
          sections={sections}
          renderItem={renderUserItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          stickySectionHeadersEnabled={false}
        />
        </View>
      )}
    </SafeAreaView>
  );
};


export default DisciplineLogSearch;