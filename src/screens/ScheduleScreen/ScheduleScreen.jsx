import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import styles from './ScheduleScreenStyles';
//Icon For examSchedulePage
import SubjectIcon from '../../assets/ScheduleSvg/sub.svg';
import TimeIcon from '../../assets/ScheduleSvg/clock.svg';
import RepeatIcon from '../../assets/ScheduleSvg/repeat.svg';
//Profile img for Academic Schedule page
import ProfileImg from '../../assets/ScheduleSvg/profile.png';

const ScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' or 'exam'
  const [selectedDate, setSelectedDate] = useState('2023-12-23');
  
  // Calendar marked dates with text color handling
  const markedDates = {
    '2023-12-20': { selected: true, selectedColor: '#4169E1', textColor: 'white' },
    '2023-12-23': { selected: true, selectedColor: '#FFA500', textColor: 'white' },
    '2023-12-26': { selected: true, selectedColor: '#FFA500', textColor: 'white' },
    '2023-12-28': { selected: true, selectedColor: '#FF6347', textColor: 'white' },
  };

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

  // Sample academic classes data
  const academicData = [
    {
      id: '1',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#E8F5E9'
    },
    {
      id: '2',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#E8F5E9'
    },
    {
      id: '3',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#FFEBEE'
    },
    {
      id: '4',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#FFF8E1'
    },
    {
      id: '5',
      subject: 'Mathematics',
      grade: 'Grade VI - A',
      type: 'Academic class',
      time: '09:30 - 10:30',
      color: '#FFF8E1'
    },
  ];

  // Day selector for academic schedule
  const weekDays = ['20', '21', '22', '23', '24', '25', '26'];

  // Renders an exam item
  const renderExamItem = ({ item }) => (
    <View style={[styles.examItemContainer, { borderLeftColor: item.color }]}>
      <View style={[styles.examDateContainer]}>
        <Text style={styles.examDateText}>{item.date}</Text>
        <Text style={styles.examMonthText}>{item.month}</Text>
      </View>
      <View style={styles.examInfoContainer}>
        <View style={styles.examInfoRow}>
          <SubjectIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={[styles.examInfoText, {color: 'black'}]}>{item.subject}</Text>
        </View>
        <View style={styles.examInfoRowMargin}>
          <TimeIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={{color: 'black'}}>{item.time}</Text>
        </View>
        <View style={styles.examInfoRowMargin}>
          <RepeatIcon width={18} height={18} style={styles.examInfoIcon} />
          <Text style={{color: 'black'}}>{item.frequency}</Text>
        </View>
      </View>
    </View>
  );

  // Renders an academic class item
  const renderAcademicItem = ({ item }) => (
    <View style={[styles.academicItemContainer, { backgroundColor: item.color }]}>
      <View style={styles.academicItemInfoContainer}>
        <Text style={[styles.academicItemSubject, {color: 'black'}]}>{item.subject}</Text>
        <Text style={[styles.academicItemGrade, {color: 'black'}]}>{item.grade}</Text>
        <Text style={{...styles.academicItemType, color: item.color === '#E8F5E9' ? '#4CAF50' : 
                                                    item.color === '#FFEBEE' ? '#F44336' : 
                                                    '#FF9800'}}>
          {item.type}
        </Text>
      </View>
      <View style={styles.academicItemTimeContainer}>
        <Text style={[styles.academicItemTime, {color: 'black'}]}>{item.time}</Text>
        <Image source={ProfileImg} style={styles.academicItemAvatar} />
      </View>
    </View>
  );

  // Renders the day selector for academic schedule
  const renderDaySelector = () => (
    <View style={styles.daySelectorContainer}>
      {weekDays.map((day, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => {}} 
          style={[
            styles.dayButton,
            day === '23' ? styles.activeDayButton : styles.inactiveDayButton
          ]}
        >
          <Text style={day === '23' ? styles.activeDayText : [styles.inactiveDayText, {color: 'black'}]}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, {color: 'black'}]}>Schedule</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'academic' ? styles.activeTabButton : styles.inactiveTabButton
          ]}
          onPress={() => setActiveTab('academic')}
        >
          <Text style={activeTab === 'academic' ? styles.activeTabText : [styles.inactiveTabText, {color: 'black'}]}>
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
          <Text style={activeTab === 'exam' ? styles.activeTabText : [styles.inactiveTabText, {color: 'black'}]}>
            Exam schedule
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'exam' ? (
        <ScrollView style={styles.scrollViewContent}>
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
              }}
              renderHeader={(date) => {
                // Format the date correctly using JavaScript's Date object
                const dateObj = new Date(date);
                const options = { month: 'long', year: 'numeric' };
                const monthYearStr = dateObj.toLocaleDateString('en-US', options);
                
                return (
                  <View style={styles.calendarHeader}>
                    <Text style={[styles.calendarHeaderText, {color: 'black'}]}>
                      {monthYearStr}
                    </Text>
                    
                  </View>
                );
              }}
            />
          </View>

          <Text style={[styles.sectionHeaderText, {color: 'black'}]}>
            Upcoming Exams
          </Text>

          <FlatList
            data={examData}
            renderItem={renderExamItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollViewContent}>
          {renderDaySelector()}
          
          <FlatList
            data={academicData}
            renderItem={renderAcademicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ScheduleScreen;