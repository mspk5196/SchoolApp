import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import styles from './ScheduleScreenStyles';
import SubjectIcon from '../../assets/ScheduleSvg/sub.svg';
import TimeIcon from '../../assets/ScheduleSvg/clock.svg';
import RepeatIcon from '../../assets/ScheduleSvg/repeat.svg';
import ProfileImg from '../../assets/ScheduleSvg/profile.png';
import ClassDetailScreen from './Classdetails';

const ScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' or 'exam'
  const [selectedDate, setSelectedDate] = useState('2023-12-22');
  const [selectedDay, setSelectedDay] = useState('23');
  const [selectedClass, setSelectedClass] = useState(null);

  // Calendar marked dates with text color handling
  const markedDates = {
    '2023-12-20': { selected: true, selectedColor: '#4169E1', textColor: 'white' },
    '2023-12-23': { selected: true, selectedColor: '#FFA500', textColor: 'white' },
    '2023-12-26': { selected: true, selectedColor: '#FFA500', textColor: 'white' },
    '2023-12-28': { selected: true, selectedColor: '#FF6347', textColor: 'white' },
  };

  // Generate days 1-31 for the day selector
  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString().padStart(2, '0'));
    }
    return days;
  };

  const weekDays = generateDays();

  // Sample exam data
  const examData = [
    {
      id: '1',
      date: '20',
      month: 'NOV',
      subject: 'Mathematics',
      time: '9:00 AM - 12:00 PM',
      frequency: 'Every Thu',
      color: '#4169E1'
    },
    {
      id: '2',
      date: '20',
      month: 'NOV',
      subject: 'Mathematics',
      time: '9:00 AM - 12:00 PM',
      frequency: 'Every Thu',
      color: '#4169E1'
    },
    {
      id: '3',
      date: '20',
      month: 'NOV',
      subject: 'Mathematics',
      time: '9:00 AM - 12:00 PM',
      frequency: 'Every Thu',
      color: '#FFA500'
    },
  ];

  // Sample academic classes data with more details
  const academicData = [
    {
      id: '1',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#E8F5E9',
      level: 'Level 2',
      rank: '3rd',
      assessment: 'Assessment',
      highestScore: '99',
      score: '90/100',
      classAverage: '70',
      teacher: 'Ram Kumar',
      date: '23/02/25'
    },
    {
      id: '2',
      subject: 'Science',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '10:30 - 11:30',
      color: '#E8F5E9',
      level: 'Level 1',
      rank: '5th',
      assessment: 'Quiz',
      highestScore: '95',
      score: '85/100',
      classAverage: '75',
      teacher: 'Priya Sharma',
      date: '23/02/25'
    },
    {
      id: '3',
      subject: 'English',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '11:30 - 12:30',
      color: '#FFEBEE',
      level: 'Level 3',
      rank: '2nd',
      assessment: 'Test',
      highestScore: '98',
      score: '92/100',
      classAverage: '80',
      teacher: 'John Doe',
      date: '23/02/25'
    },
    {
      id: '4',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#FFF3E0',
      level: 'Level 2',
      rank: '3rd',
      assessment: 'Assessment',
      highestScore: '99',
      score: '90/100',
      classAverage: '70',
      teacher: 'Ram Kumar',
      date: '23/02/25'
    },
    {
      id: '5',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#E8F5E9',
      level: 'Level 2',
      rank: '3rd',
      assessment: 'Assessment',
      highestScore: '99',
      score: '90/100',
      classAverage: '70',
      teacher: 'Ram Kumar',
      date: '23/02/25'
    },
    {
      id: '6',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#E8F5E9',
      level: 'Level 2',
      rank: '3rd',
      assessment: 'Assessment',
      highestScore: '99',
      score: '90/100',
      classAverage: '70',
      teacher: 'Ram Kumar',
      date: '23/02/25'
    },
  ];


  const renderExamItem = ({ item }) => (
    <View style={[styles.examItemContainer, { borderLeftColor: item.color }]}>
      <View style={[styles.examDateContainer]}>
        <Text style={styles.examDateText}>{item.date}</Text>
        <Text style={styles.examMonthText}>{item.month}</Text>
      </View>
      <View style={styles.examInfoContainer}>
        <View style={styles.examInfoRow}>
          <SubjectIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={[styles.examInfoText, { color: 'black' }]}>{item.subject}</Text>
        </View>
        <View style={styles.examInfoRowMargin}>
          <TimeIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={{ color: 'black' }}>{item.time}</Text>
        </View>
        <View style={styles.examInfoRowMargin}>
          <RepeatIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={{ color: 'black' }}>{item.frequency}</Text>
        </View>
      </View>
    </View>
  );

  // Renders an academic class item
  const renderAcademicItem = ({ item }) => (

    <TouchableOpacity
      onPress={() => setSelectedClass(item)}
      style={[styles.academicItemContainer, { backgroundColor: item.color }]}
    >
      <View style={styles.academicItemInfoContainer}>
        <Text style={[styles.academicItemSubject, { color: 'black' }]}>{item.subject}</Text>
        <Text style={[styles.academicItemGrade, { color: 'black' }]}>{item.grade}</Text>
        <Text style={{
          ...styles.academicItemType, color: item.color === '#E8F5E9' ? '#4CAF50' :
            item.color === '#FFEBEE' ? '#F44336' :
              '#FF9800'
        }}>
          {item.type}
        </Text>
      </View>
      <View style={styles.academicItemTimeContainer}>
        <Text style={[styles.academicItemTime, { color: 'black' }]}>{item.time}</Text>
        <Image source={ProfileImg} style={styles.academicItemAvatar} />
      </View>
    </TouchableOpacity>

  );

  // Renders the day selector for academic schedule with proper spacing
  const renderDaySelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScrollView}>
      <View style={styles.daySelectorContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayButton,
              day === selectedDay ? styles.activeDayButton : styles.inactiveDayButton
            ]}
          >
            <Text style={day === selectedDay ? styles.activeDayText : [styles.inactiveDayText, { color: 'black' }]}>
              {parseInt(day)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );




  // If a class is selected, show the class detail screen
  if (selectedClass) {
    return <ClassDetailScreen
      selectedClass={selectedClass}
      setSelectedClass={setSelectedClass}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />;
  }

  // Otherwise show the main schedule screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Schedule</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'academic' ? styles.activeTabButton : styles.inactiveTabButton
          ]}
          onPress={() => setActiveTab('academic')}
        >
          <Text style={activeTab === 'academic' ? styles.activeTabText : [styles.inactiveTabText, { color: 'black' }]}>
            Academic schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'exam' ? styles.activeTabButton : styles.inactiveTabButton
          ]}
          onPress={() => setActiveTab('exam')}
        >
          <Text style={activeTab === 'exam' ? styles.activeTabText : [styles.inactiveTabText, { color: 'black' }]}>
            Exam schedule
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'exam' ? (
        <View style={styles.examContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={'2023-12-01'}
              minDate={'2023-11-01'}
              maxDate={'2027-01-31'}
              monthFormat={'MMMM yyyy'}
              markedDates={markedDates}
              hideExtraDays={true}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              theme={{
                calendarBackground: 'white',
                textSectionTitleColor: 'black',
                selectedDayBackgroundColor: '#4169E1',
                selectedDayTextColor: 'white',
                todayTextColor: '#4169E1',
                dayTextColor: 'black',
                textDisabledColor: '#d9e1e8',
                arrowColor: '#4169E1',
                monthTextColor: 'black',
                // Add these new properties:
                'stylesheet.calendar.main': {
                  week: {
                    marginTop: 2,
                    marginBottom: 2,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                  }
                },
                'stylesheet.day.basic': {
                  base: {
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                },
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12
              }}
              renderHeader={(date) => {
                const dateObj = new Date(date);
                const options = { month: 'long', year: 'numeric' };
                const monthYearStr = dateObj.toLocaleDateString('en-US', options);
                return (
                  <View style={styles.calendarHeader}>
                    <Text style={[styles.calendarHeaderText, { color: 'black', fontSize: 16 }]}>
                      {monthYearStr}
                    </Text>
                  </View>
                );
              }}
            />
          </View>

          <Text style={styles.sectionHeaderText}>
            Upcoming Exams
          </Text>
          <ScrollView>
            <FlatList
              data={examData}
              renderItem={renderExamItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </ScrollView>
        </View>
      ) : (
      <View style={styles.academicContainer}>
        {renderDaySelector()}
        <ScrollView style={styles.scrollViewContent}>


          <FlatList
            data={academicData}
            renderItem={renderAcademicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
      )}
    </SafeAreaView>
  );
};

export default ScheduleScreen;