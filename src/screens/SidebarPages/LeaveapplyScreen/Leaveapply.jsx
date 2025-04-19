import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PreviousIcon from '../../../assets/LeaveIcon/PrevBtn.svg'
import DownIcon from '../../../assets/LeaveIcon/downline.svg'
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './LeaveapplyStyles';

const Leaveapply = ({ navigation }) => {
  // Form state
  const [name, setName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Time state
  const [fromTime, setFromTime] = useState('10:30 PM');
  const [toTime, setToTime] = useState('10:30 PM');
  
  // Error state
  const [errors, setErrors] = useState({
    name: false,
    leaveType: false,
    fromDate: false,
    toDate: false,
    reason: false
  });
  
  // UI state
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  
  const leaveTypes = [
    'Sick Leave',
    'Leave',
    'Other'
  ];
  
  const handleLeaveTypeSelect = (type) => {
    setLeaveType(type);
    setShowLeaveTypeDropdown(false);
    setErrors({...errors, leaveType: false});
  };
  
  // Date handlers
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setFromDate(formattedDate);
      setErrors({...errors, fromDate: false});
    }
  };
  
  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setToDate(formattedDate);
      setErrors({...errors, toDate: false});
    }
  };
  
  // Time handlers
  const handleFromTimeChange = (event, selectedTime) => {
    setShowFromTimePicker(false);
    if (selectedTime) {
      const formattedTime = formatTime(selectedTime);
      setFromTime(formattedTime);
    }
  };
  
  const handleToTimeChange = (event, selectedTime) => {
    setShowToTimePicker(false);
    if (selectedTime) {
      const formattedTime = formatTime(selectedTime);
      setToTime(formattedTime);
    }
  };
  
  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Format time as hh:mm AM/PM
  const formatTime = (time) => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours}:${minutes} ${ampm}`;
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      leaveType: !leaveType,
      fromDate: !fromDate,
      toDate: !toDate,
      reason: !reason.trim()
    };
    
    setErrors(newErrors);
    
    // Return true if no errors (all fields filled)
    return !Object.values(newErrors).some(error => error);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        "Error",
        "Please fill all required fields",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Create leave application object
    const leaveApplication = {
      name,
      leaveType,
      fromDate,
      toDate,
      reason,
      fromTime,
      toTime
    };
    
    // Log the submitted data
    console.log('Leave Application:', leaveApplication);
    
    // You can send this data to your API here
    
    // Show confirmation
    Alert.alert(
      "Success",
      "Your leave application has been submitted.",
      [{ text: "OK" }]
    );
    
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <PreviousIcon size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Apply</Text>
      </View>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.formContent}>
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name </Text>
          <TextInput 
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter name"
            placeholderTextColor="black"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors({...errors, name: false});
            }}
          />
          {errors.name && <Text style={styles.errorText}>Name is required</Text>}
        </View>
        
        {/* Leave Type Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leave type </Text>
          <TouchableOpacity 
            style={[styles.dropdownButton, errors.leaveType && styles.inputError]}
            onPress={() => setShowLeaveTypeDropdown(!showLeaveTypeDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {leaveType || 'Select leave type'}
            </Text>
            <DownIcon size={20} color="#777" />
          </TouchableOpacity>
          {errors.leaveType && <Text style={styles.errorText}>Leave type is required</Text>}
          
          {showLeaveTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {leaveTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleLeaveTypeSelect(type)}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* From Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>From </Text>
          <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
            <TextInput 
              style={[styles.input, errors.fromDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="black"
              value={fromDate}
              editable={false}
            />
          </TouchableOpacity>
          {errors.fromDate && <Text style={styles.errorText}>From date is required</Text>}
          {showFromDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleFromDateChange}
            />
          )}
        </View>
        
        {/* To Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>To </Text>
          <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
            <TextInput 
              style={[styles.input, errors.toDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="black"
              value={toDate}
              editable={false}
            />
          </TouchableOpacity>
          {errors.toDate && <Text style={styles.errorText}>To date is required</Text>}
          {showToDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleToDateChange}
            />
          )}
        </View>
        
        {/* Reason */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reason </Text>
          <TextInput 
            style={[styles.input, styles.reasonInput, errors.reason && styles.inputError]}
            placeholder="Enter reason"
            placeholderTextColor="black"
            multiline={true}
            numberOfLines={4}
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              setErrors({...errors, reason: false});
            }}
          />
          {errors.reason && <Text style={styles.errorText}>Reason is required</Text>}
        </View>
        
        {/* Time Section */}
        <View style={styles.inputGroupTime}>
          <Text style={styles.label}>Time</Text>
          <View style={styles.timeContainer}>
            <TouchableOpacity 
              style={styles.timeGroup}
              onPress={() => setShowFromTimePicker(true)}
            >
              <Text style={styles.timeLabel}>From :</Text>
              <Text style={styles.timeValue}>{fromTime}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.timeGroup}
              onPress={() => setShowToTimePicker(true)}
            >
              <Text style={styles.timeLabel}>To :</Text>
              <Text style={styles.timeValue}>{toTime}</Text>
            </TouchableOpacity>
          </View>
          
          {showFromTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleFromTimeChange}
            />
          )}
          
          {showToTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleToTimeChange}
            />
          )}
        </View>
        </View>
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleSubmit}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Leaveapply;