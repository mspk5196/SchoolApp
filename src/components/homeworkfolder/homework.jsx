import {  View,  Text,  TextInput,  TouchableOpacity,  ScrollView,} from 'react-native';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Arrow from '../../assets/arrow.svg';
import styles from './homeworksty';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';


const Homework = ({navigation}) => {
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([
    {label: 'Grade 1', value: 'grade1'},
    {label: 'Grade 2', value: 'grade2'},
  ]);

  const [subject, setSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectItems, setSubjectItems] = useState([
    {label: 'Math', value: 'math'},
    {label: 'Science', value: 'science'},
    {label: 'English', value: 'english'},
  ]);

  const [level, setLevel] = useState('');
  const [levelOpen, setLevelOpen] = useState(false);
  const [levelItems, setLevelItems] = useState([
    {label: 'Level 1', value: 'level1'},
    {label: 'Level 2', value: 'level2'},
  ]);

  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirm = selectedDate => {
    const formatted = selectedDate.toLocaleDateString('en-GB');
    setDate(formatted);
    setDatePickerVisible(false);
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
          paddingBottom: 300,
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
          <View style={{marginBottom: gradeOpen ? 100 : 10, zIndex: 1000}}>
            <DropDownPicker
              open={gradeOpen}
              value={grade}
              items={gradeItems}
              setOpen={setGradeOpen}
              setValue={setGrade}
              setItems={setGradeItems}
              placeholder="Grade 1"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <Text style={styles.label}>Subject</Text>
          <View style={{marginBottom: subjectOpen ? 140 : 10, zIndex: 999}}>
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
          <View style={{marginBottom: levelOpen ? 100 : 10, zIndex: 998}}>
            <DropDownPicker
              open={levelOpen}
              value={level}
              items={levelItems}
              setOpen={setLevelOpen}
              setValue={setLevel}
              setItems={setLevelItems}
              placeholder="Level 1"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmText}>Add Homework</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Homework;
