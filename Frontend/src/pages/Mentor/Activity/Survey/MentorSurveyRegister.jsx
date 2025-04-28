import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './surveyfoldersty';
import Home from     '../../../../assets/MentorPage/home.svg';
import Userlogo from '../../../../assets/MentorPage/userlogo.svg'; // Add this if using a user icon
import Checkbox from '../../../../assets/MentorPage/checkbox.svg'; // Add this if using a checkbox icon
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const MentorSurveyRegister = ({navigation,route}) => {
  const {mentorData} =route.params;
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFromDatePickerVisible, setFromDatePickerVisible] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [task, setTask] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Collect Fee', value: 'fees'},
    {label: 'Feedback', value: 'fb'},
    {label: 'Others', value: 'others'},
  ]);

  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeItems, setGradeItems] = useState([
    {label: 'Grade 1', value: 'grade1'},
    {label: 'Grade 2', value: 'grade2'},
  ]);

  const [section, setSection] = useState('');
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionItems, setSectionItems] = useState([
    {label: 'A', value: 'A'},
    {label: 'B', value: 'B'},
  ]);

  const [term, setTerm] = useState('');
  const [termOpen, setTermOpen] = useState(false);
  const [termItems, setTermItems] = useState([
    {label: 'Term 1', value: 'term1'},
    {label: 'Term 2', value: 'term2'},
  ]);

  const [clarityTeaching, setClarityTeaching] = useState('');
  const [clarityMaterials, setClarityMaterials] = useState('');
  const [timeMgmt, setTimeMgmt] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [comments, setComments] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleFromConfirm = date => {
    setFromDate(date.toLocaleDateString());
    setFromDatePickerVisible(false);
  };

  const handleToConfirm = date => {
    setToDate(date.toLocaleDateString());
    setToDatePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Survey</Text>
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
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity onPress={() => setFromDatePickerVisible(true)}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={fromDate}
              editable={false}
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isFromDatePickerVisible}
            mode="date"
            onConfirm={handleFromConfirm}
            onCancel={() => setFromDatePickerVisible(false)}
            display="spinner"
          />

          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity onPress={() => setToDatePickerVisible(true)}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={toDate}
              editable={false}
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isToDatePickerVisible}
            mode="date"
            onConfirm={handleToConfirm}
            onCancel={() => setToDatePickerVisible(false)}
            display="spinner"
          />

          <Text style={styles.label}>Task</Text>
          <View style={{marginBottom: open ? 125 : 10, zIndex: 1000}}>
            <DropDownPicker
              open={open}
              value={task}
              items={items}
              setOpen={setOpen}
              setValue={setTask}
              setItems={setItems}
              placeholder="Select task"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {task === 'fees' && (
            <>
              <Text style={styles.label}>Grade</Text>
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
              <Text style={styles.label}>Section</Text>
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
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Enter description"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </>
          )}

          {task === 'fb' && (
            <>
              <Text style={styles.label}>Grade</Text>
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
              <Text style={styles.label}>Section</Text>
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
              <Text style={styles.label}>Term</Text>
              <DropDownPicker
                open={termOpen}
                value={term}
                items={termItems}
                setOpen={setTermOpen}
                setValue={setTerm}
                setItems={setTermItems}
                placeholder="Select Term"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
              <Text style={styles.label}>
                Clarity of faculty's teaching (Max: 5)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter score"
                value={clarityTeaching}
                onChangeText={setClarityTeaching}
                keyboardType="numeric"
              />
              <Text style={styles.label}>
                Clarity of materials provided (Max: 5)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter score"
                value={clarityMaterials}
                onChangeText={setClarityMaterials}
                keyboardType="numeric"
              />
              <Text style={styles.label}>
                Time management in all activities (Max: 5)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter score"
                value={timeMgmt}
                onChangeText={setTimeMgmt}
                keyboardType="numeric"
              />
              <Text style={styles.label}>
                Overall satisfaction level (Max: 5)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter score"
                value={satisfaction}
                onChangeText={setSatisfaction}
                keyboardType="numeric"
              />
              <Text style={styles.label}>General Comments</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter here"
                value={comments}
                onChangeText={setComments}
                multiline
              />
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.fixedButtonContainer}>
        {task !== '' ? (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.confirmText}>Select Students</Text>
          </TouchableOpacity>
        ) : (
          <View style={{flex: 1, marginRight: wp('2.5%')}} />
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('MentorMain',{mentorData})}>
          <Home width={28} height={28} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Students</Text>

          <View >
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

export default MentorSurveyRegister;
