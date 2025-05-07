import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, ScrollView, Pressable, TextInput } from 'react-native';
import BackIcon from "../../../assets/MentorList/leftarrow.svg";
import Numdays from '../../../assets/MentorList/numdays.svg';
import Clock from '../../../assets/MentorList/clock.svg';
import Leaveday from '../../../assets/MentorList/leaveday.svg';
import Eye from '../../../assets/MentorList/Group.svg';
import Roundhome from '../../../assets/MentorList/roundhome.svg';
import Assign from '../../../assets/MentorList/assign.svg';
import Tickicon from '../../../assets/MentorList/tickicon.svg';
import Tickbox from '../../../assets/MentorList/tickbox.svg';
import Tick from '../../../assets/MentorList/tick.svg';
import Oneperson from '../../../assets/MentorList/oneperson.svg';
import Hat from '../../../assets/MentorList/hat.svg';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn.svg';
import { Calendar } from 'react-native-calendars';
import styles from './MentorlistDetailStyle';
import Footer from '../../../components/footerhome/footer.jsx';

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
    { subject: 'Social', grade: 'Grade VI - A', type: 'Academic class', time: '11:45 - 12:30' },
  ];

  // Function to parse date in dd/mm/yy format to a Date object
  const parseDate = (dateString) => {
    const [day, month, yearShort] = dateString.split('/');
    const year = '20' + yearShort; // Assuming 20xx for the year
    return new Date(year, month - 1, day); // month is 0-indexed in JS Date
  };

  // Function to format Date object to dd/mm/yy
  const formatDisplayDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  // Function to format Date object to yyyy-mm-dd for internal use
  const formatISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = parseDate(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    
    setSelectedDate(formatDisplayDate(currentDate));
    setFormattedDate(formatISODate(currentDate));
  };

  // Function to navigate to next day
  const goToNextDay = () => {
    const currentDate = parseDate(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    setSelectedDate(formatDisplayDate(currentDate));
    setFormattedDate(formatISODate(currentDate));
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon  />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor List</Text>
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
            <Numdays height={35} width={35}/>
            <View style={styles.totalText}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{mentor.total || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Clock height={35} width={35}/>
            <View>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={styles.statValue}>{mentor.present || '0'}</Text>
            </View>
          </View>
          <View style={[styles.statBox]}>
            <Leaveday height={35} width={35}/>
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
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle1}>Mentor For:</Text>
            <Text style={styles.infoValue}>{mentor.mentorFor || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Issues: {mentor.issues || '01'}</Text>
            
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
          <View style={styles.dateNavigation}>
            <View style={styles.todayIndicator} />
            <Text style={styles.todayText}>Today</Text>
            <View style={styles.dateNavigationControls}>
              <TouchableOpacity onPress={goToPreviousDay}>
                <Text style={styles.dateNavArrow}>{"<"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowCalendarModal(true)}
              >
                <Text style={styles.dateText}>{selectedDate}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={goToNextDay}>
                <Text style={styles.dateNavArrow}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.assignButton}
              onPress={() => setShowSessionModal(true)}
            >
              <Assign width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView >
        {todayClasses.map((cls, index) => (
          <View key={index} style={styles.classItem}>
            <View style={styles.classDetails}>
              <Text style={styles.subjectText}>{cls.subject}</Text>
              <Text style={styles.gradeText}>{cls.grade}</Text>
              <Text style={styles.typeText}>{cls.type}</Text>
            </View>
            <Text style={styles.timeText}>{cls.time}</Text>
          </View>
        ))}
        </ScrollView>
      </View>

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

      <Footer/>
    </View>
  );
};

export default MentorDetails;