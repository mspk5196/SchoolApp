import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import Checkbox from '../../../assets/MentorPage/checkbox.svg';
import Userlogo from '../../../assets/MentorPage/userlogo.svg';
import {API_URL} from '@env'
import styles from './assessmentfoldersty';

const MentorAssessmentRequestRegister = ({ navigation, route }) => {
  const { mentorId } = route.params;
  
  // Form state
  const [grade, setGrade] = useState(null);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [grades, setGrades] = useState([]);
  
  const [section, setSection] = useState(null);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sections, setSections] = useState([]);
  
  const [subject, setSubject] = useState(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  
  const [timeSlot, setTimeSlot] = useState(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Fetch grades on mount
  useEffect(() => {
    fetch(`${API_URL}/api/mentor/grades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setGrades(data.grades.map(g => ({
          label: g.grade_name,
          value: g.id
        })));
      }
    })
    .catch(error => console.error('Error fetching grades:', error));
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    if (grade) {
      fetch(`${API_URL}/api/mentor/sections/${grade}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSections(data.sections.map(s => ({
            label: s.section_name,
            value: s.id
          })));
        }
      })
      .catch(error => console.error('Error fetching sections:', error));
    }
  }, [grade]);

  // Fetch subjects when section changes
  useEffect(() => {
    if (grade && section) {
      fetch(`${API_URL}/api/mentor/getSubjectsForGradeSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeId: grade, sectionId: section }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSubjects(data.subjects.map(s => ({
            label: s.subject_name,
            value: s.id
          })));
          console.log(data.subjects);
          
        }
      })
      .catch(error => console.error('Error fetching subjects:', error));
    }
  }, [grade, section]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (grade && section && date) {
      fetch(`${API_URL}/api/mentor/getAvailableTimeSlots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeId: grade, sectionId: section, date }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTimeSlots(data.timeSlots.map(t => ({
            label: `${t.start_time} - ${t.end_time}`,
            value: { start: t.start_time, end: t.end_time }
          })));
        }
      })
      .catch(error => console.error('Error fetching time slots:', error));
    }
  }, [grade, section, date]);

  // Fetch students when section changes
  useEffect(() => {
    if (grade && section) {
      fetch(`${API_URL}/api/mentor/getStudentsForGradeSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeId: grade, sectionId: section }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStudents(data.students);
        }
      })
      .catch(error => console.error('Error fetching students:', error));
    }
  }, [grade, section]);

  const handleConfirm = selectedDate => {
    setDate(selectedDate.toISOString().split('T')[0]);
    setDatePickerVisible(false);
  };

  const submitAssessmentRequest = () => {
    if (!grade || !section || !subject || !date || !timeSlot || selectedStudents.length === 0) {
      Alert.alert('Error', 'Please fill all fields and select at least one student');
      return;
    }

    const requestData = {
      mentorId,
      gradeId: grade,
      sectionId: section,
      subjectId: subject,
      date,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      studentIds: selectedStudents.map(s => s.id),
      studentLevels: selectedStudents.map(s => s.level),
    };

    fetch(`${API_URL}/api/mentor/createAssessmentRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Alert.alert('Success', 'Assessment request created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'Failed to create assessment request');
      }
    })
    .catch(error => {
      console.error('Error creating assessment:', error);
      Alert.alert('Error', 'Failed to create assessment request');
    });
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.some(s => s.id === student.id);
      return exists 
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student];
    });
  };

  const isFormComplete = grade && section && subject && date && timeSlot;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Assessment request</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: hp('35%'),
          paddingHorizontal: wp('4%'),
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Grade</Text>
          <View style={{ marginBottom: gradeOpen ? hp('12%') : hp('1.5%'), zIndex: 1000 }}>
            <DropDownPicker
              open={gradeOpen}
              value={grade}
              items={grades}
              setOpen={setGradeOpen}
              setValue={setGrade}
              setItems={setGrades}
              placeholder="Select Grade"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <Text style={styles.label}>Section</Text>
          <View style={{ marginBottom: sectionOpen ? hp('12%') : hp('1.5%'), zIndex: 999 }}>
            <DropDownPicker
              open={sectionOpen}
              value={section}
              items={sections}
              setOpen={setSectionOpen}
              setValue={setSection}
              setItems={setSections}
              placeholder="Select Section"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              disabled={!grade}
            />
          </View>

          <Text style={styles.label}>Subject</Text>
          <View style={{ marginBottom: subjectOpen ? hp('12%') : hp('1.5%'), zIndex: 998 }}>
            <DropDownPicker
              open={subjectOpen}
              value={subject}
              items={subjects}
              setOpen={setSubjectOpen}
              setValue={setSubject}
              setItems={setSubjects}
              placeholder="Select Subject"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              disabled={!section}
            />
          </View>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              style={styles.input}
              placeholder="Select date"
              placeholderTextColor="#999"
              value={date}
              editable={false}
            />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisible(false)}
            display="spinner"
            minimumDate={new Date()}
          />

          <Text style={styles.label}>Time Slot</Text>
          <View style={{ marginBottom: timeOpen ? hp('15%') : hp('1.5%'), zIndex: 997 }}>
            <DropDownPicker
              open={timeOpen}
              value={timeSlot}
              items={timeSlots}
              setOpen={setTimeOpen}
              setValue={setTimeSlot}
              setItems={setTimeSlots}
              placeholder="Select time slot"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              disabled={!date}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: isFormComplete ? '#007BFF' : '#ccc' },
          ]}
          disabled={!isFormComplete}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.confirmText}>Select Students</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Students</Text>
          <View>
            <ScrollView
              style={{
                marginTop: hp('1%'),
                maxHeight: hp('55%'),
              }}
              keyboardShouldPersistTaps="handled"
            >
              {students.map((student, index) => {
                const selected = selectedStudents.some(s => s.id === student.id);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.studentRow}
                    onPress={() => toggleStudentSelection(student)}
                  >
                    <View style={styles.studentInfo}>
                      <View style={{alignItems: 'center'}}>
                        <Userlogo width={wp('6.8%')} height={wp('6.8%')} />
                        <Text style={[styles.bookIcon, {marginTop: hp('0.5%')}]}>
                          📘
                        </Text>
                      </View>
                      <View style={{ marginLeft: wp('2.5%'), justifyContent: 'center', gap:7 }}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentLevel}>Level {student.level}</Text>
                      </View>
                    </View>

                    <View style={styles.rightRow}>
                      {selected ? (
                        <Checkbox width={wp('6.5%')} height={wp('6.5%')} />
                      ) : (
                        <View
                          style={{
                            width: wp('6.5%'),
                            height: wp('6.5%'),
                            borderWidth: wp('0.5%'),
                            borderColor: '#ccc',
                            borderRadius: wp('1%'),
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.allotButton}
              onPress={() => {
                if (selectedStudents.length === 0) {
                  Alert.alert('Error', 'Please select at least one student');
                  return;
                }
                setModalVisible(false);
                submitAssessmentRequest();
              }}
            >
              <Text style={styles.allotButtonText}>
                Submit for {selectedStudents.length} students
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MentorAssessmentRequestRegister;