import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BackIcon from '../../../../assets/AdminPage/FreeHour/leftarrow.svg';
import SearchIcon from '../../../../assets/AdminPage/FreeHour/search.svg';
import HistoryIcon from '../../../../assets/AdminPage/FreeHour/history.svg';
import PendingIcon from '../../../../assets/AdminPage/FreeHour/pending.svg';
import CompletedIcon from '../../../../assets/AdminPage/FreeHour/completed.svg';
import HomeIcon from '../../../../assets/AdminPage/FreeHour/home.svg';
import styles from './FreehourStyle';
import staff from '../../../../assets/AdminPage/SubjectMentor/staff.png';
import { API_URL } from '../../../../utils/env.js';

const AdminFreehour = ({ navigation, route }) => {
  const { selectedGrade } = route.params;
  const [searchText, setSearchText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch free hour data on component mount
  useEffect(() => {
    fetchFreeHours();
    fetchTasks();
    fetch(`${API_URL}/api/admin/generateDailyFreeSlots`, { menthod: 'GET' });

  }, []);

  const fetchFreeHours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/getFreeHour?grade=${selectedGrade}`);
      const data = await response.json();
      setFaculties(data);
      setFilteredFaculties(data);
      if (data.length === 0) {
        Alert.alert('No free hours available');
        setLoading(false);
      }
      else {
        setLoading(false);
      }

    } catch (error) {
      console.error('Error fetching free hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/getFreeHourActivity`);
      const data = await response.json();
      setTasks(data);
      console.log(data);

    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Filter faculties based on search text
  useEffect(() => {
    if (searchText.trim() === '') {

      setFilteredFaculties(faculties);
    } else {
      const filtered = faculties.filter(faculty =>
        faculty.mentorName.toLowerCase().includes(searchText.toLowerCase()) ||
        faculty.mentorRoll.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredFaculties(filtered);
    }
  }, [searchText, faculties]);

  // Handle card press to navigate to details
  const handleCardPress = (faculty) => {
    navigation.navigate('AdminFreeHourDetail', { faculty, timeSlot: `${faculty.start_time} - ${faculty.end_time}` });
  };

  // Handle assign task button press
  const handleAssignTask = (faculty) => {
    console.log(faculty);

    navigation.navigate('AdminFreeHourAssign', {
      faculty: {
        ds_id: faculty.id,
        mentorId: faculty.mentorId,
        name: faculty.name,
        facultyId: faculty.roll,
        timeSlot: `${faculty.start_time} - ${faculty.end_time}`,
        rawStartTime: faculty.start_time,
        rawEndTime: faculty.end_time,
        file_path: faculty.file_path,
      }
    });
  };

  // Handle mark as completed
  const handleMarkAsCompleted = async (taskId) => {
    try {
      await fetch(`${API_URL}/api/admin/tasks/${taskId}/complete`, {
        method: 'PUT'
      });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return staff;
    }
  };

  // Render task in history view
  const renderTaskItem = ({ item }) => {

    return (
      <View style={styles.taskCard}>
        <View style={styles.cardLeftBorder} />
        {item.file_path ? (
          <Image source={getProfileImageSource(item.file_path)} style={styles.avatar} />
        ) : (
          <Image source={staff} style={styles.avatar} />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.facultyName}</Text>
          <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
          <Text style={styles.timeSlot}>{item.timeSlot}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.activity}>Activity: {item.activity_type}</Text>
        </View>
        {item.status === 'Pending' ? (
          <View style={styles.statusPending}>
            <View>
              <PendingIcon width={20} height={20} style={styles.pendingIcon} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleMarkAsCompleted(item.id)}
            >
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusCompleted}>
            <CompletedIcon width={20} height={20} style={styles.completedIcon} />
            <Text style={styles.statusCompletedText}>Completed</Text>
          </View>
        )}
      </View>

    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container]}>
        <Text style={{ textAlign: 'center', marginVertical: 'auto' }}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 'auto' }} />
      </SafeAreaView>
    );
  }

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

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, showHistory && styles.activeButton]}
          onPress={() => setShowHistory(!showHistory)}
        >
          <HistoryIcon width={20} height={20} style={styles.historyIcon} />
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTaskItem}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredFaculties}
          keyExtractor={(item, index) => `${item.mentorId}-${item.rawStartTime}-${item.rawEndTime}-${index}`}
          renderItem={({ item }) => {
            const currentTime = new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"
            const isTimeOver = item.start_time < currentTime;

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => { item.is_adjusted === 1 ? handleCardPress(item) : null }}
              >
                <View style={styles.cardLeftBorder} />
                {item.file_path ? (
                  <Image source={getProfileImageSource(item.file_path)} style={styles.avatar} />
                ) : (
                  <Image source={staff} style={styles.avatar} />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.facultyId}>Faculty ID: {item.roll}</Text>
                  <Text style={styles.timeSlot}>{item.start_time} - {item.end_time}</Text>
                </View>
                <TouchableOpacity
                  disabled={isTimeOver || item.is_adjusted === 1}
                  style={[
                    styles.assignButton,
                    (isTimeOver || item.is_adjusted === 1) && { backgroundColor: 'grey' }
                  ]}
                  onPress={() => handleAssignTask(item)}
                >
                  <Text style={styles.assignButtonText}>
                    {item.is_adjusted === 1 ? 'Already Assigned' : (isTimeOver ? 'Time Over' : 'Assign Task')}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
          }}
          style={styles.facultyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('AdminMain')}
      >
        <HomeIcon width={26} height={26} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AdminFreehour;