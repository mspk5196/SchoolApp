import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import styles from './PhonebookStyles';
import Profile from '../../../../assets/ParentPage/LeaveIcon/profile.png';
import CallIcon from '../../../../assets/ParentPage/phonebook/call';
import PrevIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import MsgIcon from '../../../../assets/ParentPage/phonebook/msg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../utils/env.js'

const ContactCard = ({ name, facultyId, subject, phoneNumber, onMessagePress, profile }) => {
  const handleCallPress = () => {
    // Open phone dialer with the contact's phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.contentContainer}>
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            <Image source={getProfileImageSource(profile)} style={styles.avatar} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.facultyId}>Faculty ID: {facultyId}</Text>
            <Text style={styles.subject}>{subject}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallPress}>
            <CallIcon height={35} width={35} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onMessagePress}>
            <MsgIcon height={35} width={35} />
            <View style={styles.notification} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const StudentPagePhonebook = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleMessagePress = (contact) => {
    navigation.navigate('StudentPageMessage', { contact });
  };

  const [studentData, setStudentData] = useState([]);

  const fetchStudentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, []);


  const fetchSectionSubjectMentors = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }
      
      const response = await fetch(`${API_URL}/api/student/fetchSectionSubjectMentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: studentData.section_id
        }),
      }); // Replace with your API endpoint
      const data = await response.json();
      setContacts(data.subjectMentors || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (studentData.section_id) {
      fetchSectionSubjectMentors();
    }
  }, [studentData.section_id]);

  const onRefresh = () => {
    if (studentData.section_id) {
      fetchSectionSubjectMentors(true);
    }
  };

  const renderItem = ({ item }) => (
    <ContactCard
      name={item.mentor_name}
      facultyId={item.mentor_roll}
      subject={item.subject_name}
      profile={item.file_path}
      phoneNumber={item.mentor_phone}
      onMessagePress={() => handleMessagePress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <PrevIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phone Book</Text>
        </View>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.subject_id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
      />
    </SafeAreaView>
  );
};

export default StudentPagePhonebook;