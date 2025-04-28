import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './leaveapplysty';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';


const MentorLeaveApply = ({navigation}) => {
  const [name, setName] = useState('');
  const [leave, setLeave] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Casual Leave', value: 'casual'},
    {label: 'Sick Leave', value: 'sick'},
    {label: 'Paid Leave', value: 'paid'},
  ]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [description, setDescription] = useState('');

  const [isFromDatePickerVisible, setFromDatePickerVisible] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisible] = useState(false);
  const [isFromTimePickerVisible, setFromTimePickerVisible] = useState(false);
  const [isToTimePickerVisible, setToTimePickerVisible] = useState(false);

  const handleFromConfirm = date => {
    setFromDate(date.toLocaleDateString());
    setFromDatePickerVisible(false);
  };

  const handleToConfirm = date => {
    setToDate(date.toLocaleDateString());
    setToDatePickerVisible(false);
  };

  const handleFromTimeConfirm = time => {
    setFromTime(
      time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    );
    setFromTimePickerVisible(false);
  };

  const handleToTimeConfirm = time => {
    setToTime(
      time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    );
    setToTimePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
            <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Leave Apply</Text>
      </View>
      <View style={styles.headerBorder} />

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Leave Type</Text>
          <DropDownPicker
            open={open}
            value={leave}
            items={items}
            setOpen={setOpen}
            setValue={val => setLeave(val)} // ✅ fixed
            setItems={setItems}
            placeholder="Select leave type"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>From Date</Text>
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
          </View>

          <View style={styles.halfInputContainerTime}>
            <Text style={styles.label}>From Time</Text>
            <TouchableOpacity onPress={() => setFromTimePickerVisible(true)}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={fromTime}
                editable={false}
              />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isFromTimePickerVisible}
              mode="time"
              onConfirm={handleFromTimeConfirm}
              onCancel={() => setFromTimePickerVisible(false)}
              display="spinner"
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>To Date</Text>
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
          </View>

          <View style={styles.halfInputContainerTime}>
            <Text style={styles.label}>To Time</Text>
            <TouchableOpacity onPress={() => setToTimePickerVisible(true)}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={toTime}
                editable={false}
              />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isToTimePickerVisible}
              mode="time"
              onConfirm={handleToTimeConfirm}
              onCancel={() => setToTimePickerVisible(false)}
              display="spinner"
            />
          </View>
        </View>

        <View style={styles.desinputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.optional}>(optional)</Text>
          </View>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter description"
            placeholderTextColor="#6c757d"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={()=>navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={()=>navigation.navigate("MentorLeaveHistory")}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorLeaveApply;
