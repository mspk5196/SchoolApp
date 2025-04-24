import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, TextInput, Animated } from 'react-native';
import Leftarrow from "../../assets/leftarrow";
import styles from './AdminMentorListStyles';
const Staff = require('../../assets/staff.png');
import Search from '../../assets/search.svg';
import Filter from '../../assets/filter.svg';
import Tickbox from '../../assets/tick.svg';
import Tick from '../../assets/tickbox.svg';


const MentorList = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState({
    grades: [],
    subjects: [],
    time: { start: '', end: '' }
  });
  
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

  // Toggle filter sidebar
  const toggleFilterSidebar = () => {
    setShowFilterSidebar(!showFilterSidebar);
  };
  
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.SubNavbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Leftarrow width={20} height={20} style={styles.Leftarrow} />
        </TouchableOpacity>
        <Text style={styles.heading}>Mentor List</Text>
      </View>
      
      {/* Search Bar and Filter Icon */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Search style={styles.searchicon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilterSidebar}>
          <Filter width={22} height={22} />
        </TouchableOpacity>
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
      
      {/* Filter Sidebar Component */}
      <FilterSidebar 
        isVisible={showFilterSidebar} 
        onClose={toggleFilterSidebar} 
        filters={filters} 
        setFilters={setFilters} 
      />
    </View>
  );
};

const FilterSidebar = ({ isVisible, onClose, filters, setFilters }) => {
  const slideAnim = useState(new Animated.Value(isVisible ? 0 : 300))[0];
  
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  const toggleGradeFilter = (grade) => {
    const updatedGrades = [...filters.grades];
    const index = updatedGrades.indexOf(grade);
    
    if (index !== -1) {
      updatedGrades.splice(index, 1);
    } else {
      updatedGrades.push(grade);
    }
    
    setFilters({...filters, grades: updatedGrades});
  };

  const toggleSubjectFilter = (subject) => {
    const updatedSubjects = [...filters.subjects];
    const index = updatedSubjects.indexOf(subject);
    
    if (index !== -1) {
      updatedSubjects.splice(index, 1);
    } else {
      updatedSubjects.push(subject);
    }
    
    setFilters({...filters, subjects: updatedSubjects});
  };

  const handleTimeChange = (type, value) => {
    setFilters({
      ...filters,
      time: {
        ...filters.time,
        [type]: value
      }
    });
  };

  const removeFilter = (type, value) => {
    if (type === 'grade') {
      const updatedGrades = filters.grades.filter(grade => grade !== value);
      setFilters({...filters, grades: updatedGrades});
    } else if (type === 'subject') {
      const updatedSubjects = filters.subjects.filter(subject => subject !== value);
      setFilters({...filters, subjects: updatedSubjects});
    }
  };

  const applyFilters = () => {
    // Apply filter logic here
    onClose();
  };

  return (
    <Animated.View 
      style={[
        styles.filterSidebar,
        { transform: [{ translateX: slideAnim }] },
        !isVisible && { display: 'none' }
      ]}
    >
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filters</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      {/* Grade Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Grade</Text>
        <View style={styles.filterChips}>
          {filters.grades.map(grade => (
            <TouchableOpacity 
              key={`grade-chip-${grade}`} 
              style={styles.filterChip}
              onPress={() => removeFilter('grade', grade)}
            >
              <Text style={styles.chipText}>{grade}</Text>
              <Text style={styles.chipClose}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxColumn}>
            {[1, 2, 3, 4, 5].map(grade => (
              <TouchableOpacity 
                key={`grade-${grade}`}
                style={styles.checkboxRow}
                onPress={() => toggleGradeFilter(grade)}
              >
                <View style={styles.checkbox}>
                  {filters.grades.includes(grade) ? <Tick width={20} height={20} /> : <Tickbox width={20} height={20} />}
                </View>
                <Text style={styles.checkboxLabel}>{grade}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.checkboxColumn}>
            {[6, 7, 8, 9, 10].map(grade => (
              <TouchableOpacity 
                key={`grade-${grade}`}
                style={styles.checkboxRow}
                onPress={() => toggleGradeFilter(grade)}
              >
                <View style={styles.checkbox}>
                  {filters.grades.includes(grade) ? <Tick width={20} height={20} /> : <Tickbox width={20} height={20} />}
                </View>
                <Text style={styles.checkboxLabel}>{grade}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Subject Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Subject</Text>
        <View style={styles.filterChips}>
          {filters.subjects.map(subject => (
            <TouchableOpacity 
              key={`subject-chip-${subject}`} 
              style={styles.filterChip}
              onPress={() => removeFilter('subject', subject)}
            >
              <Text style={styles.chipText}>{subject}</Text>
              <Text style={styles.chipClose}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.checkboxContainer}>
          {['Tamil', 'English', 'Mathematics', 'Science', 'Social'].map(subject => (
            <TouchableOpacity 
              key={`subject-${subject}`}
              style={styles.checkboxRow}
              onPress={() => toggleSubjectFilter(subject)}
            >
              <View style={styles.checkbox}>
                {filters.subjects.includes(subject) ? <Tick width={20} height={20} /> : <Tickbox width={20} height={20} />}
              </View>
              <Text style={styles.checkboxLabel}>{subject}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Apply Filters Button */}
      <TouchableOpacity 
        style={styles.applyFiltersButton}
        onPress={applyFilters}
      >
        <Text style={styles.applyFiltersText}>Apply Filters</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MentorList;