import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView, 
  Alert
} from 'react-native';
import PreviousIcon from '../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg'
import DownIcon from '../../../../assets/ParentPage/LeaveIcon/downline.svg'
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './LeaveapplyStyles';

import EventBus from "../../../../utils/EventBus";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../../../../utils/env.js"; 

const StudentLeaveapply = ({ navigation }) => {

  // Form state
  const [name, setName] = useState(null);
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [roll, setRoll] = useState('');
  const [sectionId, setSectionID] = useState('')
  const [totalLeaveDays, setTotalLeave] = useState('')
  // Time state
  const [fromTime, setFromTime] = useState('22:30');
  const [toTime, setToTime] = useState('22:30');
  const [fromTimeDisplay, setFromTimeDisplay] = useState('08:45 AM')
  const [toTimeDisplay, setToTimeDisplay] = useState('04:30 PM')
  // Error state
  const [errors, setErrors] = useState({
    name: false,
    leaveType: false,
    fromDate: false,
    toDate: false,
    reason: false
  });

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set to start of today
    return date < today;
  };
  
  const isSunday = (date) => {
    return date.getDay() === 0;
  };

  const isValidLeaveTime = (time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = hour * 60 + minute;
  
    const minMinutes = 7 * 60;     // 7:00 AM
    const maxMinutes = 22 * 60;    // 10:00 PM
  
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
  };

  // UI state
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const leaveTypes = [
    'Sick Leave',
    'Leave',
    'Others'
  ];

  const calculateTotalLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set both dates to start of day for accurate comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // If same day, check if it's a Sunday
    if (start.getTime() === end.getTime()) {
      return start.getDay() === 0 ? 0 : 1;
    }
    
    let totalDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (currentDate.getDay() !== 0) { // Skip Sundays
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return totalDays;
  };

  const handleLeaveTypeSelect = (type) => {
    setLeaveType(type);
    setShowLeaveTypeDropdown(false);
    setErrors({ ...errors, leaveType: false });
  };

  // Date handlers
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      if (isPastDate(selectedDate)) {
        Alert.alert("Invalid Date", "You cannot apply leave for a past date.");
        return;
      }
  
      if (isSunday(selectedDate)) {
        Alert.alert("Invalid Date", "You cannot apply leave on Sundays.");
        return;
      }
  
      const formattedDate = formatDate(selectedDate);
      setFromDate(formattedDate);
      setErrors({ ...errors, fromDate: false });
      
      // Calculate total leave days when from date changes
      if (toDate) {
        const totalDays = calculateTotalLeaveDays(formattedDate, toDate);
        setTotalLeave(totalDays);
      }
    }
  };
  
  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      if (isPastDate(selectedDate)) {
        Alert.alert("Invalid Date", "You cannot apply leave for a past date.");
        return;
      }
  
      if (isSunday(selectedDate)) {
        Alert.alert("Invalid Date", "You cannot apply leave on Sundays.");
        return;
      }
  
      if (fromDate && selectedDate < new Date(fromDate)) {
        Alert.alert("Invalid Range", "To date cannot be before from date.");
        return;
      }
  
      const formattedDate = formatDate(selectedDate);
      setToDate(formattedDate);
      setErrors({ ...errors, toDate: false });
      
      // Calculate total leave days when to date changes
      if (fromDate) {
        const totalDays = calculateTotalLeaveDays(fromDate, formattedDate);
        setTotalLeave(totalDays);
      }
    }
  };

  // Time handlers
  const handleFromTimeChange = (event, selectedTime) => {
    setShowFromTimePicker(false);
    if (selectedTime) {
      if (!isValidLeaveTime(selectedTime)) {
        Alert.alert("Invalid Time", "Leave time must be between 7:00 AM and 10:00 AM.");
        return;
      }
      setFromTimeDisplay(formatTime(selectedTime));
      setFromTime(formatTimeForMySQL(selectedTime));
    }
  };

  const handleToTimeChange = (event, selectedTime) => {
    setShowToTimePicker(false);
    if (selectedTime) {
      if (!isValidLeaveTime(selectedTime)) {
        Alert.alert("Invalid Time", "Leave time must be between 7:00 AM and 10:00 AM.");
        return;
      }
      setToTimeDisplay(formatTime(selectedTime));
      setToTime(formatTimeForMySQL(selectedTime));
    }
  };

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Month is 0-indexed
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
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

  const formatTimeForMySQL = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = '00'; // You can customize if seconds matter
    return `${hours}:${minutes}:${seconds}`;
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
  
    if (new Date(fromDate).getDay() === 0 || new Date(toDate).getDay() === 0) {
      Alert.alert("Invalid Date", "Leave cannot be applied for Sundays.");
      return false;
    }
  
    if (new Date(fromDate) < new Date().setHours(0, 0, 0, 0) ||
        new Date(toDate) < new Date().setHours(0, 0, 0, 0)) {
      Alert.alert("Invalid Date", "Leave cannot be applied for past days.");
      return false;
    }
  
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const addLeaveDetails = async () => {
    try {
      console.log("API URL:", `${API_URL}/api/studentLeaveApply`);
      const response = await fetch(`${API_URL}/api/studentLeaveApply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll, name, sectionId, totalLeaveDays, leaveType, fromDate, toDate, fromTime, toTime, reason }),
      });

      const data = await response.json();

      if (data.success) {
        // Show confirmation
        Alert.alert(
          "Success",
          "Your leave application has been submitted.",
          [{ text: "OK" }]
        );
        navigation.goBack();
      } else {
        Alert.alert("Leave Apply Failed", "Failed to add leave details");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error applying student leave:", error);
      Alert.alert("Error", "Failed to apply student leave");
      navigation.goBack();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
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
      roll,
      sectionId,
      totalLeaveDays,
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
    addLeaveDetails();

  };

  const [selectedStudentData, setSelectedStudent] = useState([])
  const [studentData, setStudentData] = useState([])

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem("studentData");
        if (storedStudents) {
          const parsedStudents = JSON.parse(storedStudents);
          setStudentData(parsedStudents);
        }
      } catch (error) {
        console.error("Error fetching phone:", error);
      }
    };

    fetchStudent();

  }, []);

  useEffect(() => {
    const getActiveUser = async () => {
      const savedUser = await AsyncStorage.getItem("activeUser");
      if (savedUser && studentData.length > 0) {
        const active = studentData.find(student => student.name === savedUser);
        if (active) {
          setSelectedStudent(active);
          // console.log(active);
          setName(active.name);
          setRoll(active.roll);
          setSectionID(active.section_id)
          setTotalLeave(active.leave_days);
        }
      }
    };

    getActiveUser();

    EventBus.on("userToggled", getActiveUser);

    return () => {
      EventBus.off("userToggled", getActiveUser);
    };
  }, [studentData]);

  return (
    <ScrollView style={styles.container}>
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
              value={selectedStudentData.name}
              editable={false}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: false });
              }}
            />
            {errors.name && <Text style={styles.errorText}>Name is required</Text>}
          </View>

          {/* Leave Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leave type <Text style={styles.requiredStar}>*</Text></Text>
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
                setErrors({ ...errors, reason: false });
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
                <Text style={styles.timeValue}>{fromTimeDisplay}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeGroup}
                onPress={() => setShowToTimePicker(true)}
              >
                <Text style={styles.timeLabel}>To :</Text>
                <Text style={styles.timeValue}>{toTimeDisplay}</Text>
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
    </ScrollView>
  );
};

export default StudentLeaveapply;