import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Leftarrow from '../../../assets/CoordinatorPage/Calender/leftarrow.svg';
import Holiday from '../../../assets/CoordinatorPage/Calender/holiday.svg';
import ChevronDown from '../../../assets/CoordinatorPage/Calender/chevron-down.svg';
import ChevronRight from '../../../assets/CoordinatorPage/Calender/chevron-right.svg';
// import BackIcon from '../../../assets/StudentProfileDetails/leftarrow.svg';
import BackIcon from '../../../assets/CoordinatorPage/Calender/leftarrow.svg';
import Calendar from '../../../assets/CoordinatorPage/Calender/calendar.svg';
import Addicon from '../../../assets/CoordinatorPage/Calender/addicon.svg';
import styles from './CalendarStyles';

const CoordinatorCalendar = ({navigation}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [calendarDays, setCalendarDays] = useState([]);

  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);

  const [viewType, setViewType] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventType, setEventType] = useState('Event');
  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [holidayReason, setHolidayReason] = useState('');
  const [holidayDuration, setHolidayDuration] = useState('Full day');

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [currentDateTimeField, setCurrentDateTimeField] = useState(null);

  // Month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Short month names for tabs
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

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days = [
      {day: 'S', isHeader: true},
      {day: 'M', isHeader: true},
      {day: 'T', isHeader: true},
      {day: 'W', isHeader: true},
      {day: 'T', isHeader: true},
      {day: 'F', isHeader: true},
      {day: 'S', isHeader: true},
    ];

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({day: '', date: null});
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday =
        today.getDate() === i &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

      // Check if the day has an event
      const hasEvent = events.some(
        event =>
          event.date.getDate() === i &&
          event.date.getMonth() === currentMonth &&
          event.date.getFullYear() === currentYear,
      );

      // Check if the day has a holiday
      const hasHoliday = events.some(
        event =>
          event.type === 'Holiday' &&
          event.date.getDate() === i &&
          event.date.getMonth() === currentMonth &&
          event.date.getFullYear() === currentYear,
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
      event =>
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear,
    );

    if (viewType === 'holidays') {
      filteredEvents = filteredEvents.filter(event => event.type === 'Holiday');
    }

    return filteredEvents
      .sort((a, b) => a.date - b.date)
      .map(event => ({
        ...event,
        day: event.date.getDate().toString().padStart(2, '0'),
        month: monthNames[event.date.getMonth()].substring(0, 3),
      }));
  };

  // Function to handle date selection
  const handleDateSelect = date => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Function to change month
  const changeMonth = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDate(1); // Reset selected date when changing month
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handle date change in date picker
  const onDateChange = (event, selectedDate) => {
    // Always hide the picker after selection on Android
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
    if (eventType === 'Event') {
      if (!eventName || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      const newEvent = {
        id: Date.now().toString(),
        title: eventName,
        time: `${startTime} - ${endTime}`,
        date: eventDate,
        type: 'Event',
      };

      setEvents([...events, newEvent]);
    } else {
      // For holidays
      if (!holidayReason) {
        alert('Please enter holiday reason');
        return;
      }

      const newHoliday = {
        id: Date.now().toString(),
        title: holidayReason,
        time: holidayDuration,
        date: eventDate,
        type: 'Holiday',
      };

      setEvents([...events, newHoliday]);
    }

    resetForm();
    setModalVisible(false);
  };

  // Reset form fields
  const resetForm = () => {
    setEventName('');
    setStartTime('');
    setEndTime('');
    setEventDate(new Date());
    setEventType('Event');
    setHolidayReason('');
    setHolidayDuration('Full day');
  };

  // Update calendar days when month/year or events change
  useEffect(() => {
    setCalendarDays(generateCalendarDays());
    setDisplayedEvents(filterEvents());
  }, [currentMonth, currentYear, selectedDate, events, viewType]);

  // Render the appropriate form based on event type
  const renderEventForm = () => {
    if (eventType === 'Event') {
      return (
        <>
          {/* Event Name */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Event name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event name"
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          {/* Start Time */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Start time</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => openDatePicker('time', 'startTime')}>
              <Text
                style={startTime ? styles.inputText : styles.placeholderText}>
                {startTime || 'Select start time'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Time */}
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
          {/* Event Type (Full day/Half day) */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Event</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setHolidayDuration('Full day')}>
                <View
                  style={[
                    styles.radioCircle,
                    holidayDuration === 'Full day' &&
                      styles.radioCircleSelected,
                  ]}>
                  {holidayDuration === 'Full day' && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Full day</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setHolidayDuration('Half day')}>
                <View
                  style={[
                    styles.radioCircle,
                    holidayDuration === 'Half day' &&
                      styles.radioCircleSelected,
                  ]}>
                  {holidayDuration === 'Half day' && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Half day</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Holiday Reason */}
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

  // Screen title based on current view
  const screenTitle = viewType === 'holidays' ? 'Holidays' : 'Calendar';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* Navigation bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTxt}>Calendar</Text>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthYearContainer}>
            <Text
              style={
                styles.monthYear
              }>{`${monthNames[currentMonth]} ${currentYear}`}</Text>
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
            {/* Calendar grid - only shown in 'all' view */}
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

            {/* Month navigation - only shown in 'all' view */}
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
                  event.type === 'Holiday',
                ]}>
                <View style={styles.eventDateContainer}>
                  <Text style={styles.eventDay}>{event.day}</Text>
                  <Text style={styles.eventMonth}>{event.month}</Text>
                </View>
              
                <View
                  style={[
                    styles.eventMarker,
                    event.type === 'Holiday' && styles.holidayMarker,
                  ]}
                />
                <View style={styles.eventDetails}>
                  <View
                    style={
                      event.type === 'Holiday'
                        ? styles.holidayContainer
                        : styles.eventContainer
                    }>
                    <Text
                      style={[
                        styles.eventTitle,
                        event.type === 'Holiday' && styles.holidayTitle,
                      ]}>
                      {event.title}
                    </Text>
                    <Text
                      style={[
                        styles.eventTime,
                        event.type === 'Holiday' && styles.holidayTime,
                      ]}>
                      {event.type === 'Holiday' ? event.time : event.time}
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <BackIcon width={20} height={20}  onPress={() => setModalVisible(false)}/>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Calendar</Text>
              </View>

              {/* Event Type Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventType('Event')}>
                    <View
                      style={[
                        styles.radioCircle,
                        eventType === 'Event' && styles.radioCircleSelected,
                      ]}>
                      {eventType === 'Event' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Event</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setEventType('Holiday')}>
                    <View
                      style={[
                        styles.radioCircle,
                        eventType === 'Holiday' && styles.radioCircleSelected,
                      ]}>
                      {eventType === 'Holiday' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>Holiday</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Conditional Form based on event type */}
              {renderEventForm()}

              {/* Date - common for both types */}
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

              {/* Confirm Button */}
              <TouchableOpacity style={styles.confirmButton} onPress={addEvent}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Date Time Picker */}
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

export default CoordinatorCalendar;