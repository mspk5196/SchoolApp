import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import React, {useState} from 'react';
import styles from './Genactsty';
import Home from '../../../../assets/MentorPage/Home2.svg';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const MentorGenrealActivityRegister = ({navigation, route}) => {
  const {mentorData} = route.params;
  const [name, setName] = useState('');
  const [openActivity, setOpenActivity] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityItems, setActivityItems] = useState([
    {label: 'Fee Payment', value: 'fees'},
    {label: 'Stationary Collection', value: 'items'},
    {label: 'Others', value: 'others'},
  ]);

  const [openFeeType, setOpenFeeType] = useState(false);
  const [feeType, setFeeType] = useState(null);
  const [feeTypeItems, setFeeTypeItems] = useState([
    {label: 'Tuition', value: 'tuition'},
    {label: 'Hostel', value: 'hostel'},
    {label: 'Exam', value: 'exam'},
  ]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setnote] = useState('');
  const [other, setother] = useState('');

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
        <View style={styles.formGroup}>
          <Text style={styles.label}>Student Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Student name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View
          style={[
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

        {activity === 'fees' && (
          <>
            <View
              style={[
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
          </>
        )}
        {activity === 'items' && (
          <>
            <View
              style={[
                styles.formGroup,
                {zIndex: 999, marginBottom: openFeeType ? 150 : 10},
              ]}>
              <Text style={styles.label}>Collection</Text>
              <TextInput
                style={styles.input}
                placeholder="No of Notes"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={notes}
                onChangeText={setnote}
              />
            </View>

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
          </>
        )}
        {activity === 'others' && (
          <>
            <View
              style={[
                styles.formGroup,
                {zIndex: 999, marginBottom: openFeeType ? 150 : 10},
              ]}>
              <Text style={styles.label}>Other Type</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter activity type "
                placeholderTextColor="#999"
                value={other}
                onChangeText={setother}
              />
            </View>

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
          </>
        )}
      </ScrollView>

      <View style={styles.bottomActionRow}>
        <View style={{flex: 1}}>
          {activity && (
            <TouchableOpacity
              style={styles.otpButton}
              // onPress={() => navigation.navigate('OTPVerification')}
              >
              <Text style={styles.otpButtonText}>Submit</Text>
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
