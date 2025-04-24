import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Arrow from '../assets/arrow.svg';
import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './leaveapplycss';
const LeaveApply = () => {
  const [name, setName] = useState('');
  const [leave, setLeave] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Casual Leave', value: 'casual' },
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Paid Leave', value: 'paid' },
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

  const handleFromConfirm = (date) => {
    setFromDate(date.toLocaleDateString());
    setFromDatePickerVisible(false);
  };

  const handleToConfirm = (date) => {
    setToDate(date.toLocaleDateString());
    setToDatePickerVisible(false);
  };

  const handleFromTimeConfirm = (time) => {
    setFromTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    setFromTimePickerVisible(false);
  };

  const handleToTimeConfirm = (time) => {
    setToTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    setToTimePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Arrow width={40} height={40} />
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
            setValue={setLeave}
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
  <TouchableOpacity style={styles.cancelButton}>
    <Text style={styles.cancelText}>Cancel</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.confirmButton}>
    <Text style={styles.confirmText}>Confirm</Text>
  </TouchableOpacity>
</View>

    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//     marginTop: 40,
//   },
//   headerText: {
//     color: 'black',
//     fontSize: 21,
//     fontWeight: 'bold',
//     marginLeft: 5,
//   },
//   headerBorder: {
//     borderBottomWidth: 1.5,
//     borderBottomColor: '#ddd',
//     marginBottom: 15,
//   },
//   formContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 5,
//   },
//   input: {
//     height: 45,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#F8F9FA',
//     fontSize: 14,
//   },
//   rowContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 25,
//   },
//   halfInputContainer: {
//     width: '48%', // Adjusted to give room for time input
//   },
//   halfInputContainerTime: {
//     width: '48%', // Adjusted to give room for date input
//   },
//   timeInput: {
//     height: 45,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#F8F9FA',
//     fontSize: 14,
//   },
//   labelRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   optional: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginLeft: 5,
//     marginBottom:4
//   },
//   descriptionInput: {
//     height: 120,
//     textAlignVertical: 'top',
//     marginBottom:5
//   },
//   dropdown: {
//     borderColor: '#ddd',
//     backgroundColor: '#F8F9FA',
//   },
//   dropdownContainer: {
//     borderColor: '#ddd',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 15,
//   },
//   cancelButton: {
//     backgroundColor: '#EEF1FF',
//     paddingVertical: 12,
//     paddingHorizontal: 55,
//     borderRadius: 25,
//     marginTop:60,
//     marginLeft:20
//   },
//   confirmButton: {
//     backgroundColor: '#3557FF',
//     paddingVertical: 12,
//     paddingHorizontal: 50,
//     borderRadius: 25,
//     marginTop:60,
//     marginRight:18
//   },
//   cancelText: {
//     color: '#1E40FF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   confirmText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
  
// });

export default LeaveApply;