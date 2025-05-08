import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import BackIcon from "../../../assets/GeneralAssests/backarrow.svg";
import Roundhome from '../../../assets/MentorList/roundhome.svg';
import styles from './MentorListStyles';
const Staff = require('../../../assets/MentorList/staff.png');
import Search from '../../../assets/MentorList/search.svg'

const MentorList = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  const students = [
    { name: 'Prakash Raj 1', id: '2024V1023', mentorId: 'MA10101', subject: 'Maths, Social', mentorFor: 'Grade 5', handling: 'Class 1,5,7', total: 56, present: 53, leave: 3 },
    { name: 'Prakash Raj 2', id: '2024V1024', mentorId: 'MA10102', subject: 'Science, English', mentorFor: 'Grade 6', handling: 'Class 2,6', total: 48, present: 45, leave: 3 },
    { name: 'Prakash Raj 3', id: '2024V1025', mentorId: 'MA10103', subject: 'English, Social', mentorFor: 'Grade 4', handling: 'Class 4,8', total: 62, present: 60, leave: 2 },
    { name: 'Prakash Raj 4', id: '2024V1026', mentorId: 'MA10104', subject: 'Science, Maths', mentorFor: 'Grade 7', handling: 'Class 7,9', total: 53, present: 50, leave: 3 },
    { name: 'Prakash Raj 5', id: '2024V1027', mentorId: 'MA10105', subject: 'Hindi, English', mentorFor: 'Grade 3', handling: 'Class 3,5', total: 45, present: 42, leave: 3 },
    { name: 'Prakash Raj 6', id: '2024V1028', mentorId: 'MA10106', subject: 'Maths, Science', mentorFor: 'Grade 8', handling: 'Class 8,10', total: 58, present: 55, leave: 3 },
    { name: 'Prakash Raj 7', id: '2024V1029', mentorId: 'MA10107', subject: 'Social, Hindi', mentorFor: 'Grade 9', handling: 'Class 9,11', total: 50, present: 48, leave: 2 },
    { name: 'Prakash Raj 8', id: '2024V1030', mentorId: 'MA10108', subject: 'English, Maths', mentorFor: 'Grade 10', handling: 'Class 10,12', total: 65, present: 62, leave: 3 },
    { name: 'Prakash Raj 9', id: '2024V1031', mentorId: 'MA10109', subject: 'Science, Social', mentorFor: 'Grade 6', handling: 'Class 6,8', total: 55, present: 52, leave: 3 },
    { name: 'Prakash Raj 10', id: '2024V1032', mentorId: 'MA10110', subject: 'Hindi, Science', mentorFor: 'Grade 7', handling: 'Class 7,9', total: 60, present: 57, leave: 3 },
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

  // Navigate to mentor details when a card is clicked
  const handleMentorPress = (mentor) => {
    navigation.navigate('MentorListDetails', { mentor });
  };
  
  return (
   
    <View style={{ flex: 1 }, styles.container}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Mentor List</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search style={styles.searchicon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
      {(searchText ? filteredStudents : students).map((student, index) => (
          <TouchableOpacity 
          key={index} 
          style={styles.listItem}
          onPress={() => handleMentorPress(student)}
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
      <TouchableOpacity style={styles.homeButtonContainer}>
        <Roundhome width={60} height={60}/>
      </TouchableOpacity>
    </View>
    
  );
};

export default MentorList;