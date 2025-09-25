import { apiFetch } from "../../../utils/apiClient";
import React, {useState, useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import PreviousIcon from '../../../assets/AdminPage/Basicimg/PrevBtn.svg';
import Addicon from '../../../assets/AdminPage/Calendar/addicon.svg';
import Calendar from '../../../assets/AdminPage/Calendar/calendar.svg';
import Holiday from      '../../../assets/AdminPage/Calendar/holiday.svg';
import ChevronDown from  '../../../assets/AdminPage/Calendar/chevron-down.svg';
import ChevronRight from '../../../assets/AdminPage/Calendar/chevron-right.svg';
import styles from './CalendarStyles';
import {API_URL} from '../../../utils/env.js';
import DateTimePicker from '@react-native-community/datetimepicker';

const AdminCalendar = ({navigation}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [viewType, setViewType] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventType, setEventType] = useState('event');
  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [holidayReason, setHolidayReason] = useState('');
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
      .then(response => response)
      .then(data => {
        if (data.success) {
          // Convert date strings to Date objects
          const formattedEvents = data.events.map(event => ({
            ...event,
            date: new Date(event.date)
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

  // Add new event
  const addEvent = () => {
    if (eventType === 'event') {
      if (!eventName || !startTime || !endTime) {
        Alert.alert('Please fill in all fields');
        return;
      }
    } else {
      if (!holidayReason) {
        Alert.alert('Please enter holiday reason');
        return;
      }
    }

    const eventData = {
      type: eventType,
      name: eventType === 'event' ? eventName : holidayReason,
      start_time: eventType === 'event' ? convertTo24HourFormat(startTime) : null,
      end_time: eventType === 'event' ? convertTo24HourFormat(endTime) : null,
      date: eventDate.toISOString().split('T')[0]
    };

    apiFetch(`/coordinator/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    })
      .then(response => response)
      .then(data => {
        if (data.success) {
          // Refresh events
          fetchEvents();
          resetForm();
          setModalVisible(false);
        } else {
          Alert.alert('Failed to add event');
        }
      })
      .catch(error => {
        console.error('Error adding event:', error);
        Alert.alert('Failed to add event');
      });
  };

  // Delete event
  const deleteEvent = (eventId) => {
    apiFetch(`/coordinator/calendar/events`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: eventId })
    })
      .then(response => response)
      .then(data => {
        if (data.success) {
          // Refresh events
          fetchEvents();
        } else {
          Alert.alert('Failed to delete event');
        }
      })
      .catch(error => {
        console.error('Error deleting event:', error);
        Alert.alert('Failed to delete event');
      });
  };

  // Reset form fields
  const resetForm = () => {
    setEventName('');
    setStartTime('');
    setEndTime('');
    setEventDate(new Date());
    setEventType('event');
    setHolidayReason('');
    setHolidayDuration('Full day');
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

  // Render the appropriate form based on event type
  const renderEventForm = () => {
    if (eventType === 'event') {
      return (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Event name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event name"
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Start time</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => openDatePicker('time', 'startTime')}>
              <Text style={startTime ? styles.inputText : styles.placeholderText}>
                {startTime || 'Select start time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>End time</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => openDatePicker('time', 'endTime')}>
              <Text style={endTime ? styles.inputText : styles.placeholderText}>
                {endTime || 'Select end time'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Event</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setHolidayDuration('Full day')}>
                <View
                  style={[
                    styles.radioCircle,
                    holidayDuration === 'Full day' && styles.radioCircleSelected,
                  ]}>
                  {holidayDuration === 'Full day' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Full day</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setHolidayDuration('Half day')}>
                <View
                  style={[
                    styles.radioCircle,
                    holidayDuration === 'Half day' && styles.radioCircleSelected,
                  ]}>
                  {holidayDuration === 'Half day' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Half day</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Holiday reason</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter holiday reason"
              value={holidayReason}
              onChangeText={setHolidayReason}
            />
          </View>
        </>
      );
    }
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
                ]}
                onLongPress={() => {
                  // Show delete option on long press
                  Alert.alert(
                    'Delete Event',
                    'Are you sure you want to delete this event?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => deleteEvent(event.id) }
                    ]
                  );
                }}>
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
                <ChevronRight
                  width={18}
                  height={18}
                  style={styles.eventArrow}
                />
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

        {/* Floating action button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}>
          <Addicon width={35} height={35} style={styles.fabIcon} />
        </TouchableOpacity>

        {/* Add Event Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <PreviousIcon width={20} height={20} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Event</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventType('event')}>
                    <View
                      style={[
                        styles.radioCircle,
                        eventType === 'event' && styles.radioCircleSelected,
                      ]}>
                      {eventType === 'event' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Event</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventType('holiday')}>
                    <View
                      style={[
                        styles.radioCircle,
                        eventType === 'holiday' && styles.radioCircleSelected,
                      ]}>
                      {eventType === 'holiday' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Holiday</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {renderEventForm()}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={[styles.textInput, styles.dateInput]}
                  onPress={() => openDatePicker('date', 'date')}>
                  <Text style={styles.inputText}>
                    {`Event date: ${formatDate(eventDate)}`}
                  </Text>
                  <Calendar width={20} height={20} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={addEvent}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Date/Time Picker */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={datePickerMode === 'date' ? eventDate : new Date()}
            mode={datePickerMode}
            is24Hour={false}
            display="default"
            onChange={onDateChange}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AdminCalendar;
