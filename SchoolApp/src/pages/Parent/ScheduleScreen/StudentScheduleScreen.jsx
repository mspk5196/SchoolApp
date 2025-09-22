import { apiFetch } from "../../../utils/apiClient.js";
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, TouchableOpacity, FlatList, ScrollView, Image, Modal, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import styles from './ScheduleScreenStyles';
import SubjectIcon from '../../../assets/ParentPage/ScheduleSvg/sub.svg';
import TimeIcon from '../../../assets/ParentPage/ScheduleSvg/clock.svg';
import RepeatIcon from '../../../assets/ParentPage/ScheduleSvg/repeat.svg';
import ProfileImg from '../../../assets/ParentPage/ScheduleSvg/profile.png';
import ClassDetailScreen from './Classdetails';
import { API_URL } from '../../../utils/env.js';
import Nodata from '../../../components/General/Nodata';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' or 'exam'
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  });
  const [selectedClass, setSelectedClass] = useState(null);
  const scrollViewRef = useRef(null);
  const [refresh, setRefresh] = useState(false);

  const [academicData, setAcademicData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sectionId, setSectionId] = useState(null);
  const [studentData, setStudentData] = useState({});

  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return today.getDate().toString().padStart(2, '0'); // e.g., '01', '23'
  });

  const [examData, setExamData] = useState([]);
  const [filteredExamData, setFilteredExamData] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const lastScrollOffset = useRef(0);

  // Generate days 1-31 for the day selector
  const generateDays = () => {
    const days = [];
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(i.toString().padStart(2, '0'));
    }
    return days;
  };

  const weekDays = generateDays();

  const centerSelectedDay = () => {
    const todayIndex = weekDays.findIndex(day => day === selectedDay);
    if (scrollViewRef.current && todayIndex !== -1) {
      const itemWidth = 50;
      const screenWidth = Dimensions.get('window').width;
      const scrollOffset = Math.max(
        0,
        todayIndex * itemWidth - screenWidth / 10 + itemWidth / 2
      );
      lastScrollOffset.current = scrollOffset;
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          x: scrollOffset,
          animated: true,
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (activeTab === 'academic' && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          x: lastScrollOffset.current,
          animated: false,
        });
      }, 100);
    }
  }, [activeTab]);

  useEffect(() => {
    centerSelectedDay();
  }, [selectedDay, weekDays]);

  useFocusEffect(
    React.useCallback(() => {
      centerSelectedDay();
    }, [selectedDay, weekDays])
  );

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
        // console.log('Fetched student data:', parsedData[0]);
        setSectionId(parsedData[0].section_id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    if (sectionId) {
      fetchScheduleData();
      fetchExamSchedule();
    }
  }, [selectedMonth, selectedYear, sectionId]);

  const fetchExamSchedule = async () => {
    if (!studentData.grade_id) return;
    setExamLoading(true);
    try {
      const response = await apiFetch(`/student/getExamScheduleBySection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade_id: studentData.grade_id })
      });
      const data = response
      if (data.success) {
        // Format for frontend
        const formatted = data.schedules.map(s => ({
          id: s.id,
          date: s.exam_date,
          subject: s.subject_name,
          time: `${convertTo12HourFormat(s.start_time)} - ${convertTo12HourFormat(s.end_time)}`,
          frequency: s.recurrence || 'One Time',
          color: s.color || '#4169E1'
        }));
        setExamData(formatted);
        // console.log('Fetched exam schedule:', formatted);


        // Create marked dates for calendar
        const marks = {};
        formatted.forEach(exam => {
          if (exam.date) {
            const examDay = getUTCDateString(exam.date);
            marks[examDay] = {
              marked: true,
              dotColor: exam.color || '#4169E1',
              selected: examDay === selectedDate,
              selectedColor: exam.color || '#4169E1'
            };
          }
        });

        // Ensure selected date is marked if it has exams
        if (marks[selectedDate]) {
          marks[selectedDate].selected = true;
        } else {
          marks[selectedDate] = { selected: true, selectedColor: '#4169E1' };
        }

        setMarkedDates(marks);
        filterExamDataByDate(selectedDate, formatted);
      } else {
        setExamData([]);
        setFilteredExamData([]);
      }
    } catch (err) {
      console.error('Error fetching exam schedule:', err);
      setExamData([]);
      setFilteredExamData([]);
    }
    setExamLoading(false);
  };

  const getUTCDateString = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString); // This still gives UTC
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0'); // local date
  };

  const formatUTCDate = (dateString) => {
    if (!dateString) return { day: '', month: '' };
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    return { day, month };
  };

  const filterExamDataByDate = (date, exams = examData) => {
    const normalizedDate = date.slice(0, 10); // 'YYYY-MM-DD'
    const filtered = exams.filter(
      exam => getUTCDateString(exam.date) === normalizedDate
    );
    setFilteredExamData(filtered);
  };

  const handleDayPress = (day) => {
    const dateObj = new Date(day.dateString);
    const dayOfMonth = dateObj.getDate().toString().padStart(2, '0');

    setSelectedDay(dayOfMonth);
    setSelectedDate(day.dateString);

    if (activeTab === 'exam') {
      filterExamDataByDate(day.dateString);

      // Update marked dates to show selected date
      const updatedMarks = { ...markedDates };
      Object.keys(updatedMarks).forEach(key => {
        updatedMarks[key].selected = false;
      });

      if (updatedMarks[day.dateString]) {
        updatedMarks[day.dateString].selected = true;
        updatedMarks[day.dateString].selectedColor = updatedMarks[day.dateString].dotColor || '#4169E1';
      } else {
        updatedMarks[day.dateString] = { selected: true, selectedColor: '#4169E1' };
      }

      setMarkedDates(updatedMarks);
    }
  };

  // Helper to convert 24h to 12h format
  const convertTo12HourFormat = (time24h) => {
    if (!time24h) return '';
    const [hoursStr, minutes] = time24h.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const fetchScheduleData = async () => {
    try {
      const response = await apiFetch(`/student/getDetailedStudentSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: sectionId,
          studentId: studentData.id,
          gradeId: studentData.grade_id,
          month: selectedMonth.toString().padStart(2, '0'),
          year: selectedYear,
          day: selectedDay,
          includeDetails: true, // Flag to get comprehensive details
          includeTeacherInfo: true,
          includeClassroomInfo: true,
          includeSubjectDetails: true
        })
      });
      const data = response
      if (data.success) {
        // Handle both old and new response formats
        let dayData = [];
        if (data.schedule) {
          // New detailed format
          dayData = Array.isArray(data.schedule) ? data.schedule : [];
        } else if (data.scheduleByDay) {
          // Alternative format where data comes organized by day
          const dayKey = String(Number(selectedDay));
          dayData = Array.isArray(data.scheduleByDay[dayKey]) ? data.scheduleByDay[dayKey] : [];
        }
        
        // Process and enhance the data with additional details
        const processedData = dayData.map(item => ({
          ...item,
          // Ensure all required fields are present
          id: item.id || `${item.subject_id}_${item.period_id}_${selectedDay}`,
          subject: item.subject_name || item.subject,
          time: item.formatted_time || item.time || `${convertTo12HourFormat(item.start_time)} - ${convertTo12HourFormat(item.end_time)}`,
          activity: item.activity_type || item.activity || 'Class',
          gradeId: item.grade_id || studentData.grade_id,
          sectionName: item.section_name || studentData.section_name,
          color: item.background_color || item.color || getRandomColor(),
          // Enhanced teacher information
          teacherName: item.teacher_name || item.mentor_name || 'N/A',
          teacherEmail: item.teacher_email || '',
          teacherPhone: item.teacher_phone || '',
          filePath: item.teacher_profile_path || item.filePath,
          // Enhanced subject information
          subjectCode: item.subject_code || '',
          subjectDescription: item.subject_description || '',
          // Classroom information
          classroom: item.classroom_name || item.room_number || '',
          building: item.building_name || '',
          floor: item.floor_number || '',
          // Additional academic details
          period: item.period_number || item.period,
          duration: item.duration_minutes || 45,
          attendanceRequired: item.attendance_required !== false,
          // Status information
          status: item.class_status || 'scheduled', // scheduled, cancelled, completed
          notes: item.class_notes || '',
          // Curriculum information
          chapterName: item.current_chapter || '',
          topicName: item.current_topic || '',
          learningObjectives: item.learning_objectives || [],
          // Assessment information
          hasAssignment: item.has_assignment || false,
          assignmentDueDate: item.assignment_due_date || null,
          hasQuiz: item.has_quiz || false,
          quizDate: item.quiz_date || null,
        }));
        
        setAcademicData(processedData);
        console.log('Enhanced academic data:', processedData);
        setRefresh(false);
      }
    } catch (error) {
      console.error("Error fetching detailed academic schedule:", error);
      // Fallback to original API if new one fails
      try {
        const fallbackResponse = await apiFetch(`/student/getStudentScheduleByMonth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: sectionId,
            month: selectedMonth.toString().padStart(2, '0'),
            year: selectedYear
          })
        });
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          const dayKey = String(Number(selectedDay));
          const dayData = Array.isArray(fallbackData.schedule[dayKey]) ? fallbackData.schedule[dayKey] : [];
          setAcademicData(dayData);
        }
      } catch (fallbackError) {
        console.error("Fallback API also failed:", fallbackError);
      }
      setRefresh(false);
    }
  };

  // Helper function to generate random colors for classes
  const getRandomColor = () => {
    const colors = ['#E8F5E9', '#FFEBEE', '#FFF3E0', '#F3E5F5', '#E1F5FE', '#FCE4EC'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDay]);

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return ProfileImg;
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    if (activeTab === 'academic') {
      fetchScheduleData().finally(() => setRefresh(false));
    } else {
      fetchExamSchedule().finally(() => setRefresh(false));
    }
  };

  const renderExamItem = ({ item }) => {
    const { day, month } = formatUTCDate(item.date);
    return (
      <View style={[styles.examItemContainer, { borderLeftColor: item.color }]}>
        <View style={[styles.examDateContainer]}>
          <Text style={styles.examDateText}>{day}</Text>
          <Text style={styles.examMonthText}>{month}</Text>
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
      </View>)
  };

  const renderAcademicItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedClass(item)}
      style={[styles.academicItemContainer, { backgroundColor: item.color }]}
    >
      <View style={styles.academicItemInfoContainer}>
        <View style={styles.academicItemHeader}>
          <Text style={[styles.academicItemSubject, { color: 'black' }]}>{item.subject}</Text>
          {item.subjectCode && (
            <Text style={[styles.academicItemSubjectCode, { color: '#666' }]}>({item.subjectCode})</Text>
          )}
        </View>
        
        <Text style={[styles.academicItemGrade, { color: 'black' }]}>
          Grade {item.gradeId} - Section {item.sectionName}
          {item.classroom && ` • Room ${item.classroom}`}
        </Text>
        
        <View style={styles.academicItemDetails}>
          <Text style={{
            ...styles.academicItemType, color: item.color === '#E8F5E9' ? '#4CAF50' :
              item.color === '#FFEBEE' ? '#F44336' :
                '#FF9800'
          }}>
            {item.activity}
            {/* {item.period && ` • Period ${item.period}`} */}
          </Text>
          
          {item.teacherName && item.teacherName !== 'N/A' && (
            <Text style={[styles.academicItemTeacher, { color: '#555' }]}>
              Teacher: {item.teacherName}
            </Text>
          )}
          
          {item.chapterName && (
            <Text style={[styles.academicItemChapter, { color: '#666' }]}>
              📖 {item.chapterName}
              {item.topicName && ` - ${item.topicName}`}
            </Text>
          )}
          
          <View style={styles.academicItemFlags}>
            {item.hasAssignment && (
              <Text style={[styles.academicItemFlag, { backgroundColor: '#FF9800', color: 'white' }]}>
                📝 Assignment
              </Text>
            )}
            {item.hasQuiz && (
              <Text style={[styles.academicItemFlag, { backgroundColor: '#2196F3', color: 'white' }]}>
                📊 Quiz
              </Text>
            )}
            {item.status === 'cancelled' && (
              <Text style={[styles.academicItemFlag, { backgroundColor: '#F44336', color: 'white' }]}>
                ❌ Cancelled
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.academicItemTimeContainer}>
        <Text style={[styles.academicItemTime, { color: 'black' }]}>{item.time}</Text>
        {item.duration && (
          <Text style={[styles.academicItemDuration, { color: '#666' }]}>
            {item.duration} min
          </Text>
        )}
        <Image source={getProfileImageSource(item.filePath)} style={styles.academicItemAvatar} />
      </View>
    </TouchableOpacity>
  );

  const renderDaySelector = () => (
    <ScrollView horizontal ref={scrollViewRef} showsHorizontalScrollIndicator={false} style={styles.daySelectorScrollView}>
      <View style={styles.daySelectorContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDayPress({
              dateString: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day}`
            })}
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

  if (selectedClass) {
    console.log(selectedClass);
    
    return <ClassDetailScreen
      selectedClass={selectedClass}
      studentData={studentData}
      date={selectedDate}
      setSelectedClass={setSelectedClass}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />;
  }

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
          onPress={() => {
            setActiveTab('exam');
            fetchExamSchedule();
          }}
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
              current={selectedDate}
              minDate={'2023-11-01'}
              maxDate={'2027-01-31'}
              monthFormat={'MMMM yyyy'}
              markedDates={markedDates}
              hideExtraDays={true}
              onDayPress={handleDayPress}
              onMonthChange={(month) => {
                setSelectedMonth(month.month);
                setSelectedYear(month.year);
              }}
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

          <Text style={styles.sectionHeaderText}>Exams on {selectedDate}</Text>
          <ScrollView refreshControl={
            <RefreshControl refreshing={examLoading} onRefresh={onRefresh} />
          }>
            <FlatList
              data={filteredExamData}
              renderItem={renderExamItem}
              keyExtractor={item => item.id?.toString()}
              ListEmptyComponent={<Nodata />}
              scrollEnabled={false}
            />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.academicContainer}>
          {renderDaySelector()}
          <ScrollView style={{ flex: 1 }} refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }>
            <FlatList
              data={academicData}
              renderItem={renderAcademicItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Nodata />
              }
              scrollEnabled={false}
            />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StudentScheduleScreen;