import { apiFetch } from "../../../../utils/apiClient.js";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import React, {useState, useEffect} from 'react';
import styles from './Genactsty';
import Home from '../../../../assets/MentorPage/Home2.svg';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {API_URL} from '../../../../utils/env.js'

const MentorGenrealActivityRegister = ({navigation, route}) => {
  const {mentorData} = route.params;
  const [name, setName] = useState('');
  const [openActivity, setOpenActivity] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityItems, setActivityItems] = useState([
    {label: 'Fee Payment', value: 'Fee Payment'},
    {label: 'Stationary Collection', value: 'Stationery Collection'},
    {label: 'Others', value: 'Other'},
  ]);

  const [openFeeType, setOpenFeeType] = useState(false);
  const [feeType, setFeeType] = useState(null);
  const [feeTypeItems, setFeeTypeItems] = useState([
    {label: 'Tuition', value: 'Tuition'},
    {label: 'Hostel', value: 'Hostel'},
    {label: 'Exam', value: 'Exam'},
  ]);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setnote] = useState('');
  const [other, setother] = useState('');
  const [students, setStudents] = useState([]);
  const [openStudent, setOpenStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch students under this mentor
    apiFetch(`/mentor/getMentorStudents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentorId: mentorData[0].id }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const studentItems = data.students.map(student => ({
          label: `${student.name} (${student.roll})`,
          value: student.id,
          roll: student.roll,
          name: student.name
        }));
        setStudents(studentItems);
      }
    })
    .catch(error => console.error('Error fetching students:', error));
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    
    const activityData = {
      student_id: selectedStudent,
      mentor_id: mentorData[0].id,
      activity_type: activity,
      fee_type: feeType,
      amount: amount,
      notes: notes,
      other_type: other,
      description: description
    };

    apiFetch(`/mentor/createGeneralActivity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })
    .then(response => response.json())
    .then(data => {
      setLoading(false);
      if (data.message) {
        alert('Activity logged successfully!');
        navigation.goBack();
      } else {
        alert(data.error || 'Failed to log activity');
      }
    })
    .catch(error => {
      setLoading(false);
      console.error('Error:', error);
      alert('Failed to submit activity');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>General Activity</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={[styles.formGroup, {zIndex: 2000}]}>
          <Text style={styles.label}>Student Name</Text>
          <DropDownPicker
            open={openStudent}
            value={selectedStudent}
            items={students}
            setOpen={setOpenStudent}
            setValue={setSelectedStudent}
            placeholder="Select Student"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            onChangeValue={(value) => {
              const student = students.find(s => s.value === value);
              if (student) setName(student.name);
            }}
          />
        </View>

        <View style={[
          styles.formGroup,
          {zIndex: 1000, marginBottom: openActivity ? 150 : 10},
        ]}>
          <Text style={styles.label}>Activity Type</Text>
          <DropDownPicker
            open={openActivity}
            value={activity}
            items={activityItems}
            setOpen={setOpenActivity}
            setValue={setActivity}
            setItems={setActivityItems}
            placeholder="Select Activity"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        {activity === 'Fee Payment' && (
          <>
            <View style={[
              styles.formGroup,
              {zIndex: 999, marginBottom: openFeeType ? 150 : 10},
            ]}>
              <Text style={styles.label}>Fee Type</Text>
              <DropDownPicker
                open={openFeeType}
                value={feeType}
                items={feeTypeItems}
                setOpen={setOpenFeeType}
                setValue={setFeeType}
                setItems={setFeeTypeItems}
                placeholder="Select Fee Type"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </>
        )}
        
        {activity === 'Stationery Collection' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>No of Notes/Items</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={notes}
              onChangeText={setnote}
            />
          </View>
        )}
        
        {activity === 'Other' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Activity Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter activity type"
              placeholderTextColor="#999"
              value={other}
              onChangeText={setother}
            />
          </View>
        )}

        {(activity === 'Fee Payment' || activity === 'Stationery Collection' || activity === 'Other') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Description <Text style={{color: 'gray'}}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, {height: 80, textAlignVertical: 'top'}]}
              placeholder="Enter description"
              placeholderTextColor="#999"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActionRow}>
        <View style={{flex: 1}}>
          {activity && (
            <TouchableOpacity
              style={styles.otpButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.otpButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('MentorMain',{mentorData})}>
          <Home width={wp('12%')} height={wp('12%')} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorGenrealActivityRegister;