import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import BackIcon from '../../../../assets/AdminPage/FreeHour/leftarrow.svg';
import TimeIcon from '../../../../assets/AdminPage/FreeHour/time.svg';
import HomeIcon from '../../../../assets/AdminPage/FreeHour/home.svg';
import styles from './FreehourDetailStyle';
import staff from '../../../../assets/AdminPage/SubjectMentor/staff.png';
import { API_URL } from '../../../../utils/env.js';
import { apiFetch } from '../../../../utils/apiClient.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminFreehourDetail = ({ navigation, route }) => {
  const { faculty, timeSlot } = route.params;
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // console.log('Faculty ID:', faculty.id);

    if (faculty.id) {
      fetchTaskDetails();
    }
  }, []);

  // Update the fetchTaskDetails function to match your backend:

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/admin/getSelectedFreeHourActivity?dsId=${faculty.id}`);
      const data = response
      setTaskDetails(data[0]);
      console.log('Task details:', data);

    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

 const authTokenRef = useRef(null);
  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    // console.log(authTokenRef.current);
    
    // console.log('Profile Path:', profilePath);
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const uri = `${API_URL}/${normalizedPath}`;
      // return { uri: fullImageUrl };
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
    } else {
      return Staff;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Free hour</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          {faculty.file_path ? (
            <Image source={getProfileImageSource(faculty.file_path)} style={styles.avatar} />
          ) : (
            <Image source={staff} style={styles.avatar} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{faculty.name}</Text>
            <Text style={styles.facultyId}>Faculty ID: {faculty.roll}</Text>
            <Text style={styles.timeSlot}>{timeSlot}</Text>
          </View>
        </View>

        {taskDetails ? (
          <View style={styles.section}>
            <View style={styles.timeSection}>
              <View style={styles.timeIcon}>
                <TimeIcon width={20} height={20} />
              </View>
              <Text style={styles.timeRange}>{taskDetails.timeSlot}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Task Details</Text>
              <View style={styles.contentBox}>
                <Text style={styles.contentLabel}>Activity:</Text>
                <Text style={styles.contentText}>{taskDetails.activity_type}</Text>

                <Text style={styles.contentLabel}>Description:</Text>
                <Text style={styles.contentText}>
                  {taskDetails.description || 'No description provided'}
                </Text>

                <Text style={styles.contentLabel}>Status:</Text>
                <Text style={styles.contentText}>
                  {taskDetails.status}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.noTaskText}>No task assigned for this time slot</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.homeButton}>
        <HomeIcon width={26} height={26} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminFreehourDetail;