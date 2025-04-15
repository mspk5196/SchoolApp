import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Calendar} from 'react-native-calendars';
import Modal from 'react-native-modal';
import BackIcon from '../../../assets/InvigilationDuties/Back.svg';
import BookIcon from '../../../assets/InvigilationDuties/Book.svg';
import CalendarIcon from '../../../assets/InvigilationDuties/Calendar.svg';
import TimeIcon from '../../../assets/InvigilationDuties/Time.svg';
import OnePerson from '../../../assets/InvigilationDuties/oneperson.svg';
import Hat from '../../../assets/InvigilationDuties/hat.svg';
import Tickbox from '../../../assets/InvigilationDuties/tickbox.svg';
import Tick from '../../../assets/InvigilationDuties/tick.svg';
import Tick2 from '../../../assets/InvigilationDuties/tick2.svg';
import EditIcon from '../../../assets/InvigilationDuties/Edit.svg';
import styles from './InvigilationDutiesStyle';
import {useExams} from '../ExamSchedule/ExamContext'; // Import the context hook

// Sample faculty data
const faculties = Array.from({length: 10}, (_, index) => ({
  id: index + 1,
  name: `Mr. SasiKumar ${index + 1}`,
  facultyId: `20338${index + 1}`,
}));

const InvigilationDuties = ({navigation}) => {
  // State for modal visibility and faculty selection
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentSessionIndex, setCurrentSessionIndex] = useState(null);

  // Use the shared exam context
  const {sessions, updateSession} = useExams();

  // Function to handle assigning faculty to a session
  const handleAssignFaculty = sessionIndex => {
    setCurrentSessionIndex(sessionIndex);
    setSelectedFaculties(sessions[sessionIndex].invigilators || []);
    setIsModalVisible(true);
  };

  // Function to save selected faculties for a session
  const saveSelectedFaculties = () => {
    if (currentSessionIndex !== null) {
      const updatedSession = {
        ...sessions[currentSessionIndex],
        invigilators: selectedFaculties,
      };
      updateSession(currentSessionIndex, updatedSession);
      setIsModalVisible(false);
    }
  };

  // Generate marked dates for calendar
  const markedDates = sessions.reduce((acc, session) => {
    acc[session.date] = {selected: true, selectedColor: session.color};
    return acc;
  }, {});

  return (
    <SafeAreaView flexgrow={1}  flex={1}>
    
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
            current={'2025-03-14'}
            markedDates={markedDates}
          />
        </View>

        <View>
          <Text style={styles.UpcomingExamTxt}>Upcoming Exam</Text>
        </View>

        <View>
          <FlatList
            data={sessions}
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
                      <Text style={styles.time}>{item.date}</Text>
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

                  {/* Right side - either display Assign button or Invigilator info */}
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
                            {/* You'll need to add a pencil icon here */}
                            <EditIcon
                              width={styles.EditIcon.width}
                              height={styles.EditIcon.height}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.invigilatorName}>
                          {
                            faculties.find(f => f.id === item.invigilators[0])
                              ?.name
                          }
                        </Text>
                        <Text style={styles.invigilatorId}>
                          Faculty ID:{' '}
                          {
                            faculties.find(f => f.id === item.invigilators[0])
                              ?.facultyId
                          }
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

      {/* Faculty selection modal */}
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
                      Specification (M.E Tamil literature)
                    </Text>
                  </View>
                  <Text style={styles.facultyId}>
                    Faculty ID: {item.facultyId}
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

export default InvigilationDuties;
