import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Pressable } from 'react-native';
import PreviousIcon from '../../../assets/StudentHome/studentprofile/PrevBtn.svg';
import styles from './StudentListStyles';
const Staff = require('../../../assets/StudentHome/studentprofile/staff.png');
import Search from '../../../assets/StudentHome/studentprofile/search.svg';

const StudentProfile = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
    const tabs = [
        'Section A',
        'Section B',
        'Section C',
        'Section D',
        'Section E',
        'Section F',
        'Section G',
        'Section H',
        'Section I',
      ];
  const students = [
    { name: 'Prakash Raj 1', id: '2024V1023', mentorId: 'MA10101',  },
    { name: 'Prakash Raj 2', id: '2024V1024', mentorId: 'MA10102',  },
    { name: 'Prakash Raj 3', id: '2024V1025', mentorId: 'MA10103',  },
    { name: 'Prakash Raj 4', id: '2024V1026', mentorId: 'MA10104',  },
    { name: 'Prakash Raj 5', id: '2024V1027', mentorId: 'MA10105',  },
    { name: 'Prakash Raj 6', id: '2024V1028', mentorId: 'MA10106',  },
    { name: 'Prakash Raj 7', id: '2024V1029', mentorId: 'MA10107',  },
    { name: 'Prakash Raj 8', id: '2024V1030', mentorId: 'MA10108',  },
    { name: 'Prakash Raj 9', id: '2024V1031', mentorId: 'MA10109',  },
    { name: 'Prakash Raj 10', id: '2024V1032', mentorId: 'MA10110', },
  ];
  
  // Filter students based on the search text
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(text.toLowerCase()) ||
      student.id.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  
  
  return (
   
    <View style={[{ flex: 1 }, styles.container]}>
       <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student List</Text>
      </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavsection} nestedScrollEnabled={true}>
        {["Section A", "Section B", "Section C", "Section D", "Section E", "Section F", "Section G"].map((section, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeSection === index && styles.activeButton]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[styles.gradeselectiontext, activeSection === index && styles.activeText]}>{section}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search style={styles.searchicon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#767676"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {(searchText ? filteredStudents : students).map((student, index) => (
          <TouchableOpacity 
          key={index} 
          style={styles.listItem}
          onPress={() => navigation.navigate('StudentDetails', { student })}
        >
          <Image source={Staff} style={styles.studentAvatar} />
          <View style={styles.listContent}>
            <Text style={styles.listName}>{student.name}</Text>
            <Text style={styles.listId}>{student.id}</Text>
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

export default StudentProfile;