import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import styles from './MentorDetailsStyles';
import BackIcon from '../../../assets/MentorMapping/leftarrow.svg';
import Person from '../../../assets/MentorMapping/person.svg';
import Staff from '../../../assets/MentorMapping/staff.png';
import Mentorimg from '../../../assets/MentorMapping/mentor.svg';

const MentorDetails = ({ route, navigation }) => {
  const { mentor } = route.params;
  const tabs = ['Student', 'Subject Mentor'];
  const [activeTab, setActiveTab] = useState('Student');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);

  // Dummy data for students and subjects
  const students = [
    { name: 'Prakash Raj', id: '2024V1023' },
    { name: 'Prakash Raj', id: '2024V1023' },
    { name: 'Prakash Raj', id: '2024V1023' },
    { name: 'Prakash Raj', id: '2024V1023' },
    { name: 'Prakash Raj', id: '2024V1023' },
    { name: 'Prakash Raj', id: '2024V1023' },
  ];

  // Staff data for popup
  const staffMembers = [
    { name: 'Sivakumar1', id: 'S001' },
    { name: 'Sivakumar2', id: 'S002' },
    { name: 'Sivakumar3', id: 'S003' },
    { name: 'Sivakumar4', id: 'S004' },
  ];

  // Modified subject data to handle selected faculty
  const [subjects, setSubjects] = useState([
    { subject: 'Tamil', facultyName: 'Faculty name +', facultyId: 'Faculty ID +', selectedStaff: null },
    { subject: 'English', facultyName: 'Faculty name +', facultyId: 'Faculty ID +', selectedStaff: null },
    { subject: 'Mathematics', facultyName: 'Faculty name +', facultyId: 'Faculty ID +', selectedStaff: null },
    { subject: 'Science', facultyName: 'Faculty name +', facultyId: 'Faculty ID +', selectedStaff: null },
    { subject: 'Social', facultyName: 'Faculty name +', facultyId: 'Faculty ID +', selectedStaff: null },
  ]);

  // Handle opening the staff selection popup
  const handleOpenStaffModal = (index) => {
    setSelectedSubjectIndex(index);
    setModalVisible(true);
  };

  // Handle selecting a staff member
  const handleSelectStaff = (staff) => {
    if (selectedSubjectIndex !== null) {
      const updatedSubjects = [...subjects];
      updatedSubjects[selectedSubjectIndex] = {
        ...updatedSubjects[selectedSubjectIndex],
        facultyName: staff.name,
        facultyId: staff.id,
        selectedStaff: staff
      };
      setSubjects(updatedSubjects);
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
<View style={styles.SubNavbar}>
  <View style={styles.header}>
    <BackIcon 
      width={styles.BackIcon.width} 
      height={styles.BackIcon.height} 
      onPress={() => navigation.goBack()}
      style={styles.BackIcon}
    />
    <Text style={styles.headerTxt}>Mentor Mapping</Text>
  </View>
</View>

      {/* Mentor Info Card */}
      <View style={styles.card}>
        <Image source={Staff} style={styles.avatar} />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.facultyId}>Faculty ID: {mentor.facultyId}</Text>
          <Text style={styles.specification}>Class {mentor.class} - {mentor.specification}</Text>
        </View>
        <TouchableOpacity style={styles.moreIcon}>
          <Text style={styles.moreText}>10 </Text>
          <Person height={20} width={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'Student' ? (
          students.map((student, index) => (
            <View key={index} style={styles.listItem}>
              <Image source={Staff} style={styles.studentAvatar} />
              <View style={styles.listContent}>
                <Text style={styles.listName}>{student.name}</Text>
                <Text style={styles.listId}>{student.id}</Text>
              </View>
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          subjects.map((subject, index) => (
            <View key={index} style={styles.listItemSub}>
              <View style={styles.subjectIcon} />
              <View>         
                <Mentorimg width={50} height={50} style={styles.mentorAvatar} />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listName}>{subject.subject}</Text>
                <TouchableOpacity onPress={() => handleOpenStaffModal(index)}>
                  <Text style={[styles.listId, { color: subject.selectedStaff ? '#000' : '#007BFF' }]}>
                    {subject.selectedStaff ? subject.facultyName : 'Faculty name +'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.listId, { color: subject.selectedStaff ? '#000' : '#007BFF' }]}>
                  {subject.selectedStaff ? subject.facultyId : 'Faculty ID +'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Staff Selection Modal Popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Staff</Text>
            
            <ScrollView style={styles.staffList}>
              {staffMembers.map((staff, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.staffItem}
                  onPress={() => handleSelectStaff(staff)}
                >
                  <Image source={Staff} style={styles.staffAvatar} />
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <Text style={styles.staffId}>{staff.id}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentorDetails;