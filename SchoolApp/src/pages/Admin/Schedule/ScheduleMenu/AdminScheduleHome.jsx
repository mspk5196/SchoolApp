import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect } from 'react'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View, ScrollView, Pressable, SectionList, Modal, TouchableOpacity, Alert } from 'react-native'
import styles from './ScheduleHomeStyle'
import { Calendar } from 'react-native-calendars'
import PreviousIcon from '../../../../assets/AdminPage/Basicimg/PrevBtn.svg'
import HomeIcon from '../../../../assets/AdminPage/ScheduleMenu/Home.svg'
import DeleteIcon from '../../../../assets/AdminPage/ScheduleMenu/Delete.svg'
import { API_URL } from '../../../../utils/env.js'

const AdminScheduleHome = ({ navigation }) => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [activeGrade, setActiveGrade] = useState(null);
  const [grades, setGrades] = useState([]);

  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, []);
  useEffect(() => {
    if (activeGrade) {
      fetchSections();
    }
  }, [activeGrade]);

  const parseDate = (dateString) => {
    const [day, month, yearShort] = dateString.split('/');
    const year = '20' + yearShort;
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };


  const formatISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const defaultDisplayDate = formatDisplayDate(today); // dd/mm/yy
  const defaultISODate = formatISODate(today);         // yyyy-mm-dd

  const [selectedDate, setSelectedDate] = useState(defaultDisplayDate);
  const [formattedDate, setFormattedDate] = useState(defaultISODate);


  const isToday = () => {
    const today = new Date();
    const selected = parseDate(selectedDate);

    return (
      today.getDate() === selected.getDate() &&
      today.getMonth() === selected.getMonth() &&
      today.getFullYear() === selected.getFullYear()
    );
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
    // console.log(title);

    return (
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.centeredCardContent}>
          <Text style={[styles.cardText, styles.centeredText, { color: color }]}>Section {title}</Text>
        </View>
      </View>
    );
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades`);
      const data = response
      if (data.success) {
        const sortedGrades = (data.grades || []).sort((a, b) => a.id - b.id);
        setGrades(sortedGrades);

        if (data.grades.length > 0) {
          setActiveGrade(data.grades[0].id);
          fetchSections()
        }
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/grades/${activeGrade}/sections`);
      const data = response
      if (data.success) {
        // console.log(data.gradeSections);
        const formattedSections = [
          {
            title: `Section ${activeGrade}`,
            data: data.gradeSections || []
          }
        ];
        setSections(formattedSections);
        console.log(formattedSections);


      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Update the handleCancelSchedule function in AdminScheduleHome.jsx
  const handleCancelSchedule = async () => {
    try {
      const response = await apiFetch(`/admin/schedules/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          grade_id: activeGrade
        }),
      });

      const data = response

      if (data.success) {
        Alert.alert('Schedule cancelled successfully');
        // Refresh the sections data
        fetchSections();
      } else {
        Alert.alert('Failed to cancel schedule: ' + data.message);
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      Alert.alert('Error cancelling schedule');
    } finally {
      setShowCancelModal(false);
    }
  };


  return (
    <SafeAreaView flexgrow={1} flex={1} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logs</Text>
      </View>


      <View style={styles.dateContainer}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.todayIndicator} />
          <Text style={styles.todayText}>{isToday() ? `Today(${new Date(formattedDate).toLocaleDateString('en-US', { weekday: 'long' })})` : new Date(formattedDate).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
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
        </View>
        <TouchableOpacity onPress={() => setShowCancelModal(true)}>
          <DeleteIcon width={23} height={23} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.classnavgrade} nestedScrollEnabled={true}>
        {grades.map((grade, index) => (
          <Pressable
            key={grade.id}
            style={[styles.gradeselection, activeGrade === grade.id && styles.activeButton]}
            onPress={() => setActiveGrade(grade.id)}
          >
            <Text style={[styles.gradeselectiontext, activeGrade === grade.id && styles.activeText]}>{grade.grade_name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        vertical={true}
        scrollEnabled={true}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('AdminScheduleDetails', { sectionId: item.id, activeGrade })}>
            <ScrollView nestedScrollEnabled={true}>
              <Cards title={item.section_name} bgColor={item.id % 2 ? '#C9F7F5' : '#65558F12'} color={item.id % 2 ? '#0FBEB3' : '#65558F'} />
            </ScrollView>
          </Pressable>
        )}
      />

      {/* Bottom Home Button */}
      <TouchableOpacity style={styles.footer}
        onPress={() => navigation.navigate('AdminMain')}>
        <HomeIcon />
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