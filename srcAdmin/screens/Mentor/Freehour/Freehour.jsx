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
import PreviousIcon from '../../../assets/Basicimg/PrevBtn.svg';
import Search from '../../../assets/StudentHome/studentprofile/search.svg';
import HistoryIcon from '../../../assets/FreeHour/history.svg';
import PendingIcon from '../../../assets/FreeHour/pending.svg';
import CompletedIcon from '../../../assets/FreeHour/completed.svg';
import styles from './FreehourStyle';
import staff from '../../../assets/SubjectMentor/staff.png';
import Footer from '../../../components/footerhome/footer.jsx';

const Freehour = ({navigation, route}) => {
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
    navigation.navigate('FreeHourDetail', { faculty });
  };

  // Handle assign task button press
  const handleAssignTask = (faculty) => {
    navigation.navigate('FreeHourAssign', { faculty });
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Free Hour</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
        <Search style={styles.searchicon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor={'#666'}
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
      <Footer/>
      
    </SafeAreaView>
  );
};

export default Freehour;