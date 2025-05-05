import React from 'react'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View, ScrollView, Pressable, SectionList, Modal, TouchableOpacity } from 'react-native'
import styles from './ScheduleHomeStyle'
import { Calendar } from 'react-native-calendars' 
import HomeIcon from '../../../assets/ScheduleMenu/Home.svg'
import DeleteIcon from '../../../assets/ScheduleMenu/Delete.svg' 
import RoundHomeIcon from '../../../assets/MentorList/roundhome.svg' 

const AdminScheduleHome = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(1); // Default to Grade 2 as in image
  const [selectedDate, setSelectedDate] = useState('23/12/24');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [formattedDate, setFormattedDate] = useState('2024-12-23');
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const data = [
    {
      data: [
        { id: '1', title: 'Section A', bgColor: '#C9F7F5', color: '#0FBEB3' },
        { id: '2', title: 'Section B', bgColor: '#65558F12', color: '#65558F' },
        { id: '3', title: 'Section C', bgColor: '#FFF3DC', color: '#EEAA16' },
      ],
    },
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

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    const dateParts = date.dateString.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;
    
    setSelectedDate(formattedDate);
    setFormattedDate(date.dateString);
    setShowCalendarModal(false);
  };

  // Cards component for displaying sections
  const Cards = ({ title, bgColor, color }) => {
    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.centeredCardContent}>
          <Text style={[styles.cardText, styles.centeredText, { color: color }]}>{title}</Text>
        </View>
      </View>
    );
  };

  // Function to handle schedule cancellation
  const handleCancelSchedule = () => {
    // Implement your logic here
    setShowCancelModal(false);
    // You can add additional logic to update the schedule
  };

  return (
    <SafeAreaView flexgrow={1} flex={1} style={styles.container}>
      <View style={styles.Header}>
        <HomeIcon width={styles.HomeIcon.width} height={styles.HomeIcon.height} onPress={() => navigation.goBack()}/>
        <Text style={styles.HeaderTxt}>Academic Schedule</Text>
      </View>

      {/* Today date selector similar to MentorDetail */}
      <View style={styles.dateContainer}>
        <View style={styles.todayIndicator} />
        <Text style={styles.todayText}>Today</Text>
        <View style={styles.dateNavigation}>
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
        <TouchableOpacity onPress={() => setShowCancelModal(true)}>
          <DeleteIcon width={23} height={23} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavgrade} nestedScrollEnabled={true}>
        {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((grade, index) => (
          <Pressable
            key={index}
            style={[styles.gradeselection, activeGrade === index && styles.activeButton]}
            onPress={() => setActiveGrade(index)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === index && styles.activeText]}>{grade}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        vertical={true}
        scrollEnabled={true}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('ScheduleDetails', { section: item.title })}>
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.title} bgColor={item.bgColor} color={item.color} />
            </ScrollView>
          </Pressable>
        )}
      />

      {/* Bottom Home Button */}
      <TouchableOpacity style={styles.homeButtonContainer} onPress={() => navigation.navigate('Home')}>
        <RoundHomeIcon width={60} height={60}/>
      </TouchableOpacity>

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

      {/* Cancel Schedule Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <Text style={styles.modalTitle}>Cancel Schedule</Text>
            <Text style={styles.modalText}>Are you sure you want to cancel this schedule?</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCancelSchedule}
              >
                <Text style={styles.confirmButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default AdminScheduleHome;