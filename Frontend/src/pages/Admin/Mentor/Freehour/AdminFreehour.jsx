import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import BackIcon from      '../../../../assets/AdminPage/FreeHour/leftarrow.svg';
import SearchIcon from    '../../../../assets/AdminPage/FreeHour/search.svg';
import HistoryIcon from   '../../../../assets/AdminPage/FreeHour/history.svg';
import PendingIcon from   '../../../../assets/AdminPage/FreeHour/pending.svg';
import CompletedIcon from '../../../../assets/AdminPage/FreeHour/completed.svg';
import HomeIcon from      '../../../../assets/AdminPage/FreeHour/home.svg';
import styles from './FreehourStyle';
import staff from '../../../../assets/AdminPage/SubjectMentor/staff.png';

const AdminFreehour = ({navigation, route}) => {
  const [searchText, setSearchText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: '1',
      facultyId: '203384',
      facultyName: 'Mr.SasiKumar',
      description: 'Cover syllabus',
      activity: 'Substitution',
      status: 'pending',
      timeSlot: '10:40AM - 11:20AM',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      facultyId: '203384',
      facultyName: 'Mr.SasiKumar',
      description: 'Lab assignment',
      activity: 'Lab Work',
      status: 'completed',
      timeSlot: '10:40AM - 11:20AM',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  // Sample data for free hour faculties
  const faculties = Array.from({length: 5}, (_, index) => ({
    id: index + 1,
    name: `Mr.SasiKumar`,
    facultyId: `203384`,
    timeSlot: '10:40AM - 11:20AM',
  }));

  // Check for new task from navigation params
  useEffect(() => {
    if (route.params?.newTask) {
      const newTask = {
        ...route.params.newTask,
        facultyName: faculties.find(f => f.facultyId === route.params.newTask.facultyId)?.name || 'Unknown',
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Clear the route params to prevent duplicate additions
      navigation.setParams({ newTask: null });
    }
  }, [route.params?.newTask]);

  // Filter faculties based on search text
  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Handle card press to navigate to details
  const handleCardPress = (faculty) => {
    navigation.navigate('AdminFreeHourDetail', { faculty });
  };

  // Handle assign task button press
  const handleAssignTask = (faculty) => {
    navigation.navigate('AdminFreeHourAssign', { faculty });
  };

  // Handle mark as completed
  const handleMarkAsCompleted = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? {...task, status: 'completed'} : task
      )
    );
  };

  // Render task in history view
  const renderTaskItem = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.cardLeftBorder} />
      <Image source={staff} style={styles.avatar} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.facultyName}</Text>
        <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
        <Text style={styles.timeSlot}>{item.timeSlot}</Text>
      </View>
      {item.status === 'pending' ? (
        <View style={styles.statusPending}>
            <PendingIcon width={20} height={20} style={styles.pendingIcon} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      ) : (
        <View style={styles.statusCompleted}>
            <CompletedIcon width={20} height={20} style={styles.completedIcon} />
          <Text style={styles.statusCompletedText}>Completed</Text>
        </View>
      )}
    </View>
  );

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
          keyExtractor={item => item.id}
          renderItem={renderTaskItem}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredFaculties}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress(item)}
            >
              <View style={styles.cardLeftBorder} />
              <Image source={staff} style={styles.avatar} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.facultyId}>Faculty ID: {item.facultyId}</Text>
                <Text style={styles.timeSlot}>{item.timeSlot}</Text>
              </View>
              <TouchableOpacity 
                style={styles.assignButton}
                onPress={() => handleAssignTask(item)}
              >
                <Text style={styles.assignButtonText}>Assign task</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
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