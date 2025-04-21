import React, {useState, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import PreviousIcon from '../../../assets/LeaveIcon/PrevBtn.svg';
import Holiday from '../../../assets/Calendar/holiday.svg';
import ChevronDown from '../../../assets/Calendar/chevron-down.svg';
import ChevronRight from '../../../assets/Calendar/chevron-right.svg';
import styles from './CalendarStyles';

const Calendar = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);

  // Get the current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Months array for labels
  const months = [
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

  // Short month names for the month slider
  const shortMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Navigation function for going back
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days array
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const calendarDays = [];

    // Add empty spaces for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return calendarDays;
  };

  // Event data for the current month
  const events = [
    {date: 1, title: 'Group photo', time: '9:00 AM - 12:00 PM'},
    {date: 2, title: 'Inter-school sports meet', time: '9:00 AM - 12:00 PM'},
    {date: 13, title: 'Uniform measurement', time: '9:00 AM - 12:00 PM'},
    {date: 18, title: 'Football competition', time: '9:00 AM - 12:00 PM'},
    {date: 18, title: 'Football competition', time: '9:00 AM - 12:00 PM'},
  ];

  // Holiday data
  const holidays = [
    {date: 1, name: 'Diwali'},
    {date: 20, name: 'Krishna jayanthi'},
    {date: 25, name: 'Christmas'},
  ];

  // Days with events
  const eventDays = [6, 8, 12, 19, 25, 29, 31];

  // Handle month change
  const changeMonth = offset => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentDate(newDate);
  };

  // Handle year change
  const changeYear = offset => {
    const newDate = new Date(currentYear + offset, currentMonth, 1);
    setCurrentDate(newDate);
  };

  // Handle month selection from slider
  const selectMonth = monthIndex => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setCurrentDate(newDate);
  };

  // Toggle month/year picker
  const toggleMonthYearPicker = () => {
    setShowMonthYearPicker(!showMonthYearPicker);
  };

  // Toggle holidays view
  const toggleHolidays = () => {
    setShowHolidays(!showHolidays);
  };

  // Render individual event item
  const renderEventItem = ({item, index}) => (
    <View key={index} style={styles.eventItem}>
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateNumber}>
          {item.date < 10 ? `0${item.date}` : item.date}
        </Text>
        <Text style={styles.eventDateMonth}>{shortMonths[currentMonth]}</Text>
      </View>
      <View style={styles.eventContentContainer}>
      <View style={styles.eventBar} />
      <View style={styles.eventDetailsContainer}>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTime}>{item.time}</Text>
        </View>
        <ChevronRight width={20} height={20} style={styles.eventArrow} />
      </View>
    </View>
    </View>
  );

  // Render individual holiday item
  const renderHolidayItem = ({item, index}) => (
    <View key={index} style={styles.holidayItem}>
      <View style={styles.holidayDateContainer}>
        <Text style={styles.holidayDateNumber}>
          {item.date < 10 ? `0${item.date}` : item.date}
        </Text>
        <Text style={styles.holidayDateMonth}>{shortMonths[currentMonth]}</Text>
      </View>
      <View style={styles.holidayContentContainer}>
        <View style={styles.holidayBar} />
        <Text style={styles.holidayName}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}>
          <PreviousIcon size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      {/* Month selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthYearButton}
          onPress={toggleMonthYearPicker}>
          <Text style={styles.monthYearText}>
            {months[currentMonth]} {currentYear}
          </Text>
          <ChevronDown width={20} height={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.holidaysButton}
          onPress={toggleHolidays}>
          <Holiday
            width={20}
            height={20}
            style={showHolidays ? {color: '#2563eb'} : {color: '#666'}}
          />
          <Text
            style={[
              styles.holidaysText,
              showHolidays ? {color: '#2563eb'} : {color: '#666'},
            ]}>
            Holidays
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showMonthYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthYearPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthYearPicker(false)}>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onResponderGrant={e => e.stopPropagation()}>
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => changeYear(-1)}>
                <Text style={styles.yearSelectorArrow}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.yearSelectorText}>{currentYear}</Text>
              <TouchableOpacity onPress={() => changeYear(1)}>
                <Text style={styles.yearSelectorArrow}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.monthGrid}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    currentMonth === index && styles.selectedMonthItem,
                  ]}
                  onPress={() => {
                    selectMonth(index);
                    setShowMonthYearPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.monthItemText,
                      currentMonth === index && styles.selectedMonthItemText,
                    ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {!showHolidays ? (
        <>
          {/* Calendar grid */}
          <View style={styles.calendarContainer}>
            {/* Days of week */}
            <View style={styles.daysOfWeek}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={styles.dayOfWeekCell}>
                  <Text style={styles.dayOfWeekText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((day, index) => (
                <View key={index} style={styles.dayCell}>
                  {day && (
                    <>
                      <View
                        style={[
                          styles.dayNumberContainer,
                          day === 1 && styles.todayCell,
                        ]}>
                        <Text
                          style={[
                            styles.dayNumber,
                            day === 1 && styles.todayNumber,
                          ]}>
                          {day}
                        </Text>
                      </View>
                      {eventDays.includes(day) && (
                        <View style={styles.eventDot} />
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Month slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthSlider}>
            {shortMonths.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthTab,
                  index === currentMonth && styles.selectedMonthTab,
                ]}
                onPress={() => selectMonth(index)}>
                <Text
                  style={[
                    styles.monthTabText,
                    index === currentMonth && styles.selectedMonthTabText,
                  ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Events list (scrollable) */}
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item, index) => `event-${index}`}
            style={styles.eventsContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        // Holidays view (scrollable)
        <FlatList
          data={holidays}
          renderItem={renderHolidayItem}
          keyExtractor={(item, index) => `holiday-${index}`}
          style={styles.holidaysContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Calendar;
