import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
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
      // Check if it's a Cloudinary URL (starts with http/https)
      if (profilePath.startsWith('http://') || profilePath.startsWith('https://')) {
        return { uri: profilePath };
      }
      // Local file path - normalize and construct URL
      const normalizedPath = profilePath.replace(/\\/g, '/');
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


  const fetchSectionSubjectMentors = async () => {
    try {
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
    }
  }

  useEffect(() => {
    if (studentData.section_id) {
      fetchSectionSubjectMentors();
    }
  }, [studentData.section_id]);

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
      />
    </SafeAreaView>
  );
};

export default StudentPagePhonebook;