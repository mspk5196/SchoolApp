import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import BackIcon from '../../../assets/InfrastructureEnrollment/Back.svg';
import AddIcon from '../../../assets/InfrastructureEnrollment/Add.svg';
import SearchIcon from '../../../assets/InfrastructureEnrollment/Search.svg';
import FilterIcon from '../../../assets/InfrastructureEnrollment/Filter.svg';
import MenuIcon from '../../../assets/InfrastructureEnrollment/Menu.svg';
import FilterPopup from './FilterPopup';
import styles from './InfrastructureEnrollmentStyle';

const ClassroomCard = ({ classroom, onEdit, onToggleStatus, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#34C300'; // Green for active
      case 'InActive':
        return '#F44336'; // Red for inactive
      default:
        return '#4CAF50'; // Default green
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.cardTitle}>{classroom.name}</Text>
          <Text style={styles.cardSubtitle}>Floor {classroom.floor}</Text>
          <Text style={styles.cardCapacity}>Capacity: {classroom.capacity}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(classroom.status) }]} />
            <Text style={styles.statusText}>{classroom.status}</Text>
          </View>
          <Text style={styles.dateText}>{classroom.date}</Text>
          <Text style={styles.gradeText}>Grade: {classroom.grade}</Text>
        </View>
      </View>
      
      {/* Menu */}
      <Menu style={{zIndex: 1000}}>
        <MenuTrigger customStyles={{
          triggerWrapper: {
            padding: 5,
          },
        }}>
          <MenuIcon width={20} height={20} />
        </MenuTrigger>
        <MenuOptions customStyles={{
          optionsContainer: {
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 5,
            width: 150,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        }}>
          <MenuOption onSelect={() => onEdit(classroom)}>
            <Text style={{padding: 10, fontSize: 16, color: '#333333'}}>Edit</Text>
          </MenuOption>
          <MenuOption onSelect={() => onToggleStatus(classroom)}>
            <Text style={{padding: 10, fontSize: 16, color: '#333333'}}>
              {classroom.status === 'Active' ? 'Set Inactive' : 'Set Active'}
            </Text>
          </MenuOption>
          <MenuOption onSelect={() => onDelete(classroom)}>
            <Text style={{padding: 10, fontSize: 16, color: '#F44336', fontWeight: 'bold'}}>Delete</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
};

const Block = ({ title, classrooms, onEdit, onToggleStatus, onDelete }) => {
  return (
    <View style={styles.blockContainer}>
      <Text style={styles.blockTitle}>{title}</Text>
      {classrooms.map((classroom, index) => (
        <ClassroomCard 
          key={classroom.id || index} 
          classroom={classroom} 
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
};

const InfrastructureEnrollment = ({ navigation, route }) => {
  // Add unique ID to each classroom for better tracking
  const generateId = (classroom, index) => {
    return classroom.id || `${classroom.block}-${classroom.name}-${index}`;
  };

  // Sample data with useState to manage state
  const [blockAClassrooms, setBlockAClassrooms] = useState([
    { id: 'A-1', name: 'Biology Lab 1', floor: 1, capacity: 30, status: 'Active', date: '20/12/2023', grade: '10', subject: 'Biology', block: 'A', type: 'Laboratory' },
    { id: 'A-2', name: 'Academic class 301', floor: 2, capacity: 30, status: 'Active', date: '20/12/2023', grade: '10', subject: 'General', block: 'A', type: 'Academic class' },
    { id: 'A-3', name: 'Academic class 302', floor: 2, capacity: 30, status: 'InActive', date: '20/12/2023', grade: '11', subject: 'General', block: 'A', type: 'Academic class' },
    { id: 'A-4', name: 'Science Lab 1', floor: 1, capacity: 30, status: 'Active', date: '20/12/2023', grade: '12', subject: 'Science', block: 'A', type: 'Laboratory' },
    { id: 'A-5', name: 'Biology Lab 2', floor: 2, capacity: 30, status: 'Active', date: '20/12/2023', grade: '12', subject: 'Biology', block: 'A', type: 'Laboratory' },
  ]);

  const [blockBClassrooms, setBlockBClassrooms] = useState([
    { id: 'B-1', name: 'Biology Lab 1', floor: 1, capacity: 30, status: 'Active', date: '20/12/2023', grade: '9', subject: 'Biology', block: 'B', type: 'Laboratory' },
    { id: 'B-2', name: 'Academic class 301', floor: 2, capacity: 30, status: 'Active', date: '20/12/2023', grade: '8', subject: 'General', block: 'B', type: 'Academic class' },
  ]);

  // Create a mapping for all blocks
  const [blockClassroomsMap, setBlockClassroomsMap] = useState({
    'A': blockAClassrooms,
    'B': blockBClassrooms,
    'C': [],
    'D': []
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBlockAClassrooms, setFilteredBlockAClassrooms] = useState(blockAClassrooms);
  const [filteredBlockBClassrooms, setFilteredBlockBClassrooms] = useState(blockBClassrooms);
  const [filteredBlockMap, setFilteredBlockMap] = useState({
    'A': blockAClassrooms,
    'B': blockBClassrooms,
    'C': [],
    'D': []
  });
  
  // Filter state
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    grades: [],
    types: [],
    statuses: [],
    blocks: []
  });
  
  // Function to apply both search and filters
  const applySearchAndFilters = () => {
    const filterClassrooms = (classrooms) => {
      // Apply search filtering
      let filtered = classrooms;
      if (searchQuery) {
        filtered = filtered.filter(classroom => 
          classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (classroom.grade && classroom.grade.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (classroom.subject && classroom.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply filter criteria
      if (appliedFilters.grades.length > 0) {
        filtered = filtered.filter(classroom => 
          // Check if any of the classroom's grades match the selected grades
          appliedFilters.grades.some(grade => 
            classroom.grade && classroom.grade.includes(grade)
          )
        );
      }
      
      if (appliedFilters.types.length > 0) {
        filtered = filtered.filter(classroom => 
          appliedFilters.types.includes(classroom.type)
        );
      }
      
      if (appliedFilters.statuses.length > 0) {
        filtered = filtered.filter(classroom => 
          appliedFilters.statuses.includes(classroom.status)
        );
      }
      
      if (appliedFilters.blocks.length > 0) {
        filtered = filtered.filter(classroom => 
          appliedFilters.blocks.includes(classroom.block)
        );
      }
      
      return filtered;
    };

    // Update filtered classroom lists
    const updatedFilteredMap = {};
    Object.keys(blockClassroomsMap).forEach(blockKey => {
      updatedFilteredMap[blockKey] = filterClassrooms(blockClassroomsMap[blockKey]);
    });
    
    setFilteredBlockAClassrooms(filterClassrooms(blockAClassrooms));
    setFilteredBlockBClassrooms(filterClassrooms(blockBClassrooms));
    setFilteredBlockMap(updatedFilteredMap);
  };
  
  // Update filtered data when search query or filters change
  useEffect(() => {
    applySearchAndFilters();
  }, [searchQuery, appliedFilters, blockAClassrooms, blockBClassrooms, blockClassroomsMap]);

  // Process any returned data from AddInfraEnrollment
  useEffect(() => {
    if (route.params?.newClassroom) {
      const newClassroom = route.params.newClassroom;
      const isEditing = route.params.isEditing;
      const classroomId = route.params.classroomId || Date.now().toString();
      
      // Make sure the classroom has an ID
      const classroomWithId = {
        ...newClassroom,
        id: classroomId
      };
      
      // Handle block updates appropriately
      if (newClassroom.block === 'A') {
        if (isEditing) {
          // Update existing classroom
          setBlockAClassrooms(prev => 
            prev.map(classroom => 
              classroom.id === classroomId ? classroomWithId : classroom
            )
          );
        } else {
          // Add new classroom
          setBlockAClassrooms(prev => [...prev, classroomWithId]);
        }
      } else if (newClassroom.block === 'B') {
        if (isEditing) {
          // Update existing classroom
          setBlockBClassrooms(prev => 
            prev.map(classroom => 
              classroom.id === classroomId ? classroomWithId : classroom
            )
          );
        } else {
          // Add new classroom
          setBlockBClassrooms(prev => [...prev, classroomWithId]);
        }
      } else {
        // Handle other blocks dynamically
        setBlockClassroomsMap(prev => {
          const currentBlockClassrooms = prev[newClassroom.block] || [];
          let updatedClassrooms;
          
          if (isEditing) {
            updatedClassrooms = currentBlockClassrooms.map(classroom => 
              classroom.id === classroomId ? classroomWithId : classroom
            );
          } else {
            updatedClassrooms = [...currentBlockClassrooms, classroomWithId];
          }
          
          return {
            ...prev,
            [newClassroom.block]: updatedClassrooms
          };
        });
      }
      
      // Re-apply filters after updating data
      applySearchAndFilters();
    }
  }, [route.params]);
  
  // Update blockClassroomsMap when blockA or blockB classrooms change
  useEffect(() => {
    setBlockClassroomsMap(prev => ({
      ...prev,
      'A': blockAClassrooms,
      'B': blockBClassrooms
    }));
  }, [blockAClassrooms, blockBClassrooms]);
  
  // Handler functions for menu options
  const handleEdit = (classroom) => {
    navigation.navigate('AddInfraEnrollment', { classroom: {...classroom} });
  };

  const handleToggleStatus = (classroom) => {
    const newStatus = classroom.status === 'Active' ? 'InActive' : 'Active';
    
    const updateClassroom = (classrooms) => {
      return classrooms.map(c => {
        if (c.id === classroom.id) {
          return { ...c, status: newStatus };
        }
        return c;
      });
    };
    
    if (classroom.block === 'A') {
      setBlockAClassrooms(updateClassroom(blockAClassrooms));
    } else if (classroom.block === 'B') {
      setBlockBClassrooms(updateClassroom(blockBClassrooms));
    } else {
      setBlockClassroomsMap(prev => ({
        ...prev,
        [classroom.block]: updateClassroom(prev[classroom.block] || [])
      }));
    }
    
    // Provide user feedback
    Alert.alert(
      "Status Updated", 
      `${classroom.name} is now ${newStatus}`
    );
  };

  const handleDelete = (classroom) => {
    // Show confirmation before deleting
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${classroom.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            if (classroom.block === 'A') {
              setBlockAClassrooms(blockAClassrooms.filter(c => c.id !== classroom.id));
            } else if (classroom.block === 'B') {
              setBlockBClassrooms(blockBClassrooms.filter(c => c.id !== classroom.id));
            } else {
              setBlockClassroomsMap(prev => ({
                ...prev,
                [classroom.block]: (prev[classroom.block] || []).filter(c => c.id !== classroom.id)
              }));
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Handle filter application
  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
  };

  return (
    <MenuProvider>
    <View style={styles.container}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon ? styles.BackIcon.width : 24} 
          height={styles.BackIcon ? styles.BackIcon.height : 24} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Infrastructure Enrollment</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon width={20} height={20} style={styles.searchIcon}/>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search..." 
            placeholderTextColor="#9e9e9e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={[1]} // Just a dummy item to render once
        renderItem={() => (
          <View style={styles.content}>
            {/* Display all blocks dynamically */}
            {Object.keys(filteredBlockMap).map(blockKey => {
              const classrooms = filteredBlockMap[blockKey];
              if (classrooms && classrooms.length > 0) {
                return (
                  <Block 
                    key={`block-${blockKey}`}
                    title={`Block - ${blockKey}`} 
                    classrooms={classrooms} 
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                );
              }
              return null;
            })}
            
            {/* Show message if no results */}
            {Object.values(filteredBlockMap).every(block => block.length === 0) && (
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text>No classrooms match your search criteria.</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddInfraEnrollment')}
      >
        <AddIcon width={20} height={20} />
      </TouchableOpacity>
      
      {/* Filter Popup */}
      <FilterPopup 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={appliedFilters}
      />
    </View>
    </MenuProvider>
  );
};

export default InfrastructureEnrollment;