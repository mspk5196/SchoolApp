import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Arrow from '../../../assets/MentorPage/arrow.svg';
import styles from './homeworksty';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { API_URL } from '@env'

const MentorHomework = ({ navigation, route }) => {
  const { mentorId } = route.params;
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([]);

  const [subject, setSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectItems, setSubjectItems] = useState([]);

  const [section, setSection] = useState('');
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionItems, setSectionItems] = useState([]);

  const [level, setLevel] = useState('');
  const [levelOpen, setLevelOpen] = useState(false);
  const [levelItems, setLevelItems] = useState([]);

  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
  }, []);

  // Fetch subjects when grade changes
  useEffect(() => {
    if (grade) {
      fetchSections(grade);
    }
  }, [grade]);
  useEffect(() => {
    if (section) {
      fetchSubjects(section)
    }
  }, [section]);

  // Fetch levels when subject changes
  useEffect(() => {
    if (grade && subject) {
      fetchLevels(grade, subject);
    }
  }, [subject]);

  const formatDate = (input) => {
    const [day, month, year] = input.split('/');
    return `${year}-${month}-${day}`; // ➜ '2025-05-16'
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getGrades`);
      const data = await response.json();
      if (data.success) {
        const formattedGrades = data.grades.map(g => ({
          label: g.grade_name,
          value: g.id.toString()
        }));
        setGradeItems(formattedGrades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getSectionSubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId
        }),
      });
      const data = await response.json();
      if (data.success) {
        const formattedSubjects = data.subjects.map(s => ({
          label: s.subject_name,
          value: s.subject_id
        }));
        setSubjectItems(formattedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSections = async (gradeId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/sections/${gradeId}`);
      const data = await response.json();
      if (data.success) {
        const formattedSections = data.sections.map(s => ({
          label: s.section_name,
          value: s.id.toString()
        }));
        setSectionItems(formattedSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchLevels = async (gradeId, subjectId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getLevels?gradeId=${gradeId}&subjectId=${subjectId}`);
      const data = await response.json();
      if (data.success) {
        const formattedLevels = data.levels.map(l => ({
          label: `Level ${l}`,
          value: l.toString()
        }));
        setLevelItems(formattedLevels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const handleConfirm = selectedDate => {
    const formatted = selectedDate.toLocaleDateString('en-GB');
    setDate(formatDate(formatted));
    setDatePickerVisible(false);
  };

  const handleAddHomework = async () => {
    if (!grade || !subject || !section || !level || !date) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Insert homework
      const response = await fetch(`${API_URL}/api/mentor/addHomework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          grade_id: grade,
          section_id: section,
          subject_id: subject,
          level,
          mentor_id: mentorId // Replace with actual mentor ID from auth
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Homework added successfully');
        navigation.goBack();
      } else {
        alert('Failed to add homework');
      }
    } catch (error) {
      console.error('Error adding homework:', error);
      alert('Failed to add homework');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Homework</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView
        contentContainerStyle={{
          // paddingBottom: 200,
          paddingHorizontal: 15,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
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
          />

          <Text style={styles.label}>Grade</Text>
          <View style={{ marginBottom: gradeOpen ? 100 : 10, zIndex: 1000 }}>
            <DropDownPicker
              open={gradeOpen}
              value={grade}
              items={gradeItems}
              setOpen={setGradeOpen}
              setValue={setGrade}
              setItems={setGradeItems}
              placeholder="Select Grade"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <Text style={styles.label}>Section</Text>
          <View style={{ marginBottom: sectionOpen ? 100 : 10, zIndex: 999 }}>
            <DropDownPicker
              open={sectionOpen}
              value={section}
              items={sectionItems}
              setOpen={setSectionOpen}
              setValue={setSection}
              setItems={setSectionItems}
              placeholder="Select Section"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <Text style={styles.label}>Subject</Text>
          <View style={{ marginBottom: subjectOpen ? 140 : 10, zIndex: 998 }}>
            <DropDownPicker
              open={subjectOpen}
              value={subject}
              items={subjectItems}
              setOpen={setSubjectOpen}
              setValue={setSubject}
              setItems={setSubjectItems}
              placeholder="Select Subject"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <Text style={styles.label}>Level</Text>
          <View style={{ marginBottom: levelOpen ? 100 : 10, zIndex: 997 }}>
            <DropDownPicker
              open={levelOpen}
              value={level}
              items={levelItems}
              setOpen={setLevelOpen}
              setValue={setLevel}
              setItems={setLevelItems}
              placeholder="Select Level"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleAddHomework}>
          <Text style={styles.confirmText}>Add Homework</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorHomework;