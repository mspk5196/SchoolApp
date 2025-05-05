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
import BackIcon from '../../../assets/ScheduleDetails/Back.svg';
import EditIcon from '../../../assets/ScheduleDetails/Edit.svg';
import BookIcon from '../../../assets/ScheduleDetails/Book.svg';
import UserIcon from '../../../assets/ScheduleDetails/User.svg';
import ActivityIcon from '../../../assets/ScheduleDetails/Activity.svg';
import LocationIcon from '../../../assets/ScheduleDetails/Location.svg';
import Tick2Icon from '../../../assets/ScheduleDetails/tick2.svg';
import DeleteIcon from '../../../assets/ScheduleDetails/delete-icon.svg';
import Add2Icon from '../../../assets/ScheduleDetails/Add.svg';
import styles from './ScheduleDetailsStyle';

const AdminScheduleDetails = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('1');
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
  
  // Schedule states
  const [isScheduleCreated, setIsScheduleCreated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
  
  // Changed from sections A,B,C... to grades 1,2,3...
  const grades = ['1', '2', '3', '4', '5'];
  const days = [
    { day: 'Mon'},
    { day: 'Tue'},
    { day: 'Wed'},
    { day: 'Thu'},
    { day: 'Fri'},
    { day: 'Sat'},
  ];

  // Handle day selection
  const handleDaySelect = (day, date) => {
    // Disable day selection if schedule is created
    if (isScheduleCreated) return;
    
    setActiveDay({ day, date });
  };

  // Handle adding a new activity
  const handleAddActivity = () => {
    // Don't allow adding if schedule is created
    if (isScheduleCreated) {
      return;
    }
    
    setNewActivity({
      id: Date.now(), // Unique ID using timestamp
      timeStart: '9:40 AM',
      timeEnd: '10:30 PM',
      subject: 'Subject',
      faculty: 'Faculty',
      activity: 'Activity',
      venue: 'Venue'
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  // Handle editing an existing activity
  const handleEditActivity = (item) => {
    // Don't allow editing if schedule is created
    if (isScheduleCreated) {
      return;
    }
    
    setNewActivity({ ...item });
    setIsEditing(true);
    setShowAddModal(true);
  };

  // Create schedule function
  const createSchedule = () => {
    // Perform validation before creating schedule
    if (scheduleItems.length === 0) {
      Alert.alert(
        "No Activities",
        "Please add at least one activity before creating the schedule.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check if any session has default values
    const invalidItems = scheduleItems.filter(item => 
      item.subject === 'Subject' ||
      item.faculty === 'Faculty' ||
      item.activity === 'Activity' ||
      item.venue === 'Venue'
    );

    if (invalidItems.length > 0) {
      // Show alert for missing fields
      Alert.alert(
        "Missing Information",
        "Please complete all activity details before creating the schedule.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Mark schedule as created
    setIsScheduleCreated(true);
  };

  // Function to return to edit mode
  const returnToEditMode = () => {
    setIsScheduleCreated(false);
  };

  // Delete an activity - only allowed when schedule not created
  const deleteActivity = (id) => {
    if (isScheduleCreated) {
      return;
    }
    
    const updatedItems = scheduleItems.filter(item => item.id !== id);
    setScheduleItems(updatedItems);
  };

  // Save new or updated activity with validation
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

    if (isEditing) {
      // Update existing activity
      const updatedItems = scheduleItems.map(item => 
        item.id === newActivity.id ? newActivity : item
      );
      setScheduleItems(updatedItems);
    } else {
      // Add new activity
      setScheduleItems([...scheduleItems, newActivity]);
    }
    
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
        <Text style={styles.headerTitle}>Academic Schedule</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Section Tabs - Changed to Grade tabs */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabsContainer}
        >
          {grades.map(grade => (
            <TouchableOpacity
              key={grade}
              style={[styles.sectionTab, activeSection === grade && styles.activeSectionTab]}
              onPress={() => setActiveSection(grade)}
              disabled={isScheduleCreated} // Disable when schedule is created
            >
              <Text style={[styles.sectionTabText, activeSection === grade && styles.activeSectionTabText]}>
                Grade {grade}
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
          {days.map(({ day }) => (
            <TouchableOpacity
              key={`${day}`}
              style={[
                styles.dayItem, 
                (activeDay.day === day) && styles.activeDayItem
              ]}
              onPress={() => handleDaySelect(day)}
              disabled={isScheduleCreated} // Disable when schedule is created
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Schedule Timeline */}
        <View style={styles.scheduleContainer}>
          {scheduleItems.map((item, index) => (
            <TouchableOpacity
              key={`item-${item.id}`}
              style={styles.scheduleItem}
              onPress={() => handleEditActivity(item)}
              disabled={isScheduleCreated} // Disable editing when schedule is created
            >
              {/* Time */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.timeStart} - {item.timeEnd}</Text>
                <View style={styles.timeIndicator}>
                  <View style={[
                    styles.timeCircle,
                    isScheduleCreated && styles.editModeTimeCircle
                  ]} />
                  {index < scheduleItems.length - 1 && <View style={styles.timeLine} />}
                </View>
              </View>

              {/* Schedule Details */}
              <View style={[
                styles.detailsContainer,
                isScheduleCreated && styles.createdModeDetailsContainer
              ]}>
                {/* Subject */}
                <View style={styles.detailRow}>
                  <BookIcon width={16} height={16} style={[
                    styles.detailIcon, 
                    isScheduleCreated && styles.disabledIcon
                  ]} />
                  <Text style={[
                    styles.detailText,
                    isScheduleCreated && styles.disabledText
                  ]}>{item.subject}</Text>
                </View>

                {/* Faculty */}
                <View style={styles.detailRow}>
                  <UserIcon width={16} height={16} style={[
                    styles.detailIcon,
                    isScheduleCreated && styles.disabledIcon
                  ]} />
                  <Text style={[
                    styles.detailText,
                    isScheduleCreated && styles.disabledText
                  ]}>{item.faculty}</Text>
                </View>

                {/* Activity */}
                <View style={styles.detailRow}>
                  <ActivityIcon width={16} height={16} style={[
                    styles.detailIcon,
                    isScheduleCreated && styles.disabledIcon
                  ]} />
                  <Text style={[
                    styles.detailText,
                    isScheduleCreated && styles.disabledText
                  ]}>{item.activity}</Text>
                </View>

                {/* Venue */}
                <View style={styles.detailRow}>
                  <LocationIcon width={16} height={16} style={[
                    styles.detailIcon,
                    isScheduleCreated && styles.disabledIcon
                  ]} />
                  <Text style={[
                    styles.detailText,
                    isScheduleCreated && styles.disabledText
                  ]}>{item.venue}</Text>
                </View>
                
                {/* Delete button - only visible when schedule not created */}
                {!isScheduleCreated && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteActivity(item.id)}
                  >
                    <DeleteIcon width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Add activity button - only show when not in edit mode and schedule not created */}
          {!isScheduleCreated && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
              <Add2Icon width={18} height={18} />
              <Text style={styles.addButtonText}>  Add activity</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Schedule Button */}
      <View style={styles.createButtonContainer}>
        {isScheduleCreated ? (
          // Show Edit button when schedule is created
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={returnToEditMode}
          >
            <EditIcon width={20} height={20} />
          </TouchableOpacity>
        ) : (
          // Show Create button when schedule not created
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={createSchedule}
          >
            <Text style={styles.createButtonText}>Create Schedule</Text>
            <Tick2Icon width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add/Edit Activity Modal */}
      <Modal
        transparent={true}
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Activity' : 'Add New Activity'}
            </Text>
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
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'Save'}
                  </Text>
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

export default AdminScheduleDetails;