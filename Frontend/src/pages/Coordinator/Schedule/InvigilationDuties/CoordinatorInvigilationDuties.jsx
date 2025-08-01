import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Calendar} from 'react-native-calendars';
import Modal from 'react-native-modal';
import BackIcon from '../../../../assets/CoordinatorPage/InvigilationDuties/Back.svg';
import BookIcon from '../../../../assets/CoordinatorPage/InvigilationDuties/Book.svg';
import CalendarIcon from '../../../../assets/CoordinatorPage/InvigilationDuties/Calendar.svg';
import TimeIcon from '../../../../assets/CoordinatorPage/InvigilationDuties/Time.svg';
import OnePerson from '../../../../assets/CoordinatorPage/InvigilationDuties/oneperson.svg';
import Hat from '../../../../assets/CoordinatorPage/InvigilationDuties/hat.svg';
import Tickbox from '../../../../assets/CoordinatorPage/InvigilationDuties/tickbox.svg';
import Tick from '../../../../assets/CoordinatorPage/InvigilationDuties/tick.svg';
import Tick2 from '../../../../assets/CoordinatorPage/InvigilationDuties/tick2.svg';
import EditIcon from '../../../../assets/CoordinatorPage/InvigilationDuties/Edit.svg';
import styles from './InvigilationDutiesStyle';
import { API_URL } from '../../../../utils/env.js';
import { format, parseISO } from 'date-fns';

const CoordinatorInvigilationDuties = ({navigation, route}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentSessionIndex, setCurrentSessionIndex] = useState(null);
  const [exams, setExams] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeId, setGradeId] = useState(null);

  // Get grade_id from route params or coordinator data
  useEffect(() => {
    // You might get this from route params or from coordinator data
    const gradeId = route.params.activeGrade || 1;
    setGradeId(gradeId);
    fetchExamSchedule(gradeId);
    fetchAvailableMentors(gradeId);
  }, []);

  const fetchExamSchedule = (gradeId) => {
    setLoading(true);
    fetch(`${API_URL}/api/coordinator/getExamScheduleWithInvigilators?grade_id=${gradeId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setExams(data.exams);
          console.log("Fetched exams:", data.exams);
          
        } else {
          console.error("Failed to fetch exam schedule");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching exam schedule:", error);
        setLoading(false);
      });
  };

  const fetchAvailableMentors = (gradeId) => {
    fetch(`${API_URL}/api/coordinator/getAvailableMentorsForInvigilation?grade_id=${gradeId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setFaculties(data.mentors.map(mentor => ({
            id: mentor.id,
            name: mentor.name,
            facultyId: mentor.roll,
            specification: mentor.specification,
            subject: mentor.subject
          })));
        } else {
          console.error("Failed to fetch available mentors");
        }
      })
      .catch(error => {
        console.error("Error fetching available mentors:", error);
      });
  };

  const handleAssignFaculty = (index) => {
    setCurrentSessionIndex(index);
    setSelectedFaculties(exams[index].invigilators || []);
    setIsModalVisible(true);
  };

  const saveSelectedFaculties = () => {
    if (currentSessionIndex !== null) {
      const examId = exams[currentSessionIndex].id;
      const mentorIds = selectedFaculties;
      
      fetch(`${API_URL}/api/coordinator/assignInvigilators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: examId,
          mentor_ids: mentorIds
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update local state to reflect changes
          const updatedExams = [...exams];
          updatedExams[currentSessionIndex] = {
            ...updatedExams[currentSessionIndex],
            invigilators: mentorIds,
            invigilatorNames: mentorIds.map(id => {
              const mentor = faculties.find(f => f.id === id);
              return mentor ? mentor.name : '';
            })
          };
          setExams(updatedExams);
          setIsModalVisible(false);
        } else {
          console.error("Failed to assign invigilators");
        }
      })
      .catch(error => {
        console.error("Error assigning invigilators:", error);
      });
    }
  };

  const markedDates = exams.reduce((acc, exam) => {
      try {
        const dateObj = parseISO(exam.date);
        const dateKey = format(dateObj, 'yyyy-MM-dd');
        acc[dateKey] = { selected: true, selectedColor: exam.color };
      } catch (error) {
        console.error('Error processing date:', exam.date, error);
      }
      return acc;
    }, {});

    const convertUTCtoIST_DDMMYYYY = (utcDateStr) => {
      const utcDate = new Date(utcDateStr);
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
      const istDate = new Date(utcDate.getTime() + istOffset);
    
      const day = String(istDate.getDate()).padStart(2, '0');
      const month = String(istDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
      const year = istDate.getFullYear();
    
      return `${day}-${month}-${year}`;
    };

  if (loading) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView flexgrow={1} flex={1}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Invigilation Duties</Text>
      </View>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.calendercontainer}>
          <Calendar
            style={styles.calender}
            current={'2025-04-20'} // Set to current date
            markedDates={markedDates}
          />
        </View>

        <View>
          <Text style={styles.UpcomingExamTxt}>Upcoming Exam</Text>
        </View>

        <View>
          <FlatList
            data={exams}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            scrollEnabled={false}
            renderItem={({item, index}) => (
              <View style={[styles.card, {borderLeftColor: item.color}]}>
                <View style={styles.cardContent}>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        paddingBottom: 5,
                      }}>
                      <BookIcon
                        width={styles.BookIcon.width}
                        height={styles.BookIcon.height}
                      />
                      <Text style={styles.subject}>{item.subject}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        paddingBottom: 5,
                      }}>
                      <CalendarIcon
                        width={styles.TimeIcon.width}
                        height={styles.TimeIcon.height}
                      />
                      <Text style={styles.time}>{convertUTCtoIST_DDMMYYYY(item.date)}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        paddingBottom: 5,
                      }}>
                      <TimeIcon
                        width={styles.TimeIcon.width}
                        height={styles.TimeIcon.height}
                      />
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>

                  <View>
                    {item.invigilators && item.invigilators.length > 0 ? (
                      <View style={styles.invigilatorContainer}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.invigilatorLabel}>
                            Invigilator:
                          </Text>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleAssignFaculty(index)}>
                            <EditIcon
                              width={styles.EditIcon.width}
                              height={styles.EditIcon.height}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.invigilatorName}>
                          {faculties.find(f => f.id === item.invigilators[0])?.name || ''}
                        </Text>
                        <Text style={styles.invigilatorId}>
                          Faculty ID:{' '}
                          {faculties.find(f => f.id === item.invigilators[0])?.facultyId || ''}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.AssignBtn}
                        onPress={() => handleAssignFaculty(index)}>
                        <Text style={styles.AssignBtnTxt}>Assign</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search faculty"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <FlatList
            data={faculties.filter(faculty =>
              faculty.name.toLowerCase().includes(searchText.toLowerCase()),
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.facultyItem,
                  selectedFaculties.includes(item.id) && styles.selectedCard,
                ]}
                onPress={() => {
                  setSelectedFaculties(prevSelected =>
                    prevSelected.includes(item.id)
                      ? prevSelected.filter(id => id !== item.id)
                      : [...prevSelected, item.id],
                  );
                }}>
                <View>
                  <View style={styles.staffName}>
                    <OnePerson paddingLeft={20} />
                    <Text style={styles.facultyName}>{item.name}</Text>
                  </View>
                  <View style={styles.Hat}>
                    <Hat />
                    <Text style={styles.facultySpec}>
                      {item.specification || 'No specification'}
                    </Text>
                  </View>
                  <Text style={styles.facultyId}>
                    Faculty ID: {item.facultyId}
                  </Text>
                  <Text style={styles.facultySubject}>
                    Subject: {item.subject || 'No subject'}
                  </Text>
                </View>
                <View style={styles.checkboxContainer}>
                  {selectedFaculties.includes(item.id) ? (
                    <Tick width={30} />
                  ) : (
                    <Tickbox width={30} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.selectButton}
            onPress={saveSelectedFaculties}>
            <Text style={styles.selectButtonText}>Select Faculties </Text>
            <Tick2 width={30} height={20} />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoordinatorInvigilationDuties;
