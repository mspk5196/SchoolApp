import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Arrow from    '../../../assets/MentorPage/arrow.svg';
import Checkbox from '../../../assets/MentorPage/checkbox.svg';
import Userlogo from '../../../assets/MentorPage/userlogo.svg';
import styles from './assessmentfoldersty';

const MentorAssessmentRequestRegister = ({navigation}) => {
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([
    { label: 'Grade 1', value: 'grade1' },
    { label: 'Grade 2', value: 'grade2' },
  ]);

  const [section, setSection] = useState('');
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionItems, setSectionItems] = useState([
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
  ]);

  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [time, setTime] = useState('');
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeItems, setTimeItems] = useState([
    { label: '2:00 pm to 2:40 pm', value: '2:00-2:40' },
    { label: '2:40 pm to 3:20 pm', value: '2:40-3:20' },
    { label: '3:40 pm to 4:20 pm', value: '3:40-4:20' },
  ]);

  const handleConfirm = date => {
    setDate(date.toLocaleDateString());
    setDatePickerVisible(false);
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const isFormComplete = grade && section && date && time;

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
          <View style={{ marginBottom: sectionOpen ? hp('12%') : hp('1.5%'), zIndex: 999 }}>
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

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              style={styles.input}
              placeholder="Ex : 22/12/23"
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

          <Text style={styles.label}>Time</Text>
          <View style={{ marginBottom: timeOpen ? hp('15%') : hp('1.5%'), zIndex: 998 }}>
            <DropDownPicker
              open={timeOpen}
              value={time}
              items={timeItems}
              setOpen={setTimeOpen}
              setValue={setTime}
              setItems={setTimeItems}
              placeholder="Select session"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
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
          onPress={() => {
            if (isFormComplete) {
              setModalVisible(true);
            }
          }}
        >
          <Text style={styles.confirmText}>Select Students</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Students</Text>
          <View>
            <ScrollView
              style={{
                marginTop: hp('1%'),
                maxHeight: hp('55%'),
              }}
              keyboardShouldPersistTaps="handled">
              {[
                {name: 'Nithish Kumar', level: 'Level 1', color: 'green'},
                {name: 'Aishwarya', level: 'Level 1', color: 'red'},
                {name: 'Ravi', level: 'Level 1', color: 'green'},
                {name: 'Kaviya', level: 'Level 1', color: 'red'},
                {name: 'Saravanan', level: 'Level 1', color: 'green'},
                {name: 'Manju', level: 'Level 1', color: 'green'},
                {name: 'Jaya', level: 'Level 1', color: 'red'},
                {name: 'Vinoth', level: 'Level 1', color: 'green'},
                {name: 'Nandhini', level: 'Level 1', color: 'green'},
                {name: 'Dinesh', level: 'Level 1', color: 'red'},
              ].map((student, index) => {
                const selected = selectedStudents.includes(student.name);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.studentRow}
                    onPress={() => {
                      const exists = selected;
                      setSelectedStudents(prev =>
                        exists
                          ? prev.filter(s => s !== student.name)
                          : [...prev, student.name],
                      );
                    }}>
                    <View style={styles.studentInfo}>
                      <View style={{alignItems: 'center'}}>
                        <Userlogo width={wp('6.8%')} height={wp('6.8%')} />
                        <Text
                          style={[styles.bookIcon, {marginTop: hp('0.5%')}]}>
                          📘
                        </Text>
                      </View>
                      <View
                        style={{
                          marginLeft: wp('2.5%'),
                          justifyContent: 'center',
                        }}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text
                          style={[
                            styles.studentLevel,
                            {
                              color:
                                student.color === 'red' ? '#FF4D4F' : '#00B96B',
                              marginTop: hp('0.3%'),
                            },
                          ]}>
                          {student.level}
                        </Text>
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
              onPress={() => setModalVisible(false)}>
              <Text style={styles.allotButtonText}>
                Allot {selectedStudents.length} faculties ✅
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MentorAssessmentRequestRegister;
