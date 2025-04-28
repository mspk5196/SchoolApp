import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList,ScrollView} from 'react-native';
import BackIcon from "../../../../assets/CoordinatorPage/MentorList/leftarrow";
import Numdays from  '../../../../assets/CoordinatorPage/MentorList/numdays.svg';
import Clock from    '../../../../assets/CoordinatorPage/MentorList/clock.svg';
import Leaveday from '../../../../assets/CoordinatorPage/MentorList/leaveday.svg';
import Pen from      '../../../../assets/CoordinatorPage/MentorList/pen.svg';
import Eye from      '../../../../assets/CoordinatorPage/MentorList/Group.svg';
import Roundhome from'../../../../assets/CoordinatorPage/MentorList/roundhome.svg';
// Import the calendar component
import { Calendar } from 'react-native-calendars';
import styles from './MentorListDetailsStyles';

const CoordinatorMentorListDetails = ({ route, navigation }) => {
  const { mentor = {} } = route.params || {};

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(mentor.subject || '');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('23/12/24');
  const [formattedDate, setFormattedDate] = useState('2024-12-23'); // YYYY-MM-DD format for calendar
  
  // Available subjects to choose from
  const subjects = [
    "Maths, Social",
    "Science, English",
    "English, Social",
    "Science, Maths",
    "Hindi, English",
    "Maths, Science",
    "Social, Hindi",
    "English, Maths",
    "Science, Social",
    "Hindi, Science"
  ];

  // For demo purposes, hardcoding today's classes
  const todayClasses = [
    { subject: 'Mathematics', grade: 'Grade VI - A', type: 'Academic class', time: '09:30 - 10:30' },
    { subject: 'Science', grade: 'Grade VI - A', type: 'Academic class', time: '10:30 - 11:30' },
    { subject: 'Social', grade: 'Grade VI - A', type: 'Academic class', time: '11:45 - 12:30' },
    { subject: 'Social', grade: 'Grade VI - A', type: 'Academic class', time: '11:45 - 12:30' },
  ];

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateParts = date.dateString.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;
    
    setSelectedDate(formattedDate);
    setFormattedDate(date.dateString);
    setShowCalendarModal(false);
  };

  // Render item for subject list
  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subjectItem}
      onPress={() => handleSubjectSelect(item)}
    >
      <Text style={styles.subjectItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Mentor List</Text>
      </View>

      <View style={styles.MentorDayDetails}>
        <View style={styles.profileSection}>
          <Image source={require('../../../../assets/CoordinatorPage/MentorList/staff.png')} style={styles.avatar} />
          <View style={styles.mentorInfo}>
            <Text style={styles.infoLabel}>Name : {mentor.name || 'N/A'}</Text>
            <Text style={styles.infoLabel}>Mentor ID : {mentor.mentorId || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statBox]}>
            <Numdays width={40}/>
            <View style={styles.totalText}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{mentor.total || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Clock/>
            <View>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={styles.statValue}>{mentor.present || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Leaveday/>
            <View>
              <Text style={styles.statLabel}>Leave</Text>
              <Text style={styles.statValue}>{mentor.leave || '0'}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Subject:</Text>
            <Text style={styles.infoValue}>{selectedSubject}</Text>
            <TouchableOpacity 
              style={styles.penicon} 
              onPress={() => setShowSubjectModal(true)}
            >
              <Pen width={12} height={15}/>
            </TouchableOpacity>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Mentor For:</Text>
            <Text style={styles.infoValue}>{mentor.mentorFor || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Issues: {mentor.issues || '01'}</Text>
            <TouchableOpacity style={styles.eyeicon}>
              <Eye width={15} height={15} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Handling:</Text>
            <Text style={styles.infoValue}>{mentor.handling || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.shedulesContainer}>    
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Schedules</Text>
          <View style={styles.dateSelector}>
            <Text style={styles.todayText}>Today</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={styles.dateText}> {selectedDate} </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
        {todayClasses.map((cls, index) => (
       
          <View key={index} style={styles.classItem}>
            <View>
              <Text style={styles.subjectText}>{cls.subject}</Text>
              <Text style={styles.gradeText}>{cls.grade}</Text>
              <Text style={styles.typeText}>{cls.type}</Text>
            </View>
            <Text style={styles.timeText}>{cls.time}</Text>
          </View>
          
        ))}
         </ScrollView>
      </View>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <FlatList
              data={subjects}
              renderItem={renderSubjectItem}
              keyExtractor={(item) => item}
              style={styles.subjectList}
            />
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Calendar
              current={formattedDate}
              markedDates={{
                [formattedDate]: { selected: true, selectedColor: '#0066CC' }
              }}
              onDayPress={handleDateSelect}
              theme={{
                selectedDayBackgroundColor: '#0066CC',
                todayTextColor: '#0066CC',
                arrowColor: '#0066CC',
              }}
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.homeButtonContainer} onPress={() => navigation.navigate('CoordinatorMain')}>
        <Roundhome width={50} height={50}/>
      </TouchableOpacity>
    </View>
  );
};

export default CoordinatorMentorListDetails;
