import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import BackIcon from '../../../assets/WeeklySchedule/Back.svg';
import EditIcon from '../../../assets/WeeklySchedule/Edit.svg';
import BookIcon from '../../../assets/WeeklySchedule/Book.svg';
import UserIcon from '../../../assets/WeeklySchedule/User.svg';
import ActivityIcon from '../../../assets/WeeklySchedule/Activity.svg';
import LocationIcon from '../../../assets/WeeklySchedule/Location.svg';
import styles from './WeeklyScheduleStyle';

const WeeklySchedule = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('B');
  const [activeDay, setActiveDay] = useState({ day: 'Thu', date: '23' });
  const [scheduleItems, setScheduleItems] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  
  // New activity data
  const [newActivity, setNewActivity] = useState({
    id: null,
    timeStart: '9:40 AM',
    timeEnd: '10:30 PM',
    subject: 'Subject',
    faculty: 'Faculty',
    activity: 'Activity',
    venue: 'Venue'
  });
  
  // Time picker states
  const [selectedTimeType, setSelectedTimeType] = useState('start'); // 'start' or 'end'
  const [selectedTime, setSelectedTime] = useState({
    hour: '09',
    minute: '40',
    period: 'AM'
  });
  
  // Lists for modals
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];
  const faculty = ['Dr. Smith', 'Prof. Johnson', 'Ms. Garcia', 'Mr. Wilson', 'Dr. Adams'];
  const activities = ['Lecture', 'Lab', 'Tutorial', 'Workshop', 'Seminar', 'Group Discussion'];
  const venues = ['Room 101', 'Lab 3', 'Auditorium', 'Library', 'Conference Room', 'Online'];
  
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const days = [
    { day: 'Wed', date: '22' },
    { day: 'Thu', date: '23' },
    { day: 'Fri', date: '24' },
    { day: 'Sat', date: '25' },
    { day: 'Mon', date: '26' },
    { day: 'Tue', date: '27' },
    { day: 'Wed', date: '28' },
    { day: 'Thu', date: '29' },
    { day: 'Fri', date: '30' },
    { day: 'Sat', date: '31' },
  ];

  // Handle day selection - fixed to prevent multiple selections
  const handleDaySelect = (day, date) => {
    setActiveDay({ day, date });
  };

  // Handle adding a new activity
  const handleAddActivity = () => {
    setNewActivity({
      id: scheduleItems.length + 1,
      timeStart: '9:40 AM',
      timeEnd: '10:30 PM',
      subject: 'Subject',
      faculty: 'Faculty',
      activity: 'Activity',
      venue: 'Venue'
    });
    setShowAddModal(true);
  };

  // Save new activity with validation
  const saveNewActivity = () => {
    // Check if all fields are filled
    if (
      !newActivity.subject || newActivity.subject === 'Subject' ||
      !newActivity.faculty || newActivity.faculty === 'Faculty' ||
      !newActivity.activity || newActivity.activity === 'Activity' ||
      !newActivity.venue || newActivity.venue === 'Venue'
    ) {
      // Show alert for missing fields
      Alert.alert(
        "Missing Information",
        "Please select all fields before saving.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setScheduleItems([...scheduleItems, newActivity]);
    setShowAddModal(false);
  };

  // Open time modal
  const openTimeModal = (type) => {
    setSelectedTimeType(type);
    const timeString = type === 'start' ? newActivity.timeStart : newActivity.timeEnd;
    const [timeValue, period] = timeString.split(' ');
    const [hour, minute] = timeValue.split(':');
    
    setSelectedTime({
      hour: hour,
      minute: minute,
      period: period
    });
    
    setShowTimeModal(true);
  };

  // Confirm time selection
  const confirmTimeSelection = () => {
    const newTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
    
    if (selectedTimeType === 'start') {
      setNewActivity({ ...newActivity, timeStart: newTime });
    } else {
      setNewActivity({ ...newActivity, timeEnd: newTime });
    }
    
    setShowTimeModal(false);
  };

  // Select subject, faculty, activity, or venue
  const selectSubject = (subject) => {
    setNewActivity({ ...newActivity, subject });
    setShowSubjectModal(false);
  };

  const selectFaculty = (faculty) => {
    setNewActivity({ ...newActivity, faculty });
    setShowFacultyModal(false);
  };

  const selectActivity = (activity) => {
    setNewActivity({ ...newActivity, activity });
    setShowActivityModal(false);
  };

  const selectVenue = (venue) => {
    setNewActivity({ ...newActivity, venue });
    setShowVenueModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      
        {/* Header */}
        <View style={styles.header}>
          <BackIcon width={20} height={20} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Weekly Schedule</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Section Tabs */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContainer}
        >
          {sections.map(section => (
            <TouchableOpacity
              key={section}
              style={[styles.sectionTab, activeSection === section && styles.activeSectionTab]}
              onPress={() => setActiveSection(section)}
            >
              <Text style={[styles.sectionTabText, activeSection === section && styles.activeSectionTabText]}>
                Section {section}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Days Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
         {days.map(({ day, date }) => (
  <TouchableOpacity
    key={`${day}-${date}`}
    style={[
      styles.dayItem, 
      (activeDay.day === day && activeDay.date === date) && styles.activeDayItem
    ]}
    onPress={() => handleDaySelect(day, date)}
  >
    <Text style={styles.dateText}>{date}</Text>
    <Text style={styles.dayText}>{day}</Text>
  </TouchableOpacity>
))}
        </ScrollView>

        {/* Schedule Timeline */}
        <View style={styles.scheduleContainer}>
          {scheduleItems.map((item, index) => (
            <View key={`item-${item.id}`} style={styles.scheduleItem}>
              {/* Time */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.timeStart} - {item.timeEnd}</Text>
                <View style={styles.timeIndicator}>
                  <View style={styles.timeCircle} />
                  {index < scheduleItems.length - 1 && <View style={styles.timeLine} />}
                </View>
              </View>

              {/* Schedule Details */}
              <View style={styles.detailsContainer}>
                {/* Subject */}
                <View style={styles.detailRow}>
                  <BookIcon width={16} height={16} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.subject}</Text>
                </View>

                {/* Faculty */}
                <View style={styles.detailRow}>
                  <UserIcon width={16} height={16} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.faculty}</Text>
                </View>

                {/* Activity */}
                <View style={styles.detailRow}>
                  <ActivityIcon width={16} height={16} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.activity}</Text>
                </View>

                {/* Venue */}
                <View style={styles.detailRow}>
                  <LocationIcon width={16} height={16} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.venue}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Activity Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <Text style={styles.addButtonText}>Add activity</Text>
        <EditIcon width={16} height={16} style={styles.addButtonIcon} />
      </TouchableOpacity>

    
      <Modal
        transparent={true}
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Activity</Text>
            <ScrollView>
            {/* Time Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Time</Text>
              
              <View style={styles.timeInputRow}>
                <Text style={styles.timeLabel}>From:</Text>
                <TouchableOpacity 
                  style={styles.timeInput}
                  onPress={() => openTimeModal('start')}
                >
                  <Text style={styles.timeInputText}>{newActivity.timeStart}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInputRow}>
                <Text style={styles.timeLabel}>To:</Text>
                <TouchableOpacity 
                  style={styles.timeInput}
                  onPress={() => openTimeModal('end')}
                >
                  <Text style={styles.timeInputText}>{newActivity.timeEnd}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Subject Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Subject</Text>
              <TouchableOpacity 
                style={styles.selectionInput}
                onPress={() => setShowSubjectModal(true)}
              >
                <BookIcon width={16} height={16} style={styles.selectionIcon} />
                <Text style={styles.selectionText}>{newActivity.subject}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Faculty Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Faculty</Text>
              <TouchableOpacity 
                style={styles.selectionInput}
                onPress={() => setShowFacultyModal(true)}
              >
                <UserIcon width={16} height={16} style={styles.selectionIcon} />
                <Text style={styles.selectionText}>{newActivity.faculty}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Activity Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Activity</Text>
              <TouchableOpacity 
                style={styles.selectionInput}
                onPress={() => setShowActivityModal(true)}
              >
                <ActivityIcon width={16} height={16} style={styles.selectionIcon} />
                <Text style={styles.selectionText}>{newActivity.activity}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Venue Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Venue</Text>
              <TouchableOpacity 
                style={styles.selectionInput}
                onPress={() => setShowVenueModal(true)}
              >
                <LocationIcon width={16} height={16} style={styles.selectionIcon} />
                <Text style={styles.selectionText}>{newActivity.venue}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveNewActivity}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
     
      </Modal>   

      {/* Time Selection Modal */}
      <Modal
        transparent={true}
        visible={showTimeModal}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.timeModalContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.timeModalTitle}>
              Select {selectedTimeType === 'start' ? 'Start' : 'End'} Time
            </Text>
            
            <View style={styles.timePickerContainer}>
              {/* Hour */}
              <FlatList
                data={hours}
                keyExtractor={(item) => `hour-${item}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.hour === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({...selectedTime, hour: item})}
                  >
                    <Text 
                      style={[
                        styles.timePickerText,
                        selectedTime.hour === item ? styles.selectedTimePickerText : styles.unselectedTimePickerText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.timePickerColumn}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={hours.indexOf(selectedTime.hour) !== -1 ? hours.indexOf(selectedTime.hour) : 0}
                getItemLayout={(data, index) => (
                  {length: 40, offset: 40 * index, index}
                )}
              />
              
              <Text style={styles.timeSeparator}>:</Text>
              
              {/* Minutes */}
              <FlatList
                data={minutes}
                keyExtractor={(item) => `minute-${item}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.timePickerItem,
                      selectedTime.minute === item && styles.selectedTimePickerItem
                    ]}
                    onPress={() => setSelectedTime({...selectedTime, minute: item})}
                  >
                    <Text 
                      style={[
                        styles.timePickerText,
                        selectedTime.minute === item ? styles.selectedTimePickerText : styles.unselectedTimePickerText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.timePickerColumn}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={minutes.indexOf(selectedTime.minute) !== -1 ? minutes.indexOf(selectedTime.minute) : 0}
                getItemLayout={(data, index) => (
                  {length: 40, offset: 40 * index, index}
                )}
              />
              
              {/* AM/PM */}
              <View style={styles.periodPickerColumn}>
                {['AM', 'PM'].map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodPickerItem,
                      selectedTime.period === period && styles.selectedPeriodPickerItem
                    ]}
                    onPress={() => setSelectedTime({...selectedTime, period})}
                  >
                    <Text 
                      style={[
                        styles.periodPickerText,
                        selectedTime.period === period ? styles.selectedPeriodPickerText : styles.unselectedPeriodPickerText
                      ]}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={confirmTimeSelection}
              >
                <Text style={styles.saveButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        transparent={true}
        visible={showSubjectModal}
        animationType="fade"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectModal(false)}
        >
          <View style={styles.listModalContainer}>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject}
                style={styles.listModalItem}
                onPress={() => selectSubject(subject)}
              >
                <Text style={styles.listModalItemText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Faculty Selection Modal */}
      <Modal
        transparent={true}
        visible={showFacultyModal}
        animationType="fade"
        onRequestClose={() => setShowFacultyModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFacultyModal(false)}
        >
          <View style={styles.listModalContainer}>
            {faculty.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.listModalItem}
                onPress={() => selectFaculty(item)}
              >
                <Text style={styles.listModalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Activity Type Selection Modal */}
      <Modal
        transparent={true}
        visible={showActivityModal}
        animationType="fade"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.listModalContainer}>
            {activities.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.listModalItem}
                onPress={() => selectActivity(item)}
              >
                <Text style={styles.listModalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Venue Selection Modal */}
      <Modal
        transparent={true}
        visible={showVenueModal}
        animationType="fade"
        onRequestClose={() => setShowVenueModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVenueModal(false)}
        >
          <View style={styles.listModalContainer}>
            {venues.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.listModalItem}
                onPress={() => selectVenue(item)}
              >
                <Text style={styles.listModalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default WeeklySchedule;