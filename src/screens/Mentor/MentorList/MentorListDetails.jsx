import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, ScrollView, Pressable, TextInput } from 'react-native';
import BackIcon from "../../../assets/MentorList/leftarrow.svg";
import Numdays from '../../../assets/MentorList/numdays.svg';
import Clock from '../../../assets/MentorList/clock.svg';
import Leaveday from '../../../assets/MentorList/leaveday.svg';
import Eye from '../../../assets/MentorList/Group.svg';
import Pen from '../../../assets/MentorList/pen.svg';
import Roundhome from '../../../assets/MentorList/roundhome.svg';
import Assign from '../../../assets/MentorList/assign.svg';
import Tickicon from '../../../assets/MentorList/tickicon.svg';
import Tickbox from '../../../assets/MentorList/tickbox.svg';
import Tick from '../../../assets/MentorList/tick.svg';
import Oneperson from '../../../assets/MentorList/oneperson.svg';
import Hat from '../../../assets/MentorList/hat.svg';
// Import the calendar component
import { Calendar } from 'react-native-calendars';
import styles from './MentorListDetailsStyles';

const MentorDetails = ({ route, navigation }) => {
  const { mentor = {} } = route.params || {};

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(mentor.subject || '');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('23/12/24');
  const [formattedDate, setFormattedDate] = useState('2024-12-23');
  
  // New state variables for session and faculty modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');
  
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

  // Sessions for the day
  const sessions = [
    { id: 1, time: "09:00-10:00", label: "Session 1 (09.00-10.00)" },
    { id: 2, time: "10:00-10:40", label: "Session 2 (10.00-10.40)" },
    { id: 3, time: "11:00-11:40", label: "Session 3 (11.00-11.40)" },
    { id: 4, time: "11:40-12:30", label: "Session 4 (11.40-12.30)" },
    { id: 5, time: "01:30-02:10", label: "Session 5 (01.30-02.10)" },
    { id: 6, time: "02:10-03:00", label: "Session 6 (02.10-03.00)" },
    { id: 7, time: "03:20-04:00", label: "Session 7 (03.20-04.00)" },
  ];

  // Sample faculty data
  const faculties = Array.from({length: 10}, (_, index) => ({
    id: index + 1,
    name: `Mr. SasiKumar ${index + 1}`,
    specification: `M.E Tamil literature`,
    facultyId: `20338${index + 1}`,
  }));

  // For demo purposes, hardcoding today's classes
  const todayClasses = [
    { subject: 'Mathematics', grade: 'Grade VI - A', type: 'Academic class', time: '09:30 - 10:30' },
    { subject: 'Science', grade: 'Grade VI - A', type: 'Academic class', time: '10:30 - 11:30' },
    { subject: 'Social', grade: 'Grade VI - A', type: 'Academic class', time: '11:45 - 12:30' },
    { subject: 'Social', grade: 'Grade VI - A', type: 'Academic class', time: '11:45 - 12:30' },
  ];

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateParts = date.dateString.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;
    
    setSelectedDate(formattedDate);
    setFormattedDate(date.dateString);
    setShowCalendarModal(false);
  };

  // Handle session selection
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setShowSessionModal(false);
    setShowFacultyModal(true);
  };

  // Handle faculty selection
  const toggleFacultySelection = id => {
    if (selectedFaculties.includes(id)) {
      setSelectedFaculties(selectedFaculties.filter(item => item !== id));
    } else {
      setSelectedFaculties([...selectedFaculties, id]);
    }
  };

  // Handle substitute allocation
  const handleAllotSubstitute = () => {
    // Add your implementation for allocating substitutes
    setShowFacultyModal(false);
    // You can add logic to update the schedule with the selected faculty
    alert('Substitute allocated successfully!');
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
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
          <Image source={require('../../../assets/MentorList/staff.png')} style={styles.avatar} />
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
            <TouchableOpacity 
              style={styles.assignButton}
              onPress={() => setShowSessionModal(true)}
            >
              <Assign width={20} height={20} />
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

      {/* Session Modal */}
      <Modal
        visible={showSessionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sessionModalContent}>
            <View style={styles.sessionModalHeader}>
              <BackIcon 
                width={20} 
                height={20} 
                onPress={() => setShowSessionModal(false)}
              />
              <Text style={styles.sessionModalTitle}>Substitute allocation</Text>
            </View>
            
            <ScrollView style={styles.sessionList}>
              {sessions.map((session) => (
                <TouchableOpacity 
                  key={session.id}
                  style={styles.sessionItem}
                  onPress={() => handleSessionSelect(session)}
                >
                  <View style={styles.checkboxContainer}>
                    {selectedSession?.id === session.id ? (
                      <Tickbox width={20} height={20} />
                    ) : (
                      <Tick width={20} height={20} />
                    )}
                  </View>
                  <Text style={styles.sessionText}>{session.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.allotButton}
              onPress={() => {
                if (selectedSession) {
                  setShowSessionModal(false);
                  setShowFacultyModal(true);
                }
              }}
            >
              <Text style={styles.allotButtonText}>Allot substitute</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Faculty Selection Modal */}
      <Modal
        visible={showFacultyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFacultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.facultyModalContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchBox}
                placeholder="Search faculty"
                value={searchText}
                onChangeText={text => setSearchText(text)}
              />
            </View>
            
            <FlatList
              data={faculties.filter(faculty =>
                faculty.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.facultyItem,
                    selectedFaculties.includes(item.id) && styles.selectedFacultyItem,
                  ]}
                  onPress={() => toggleFacultySelection(item.id)}
                >
                  <View style={styles.facultyDetails}>
                    <View style={styles.staffName}>
                      <Oneperson width={20} height={20} />
                      <Text style={styles.facultyName}>{item.name}</Text>
                    </View>
                    <View style={styles.hatContainer}>
                      <Hat width={20} height={20} />
                      <Text style={styles.facultySpec}>
                        Specification ({item.specification})
                      </Text>
                    </View>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedFaculties.includes(item.id) ? (
                      <Tickbox width={20} height={20} />
                    ) : (
                      <Tick width={20} height={20} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              style={styles.facultyList}
            />
            
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleAllotSubstitute}
            >
              <Text style={styles.selectButtonText}>
                Select Faculties <Tickicon width={16} height={16} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.homeButtonContainer}>
        <Roundhome width={60} height={60}/>
      </TouchableOpacity>
    </View>
  );
};

export default MentorDetails;