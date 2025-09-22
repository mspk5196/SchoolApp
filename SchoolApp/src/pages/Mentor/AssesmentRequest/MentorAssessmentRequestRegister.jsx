import { apiFetch } from "../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import Checkbox from '../../../assets/MentorPage/checkbox.svg';
import Userlogo from '../../../assets/MentorPage/userlogo.svg';
import {API_URL} from '../../../utils/env.js'
import styles from './assessmentfoldersty';

const MentorAssessmentRequestRegister = ({ navigation, route }) => {
  const { mentorId } = route.params;
  
  // Form state
  const [grade, setGrade] = useState(null);
  const [gradeLabel, setGradeLabel] = useState('');
  const [isGradeModalVisible, setGradeModalVisible] = useState(false);
  const [grades, setGrades] = useState([]);
  
  const [section, setSection] = useState(null);
  const [sectionLabel, setSectionLabel] = useState('');
  const [isSectionModalVisible, setSectionModalVisible] = useState(false);
  const [sections, setSections] = useState([]);
  
  const [subject, setSubject] = useState(null);
  const [subjectLabel, setSubjectLabel] = useState('');
  const [isSubjectModalVisible, setSubjectModalVisible] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  
  const [timeSlot, setTimeSlot] = useState(null);
  const [timeSlotLabel, setTimeSlotLabel] = useState('');
  const [isTimeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isStudentModalVisible, setStudentModalVisible] = useState(false);

  // Fetch grades on mount
  useEffect(() => {
    apiFetch(`/mentor/grades`, {
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
          value: g.id,
          id: g.id
        })));
      }
    })
    .catch(error => console.error('Error fetching grades:', error));
  }, []);

  // Fetch sections when grade changes
  useEffect(() => {
    if (grade) {
      apiFetch(`/mentor/sections/${grade}`, {
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
            value: s.id,
            id: s.id
          })));
        }
      })
      .catch(error => console.error('Error fetching sections:', error));
    }
  }, [grade]);

  // Fetch subjects when section changes
  useEffect(() => {
    if (grade && section) {
      apiFetch(`/mentor/getSubjectsForGradeSection`, {
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
            value: s.id,
            id: s.id
          })));
        }
      })
      .catch(error => console.error('Error fetching subjects:', error));
    }
  }, [grade, section]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (grade && section && date) {
      apiFetch(`/mentor/getAvailableTimeSlots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeId: grade, sectionId: section, date }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTimeSlots(data.timeSlots.map((t, index) => ({
            label: `${t.start_time} - ${t.end_time}`,
            value: { start: t.start_time, end: t.end_time },
            id: index
          })));
        }
      })
      .catch(error => console.error('Error fetching time slots:', error));
    }
  }, [grade, section, date]);

  // Fetch students when section changes
  useEffect(() => {
    if (grade && section) {
      apiFetch(`/mentor/getStudentsForGradeSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeId: grade, sectionId: section }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Make sure each student has a unique ID and filter out any duplicates
          const uniqueStudents = data.students.reduce((acc, student) => {
            if (!acc.some(s => s.id === student.id)) {
              acc.push(student);
            }
            return acc;
          }, []);
          setStudents(uniqueStudents);
        }
      })
      .catch(error => console.error('Error fetching students:', error));
    }
  }, [grade, section]);

  const handleConfirm = selectedDate => {
    setDate(selectedDate.toISOString().split('T')[0]);
    setDatePickerVisible(false);
  };

  const validateDropdowns = () => {
    if (!grade) {
      Alert.alert('Validation Error', 'Please select a grade.');
      return false;
    }
    if (!section) {
      Alert.alert('Validation Error', 'Please select a section.');
      return false;
    }
    if (!subject) {
      Alert.alert('Validation Error', 'Please select a subject.');
      return false;
    }
    if (!timeSlot) {
      Alert.alert('Validation Error', 'Please select a time slot.');
      return false;
    }
    return true;
  };

  const submitAssessmentRequest = () => {
    if (!validateDropdowns() || selectedStudents.length === 0) {
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

    apiFetch(`/mentor/createAssessmentRequest`, {
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

  const handleGradeSelect = (item) => {
    setGrade(item.value);
    setGradeLabel(item.label);
    setGradeModalVisible(false);
    
    // Reset dependent fields
    setSection(null);
    setSectionLabel('');
    setSubject(null);
    setSubjectLabel('');
    setTimeSlot(null);
    setTimeSlotLabel('');
    setSelectedStudents([]);
  };

  const handleSectionSelect = (item) => {
    setSection(item.value);
    setSectionLabel(item.label);
    setSectionModalVisible(false);
    
    // Reset dependent fields
    setSubject(null);
    setSubjectLabel('');
    setTimeSlot(null);
    setTimeSlotLabel('');
    setSelectedStudents([]);
  };

  const handleSubjectSelect = (item) => {
    setSubject(item.value);
    setSubjectLabel(item.label);
    setSubjectModalVisible(false);
  };

  const handleTimeSlotSelect = (item) => {
    setTimeSlot(item.value);
    setTimeSlotLabel(item.label);
    setTimeSlotModalVisible(false);
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
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setGradeModalVisible(true)}
          >
            <Text style={gradeLabel ? styles.selectorText : styles.placeholderText}>
              {gradeLabel || "Select Grade"}
            </Text>
            <Text style={styles.selectorText}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Section</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => grade ? setSectionModalVisible(true) : Alert.alert("Error", "Please select a grade first")}
            disabled={!grade}
          >
            <Text style={[
              sectionLabel ? styles.selectorText : styles.placeholderText,
              !grade && { color: '#ccc' }
            ]}>
              {sectionLabel || "Select Section"}
            </Text>
            <Text style={[styles.selectorText, !grade && { color: '#ccc' }]}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Subject</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => section ? setSubjectModalVisible(true) : Alert.alert("Error", "Please select a section first")}
            disabled={!section}
          >
            <Text style={[
              subjectLabel ? styles.selectorText : styles.placeholderText,
              !section && { color: '#ccc' }
            ]}>
              {subjectLabel || "Select Subject"}
            </Text>
            <Text style={[styles.selectorText, !section && { color: '#ccc' }]}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={date ? styles.selectorText : styles.placeholderText}>
              {date || "Select Date"}
            </Text>
            <Text style={styles.selectorText}>📅</Text>
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
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => date ? setTimeSlotModalVisible(true) : Alert.alert("Error", "Please select a date first")}
            disabled={!date}
          >
            <Text style={[
              timeSlotLabel ? styles.selectorText : styles.placeholderText,
              !date && { color: '#ccc' }
            ]}>
              {timeSlotLabel || "Select Time Slot"}
            </Text>
            <Text style={[styles.selectorText, !date && { color: '#ccc' }]}>▼</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: isFormComplete ? '#007BFF' : '#ccc' },
          ]}
          disabled={!isFormComplete}
          onPress={() => {
            if (!validateDropdowns()) return;
            setStudentModalVisible(true);
          }}
        >
          <Text style={styles.confirmText}>Select Students</Text>
        </TouchableOpacity>
      </View>

      {/* Grade Selection Modal */}
      <Modal
        visible={isGradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.selectorModal} 
          activeOpacity={1}
          onPress={() => setGradeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Grade</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setGradeModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.listContainer}>
              <FlatList
                data={grades}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.optionItem,
                      grade === item.value && styles.selectedOption
                    ]}
                    onPress={() => handleGradeSelect(item)}
                  >
                    <Text style={[
                      styles.optionText,
                      grade === item.value && styles.selectedText
                    ]}>
                      {item.label}
                    </Text>
                    {grade === item.value && (
                      <Text style={{ color: '#007BFF', fontWeight: 'bold', fontSize: wp('4%') }}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>No grades available</Text>
                  </View>
                }
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: hp('1%') }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Section Selection Modal */}
      <Modal
        visible={isSectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.selectorModal} 
          activeOpacity={1}
          onPress={() => setSectionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Section</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSectionModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={sections}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.optionItem,
                      section === item.value && styles.selectedOption
                    ]}
                    onPress={() => handleSectionSelect(item)}
                  >
                    <Text style={[
                      styles.optionText,
                      section === item.value && styles.selectedText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        visible={isSubjectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.selectorModal} 
          activeOpacity={1}
          onPress={() => setSubjectModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSubjectModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={subjects}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.optionItem,
                      subject === item.value && styles.selectedOption
                    ]}
                    onPress={() => handleSubjectSelect(item)}
                  >
                    <Text style={[
                      styles.optionText,
                      subject === item.value && styles.selectedText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Slot Selection Modal */}
      <Modal
        visible={isTimeSlotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeSlotModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.selectorModal} 
          activeOpacity={1}
          onPress={() => setTimeSlotModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setTimeSlotModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={timeSlots}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.optionItem,
                      timeSlot && timeSlot.start === item.value.start && styles.selectedOption
                    ]}
                    onPress={() => handleTimeSlotSelect(item)}
                  >
                    <Text style={[
                      styles.optionText,
                      timeSlot && timeSlot.start === item.value.start && styles.selectedText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Student Selection Modal */}
      <Modal
        visible={isStudentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStudentModalVisible(false)}
      >
        <View style={styles.selectorModal}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Students</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setStudentModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{
                marginTop: hp('1%'),
                maxHeight: hp('50%'),
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {/* Filter out duplicate students based on student ID */}
              {students
                .filter((student, index, self) => 
                  index === self.findIndex((s) => s.id === student.id)
                )
                .map((student) => {
                  const selected = selectedStudents.some(s => s.id === student.id);
                  return (
                    <TouchableOpacity
                      key={student.id.toString()}
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
                setStudentModalVisible(false);
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