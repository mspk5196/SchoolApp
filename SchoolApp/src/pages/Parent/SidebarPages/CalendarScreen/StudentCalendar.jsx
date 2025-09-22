import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PreviousIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import Holiday from '../../../../assets/ParentPage/Calendar/holiday.svg';
import ChevronDown from '../../../../assets/ParentPage/Calendar/chevron-down.svg';
import ChevronRight from '../../../../assets/ParentPage/Calendar/chevron-right.svg';
import styles from './CalendarStyles';
import { API_URL } from '../../../../utils/env.js'
import { apiFetch } from '../../../../utils/apiClient.js';

const StudentCalendar = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [viewType, setViewType] = useState('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [holidayDuration, setHolidayDuration] = useState('Full day');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [currentDateTimeField, setCurrentDateTimeField] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  const convertTo24HourFormat = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  };

  // Fetch events from backend
  const fetchEvents = () => {
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const year = currentYear;

    apiFetch(`/coordinator/calendar/events?year=${year}&month=${month}`)
      .then(data => {
        if (data.success) {
          // Convert date strings to Date objects
          const formattedEvents = data.events.map(event => ({
            ...event,
            date: new Date(event.date),
          }));
          setEvents(formattedEvents);
        }
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });

  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days = [
      { day: 'S', isHeader: true }, { day: 'M', isHeader: true },
      { day: 'T', isHeader: true }, { day: 'W', isHeader: true },
      { day: 'T', isHeader: true }, { day: 'F', isHeader: true },
      { day: 'S', isHeader: true }
    ];

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', date: null });
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday = today.getDate() === i &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

      // Check if the day has an event or holiday
      const hasEvent = events.some(
        event => event.date.getDate() === i &&
          event.date.getMonth() === currentMonth &&
          event.date.getFullYear() === currentYear &&
          event.type === 'event'
      );

      const hasHoliday = events.some(
        event => event.date.getDate() === i &&
          event.date.getMonth() === currentMonth &&
          event.date.getFullYear() === currentYear &&
          event.type === 'holiday'
      );

      days.push({
        day: i.toString(),
        date: i,
        isSelected: selectedDate === i,
        isToday: isToday,
        hasEvent: hasEvent,
        hasHoliday: hasHoliday,
      });
    }

    return days;
  };

  // Filter events for the selected month
  const filterEvents = () => {
    let filteredEvents = events.filter(
      event => event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear
    );

    if (viewType === 'holidays') {
      filteredEvents = filteredEvents.filter(event => event.type === 'holiday');
    }

    return filteredEvents
      .sort((a, b) => a.date - b.date)
      .map(event => ({
        ...event,
        day: event.date.getDate().toString().padStart(2, '0'),
        month: monthNames[event.date.getMonth()].substring(0, 3),
      }));
  };

  // Handle date selection
  const handleDateSelect = date => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Change month
  const changeMonth = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDate(1);
    fetchEvents();
  };

  // Format date for display
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Format time for display
  const formatTime = date => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handle date/time change in picker
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (currentDateTimeField === 'date') {
        setEventDate(selectedDate);
      } else if (currentDateTimeField === 'startTime') {
        const formattedTime = formatTime(selectedDate);
        setStartTime(formattedTime);
      } else if (currentDateTimeField === 'endTime') {
        const formattedTime = formatTime(selectedDate);
        setEndTime(formattedTime);
      }
    }
  };

  // Open date picker
  const openDatePicker = (mode, field) => {
    setDatePickerMode(mode);
    setCurrentDateTimeField(field);
    setShowDatePicker(true);
  };

  // Toggle holiday view
  const toggleHolidayView = () => {
    setViewType(viewType === 'all' ? 'holidays' : 'all');
  };

  // Get month tabs for navigation
  const getMonthTabs = () => {
    const tabs = [];
    for (let i = -2; i <= 2; i++) {
      let month = currentMonth + i;
      let year = currentYear;

      if (month < 0) {
        month += 12;
        year -= 1;
      } else if (month > 11) {
        month -= 12;
        year += 1;
      }

      tabs.push({
        name: monthNames[month].substring(0, 3),
        month: month,
        year: year,
      });
    }
    return tabs;
  };

  // Update calendar when month/year changes or events update
  useEffect(() => {
    setCalendarDays(generateCalendarDays());
    setDisplayedEvents(filterEvents());
  }, [currentMonth, currentYear, selectedDate, events, viewType]);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* Navigation bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <PreviousIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTxt}>Calendar</Text>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthYearContainer}>
            <Text style={styles.monthYear}>
              {`${monthNames[currentMonth]} ${currentYear}`}
            </Text>
            <ChevronDown width={18} height={18} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.Button,
              viewType === 'holidays' && styles.activeHolidayButton,
            ]}
            onPress={toggleHolidayView}>
            <Holiday width={20} height={20} style={styles.holidayIcon} />
            <View>
              <Text
                style={[
                  styles.holidayText,
                  viewType === 'holidays' && styles.activeHolidayText,
                ]}>
                Holidays
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {viewType === 'all' && (
          <>
            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarCell,
                    item.isHeader && styles.headerCell,
                    item.isSelected && styles.selectedCell,
                    item.isToday && styles.todayCell,
                  ]}
                  onPress={() => handleDateSelect(item.date)}
                  disabled={!item.date || item.isHeader}>
                  <Text
                    style={[
                      styles.calendarCellText,
                      item.isHeader && styles.headerCellText,
                      item.isSelected && styles.selectedCellText,
                      item.isToday && styles.todayCellText,
                    ]}>
                    {item.day}
                  </Text>
                  {item.hasEvent && <View style={styles.eventDot} />}
                  {item.hasHoliday && <View style={styles.holidayDot} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Month navigation */}
            <View style={styles.monthTabs}>
              {getMonthTabs().map((tab, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthTab,
                    tab.month === currentMonth &&
                    tab.year === currentYear &&
                    styles.activeMonthTab,
                  ]}
                  onPress={() => changeMonth(tab.month, tab.year)}>
                  <Text
                    style={[
                      styles.monthTabText,
                      tab.month === currentMonth &&
                      tab.year === currentYear &&
                      styles.activeMonthTabText,
                    ]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Events list */}
        <ScrollView style={styles.eventsContainer}>
          {displayedEvents.length > 0 ? (
            displayedEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventItem,
                  event.type === 'holiday' && styles.holidayItem,
                ]}>
                <View style={styles.eventDateContainer}>
                  <Text style={styles.eventDay}>{event.day}</Text>
                  <Text style={styles.eventMonth}>{event.month}</Text>
                </View>

                <View
                  style={[
                    styles.eventMarker,
                    event.type === 'holiday' && styles.holidayMarker,
                  ]}
                />
                <View style={styles.eventDetails}>
                  <View
                    style={
                      event.type === 'holiday'
                        ? styles.holidayContainer
                        : styles.eventContainer
                    }>
                    <Text
                      style={[
                        styles.eventTitle,
                        event.type === 'holiday' && styles.holidayTitle,
                      ]}>
                      {event.name}
                    </Text>
                    <Text
                      style={[
                        styles.eventTime,
                        event.type === 'holiday' && styles.holidayTime,
                      ]}>
                      {event.type === 'holiday'
                        ? holidayDuration
                        : `${event.start_time} - ${event.end_time}`}
                    </Text>
                  </View>
                </View>
                {/* <ChevronRight
                  width={18}
                  height={18}
                  style={styles.eventArrow}
                /> */}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>
              {viewType === 'holidays'
                ? 'No holidays for this month'
                : 'No events for this month'}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default StudentCalendar;
