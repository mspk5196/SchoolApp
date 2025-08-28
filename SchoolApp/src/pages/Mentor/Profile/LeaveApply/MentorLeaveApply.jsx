import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './leaveapplysty';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../utils/env.js'

const MentorLeaveApply = ({ navigation, route }) => {
  const { mentorData } = route.params;

  const uniqueMentorData = mentorData.filter(
    (mentor, index, self) =>
      index === self.findIndex((m) => m.id === mentor.id)
  );

  const [name, setName] = useState(null);
  const [leaveType, setLeaveType] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Paid Leave', value: 'Paid Leave' },
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('22:30');
  const [endTime, setEndTime] = useState('22:30');
  const [fromTimeDisplay, setFromTimeDisplay] = useState('08:45 AM')
  const [toTimeDisplay, setToTimeDisplay] = useState('04:30 PM')
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalLeaveDays, setTotalLeave] = useState('')

  // Error state
  const [errors, setErrors] = useState({
    name: false,
    leaveType: false,
    startDate: false,
    endDate: false,
    reason: false
  });

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const storedRoles = await AsyncStorage.getItem('userRoles');
        if (storedRoles) {
          const parsedRoles = JSON.parse(storedRoles);
          setRoles(parsedRoles);

          // Determine if form should be shown
          if (
            parsedRoles.includes("Mentor") &&
            (parsedRoles.includes("Coordinator") || parsedRoles.includes("Admin"))
          ) {
            setShowForm(false);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    setName(uniqueMentorData[0].name)
  }, [mentorData])

  if (!showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Arrow width={wp('9%')} height={wp('9%')} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Leave Apply</Text>
        </View>
        <View style={styles.headerBorder} />

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {roles.includes("Coordinator")
              ? "Go to your Coordinator Page to apply leave"
              : "Go to your Admin Page to apply leave"}
          </Text>
        </View>
      </View>
    );
  }

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
      name: !name,
      leaveType: !leaveType,
      startDate: !startDate,
      endDate: !endDate,
      description: !description
    };

    if (new Date(startDate).getDay() === 0 || new Date(endDate).getDay() === 0) {
      Alert.alert("Invalid Date", "Leave cannot be applied for Sundays.");
      return false;
    }

    if (new Date(startDate) < new Date().setHours(0, 0, 0, 0) ||
      new Date(endDate) < new Date().setHours(0, 0, 0, 0)) {
      Alert.alert("Invalid Date", "Leave cannot be applied for past days.");
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

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

  const handleStartDateConfirm = date => {
    setStartDatePickerVisible(false);
    if (date) {
      if (isPastDate(date)) {
        Alert.alert("Invalid Date", "You cannot apply leave for a past date.");
        return;
      }

      if (isSunday(date)) {
        Alert.alert("Invalid Date", "You cannot apply leave on Sundays.");
        return;
      }

      const formattedDate = formatDate(date);
      setStartDate(formattedDate);
      setErrors({ ...errors, fromDate: false });

      // Calculate total leave days when from date changes
      if (endDate) {
        const totalDays = calculateDays(formattedDate, endDate);
        setTotalLeave(totalDays);
      }
    }
  };

  const handleEndDateConfirm = date => {
    setEndDatePickerVisible(false);
    if (date) {
      if (isPastDate(date)) {
        Alert.alert("Invalid Date", "You cannot apply leave for a past date.");
        return;
      }

      if (isSunday(date)) {
        Alert.alert("Invalid Date", "You cannot apply leave on Sundays.");
        return;
      }

      if (startDate && date < new Date(startDate)) {
        Alert.alert("Invalid Range", "To date cannot be before from date.");
        return;
      }

      const formattedDate = formatDate(date);
      setEndDate(formattedDate);
      setErrors({ ...errors, endDate: false });

      // Calculate total leave days when to date changes
      if (startDate) {
        const totalDays = calculateDays(startDate, formattedDate);
        setTotalLeave(totalDays);
        console.log(totalDays);

      }
    }
  };

  const handleStartTimeConfirm = time => {
    if (time) {
      if (!isValidLeaveTime(time)) {
        Alert.alert("Invalid Time", "Leave time must be between 7:00 AM and 10:00 AM.");
        return;
      }
      setFromTimeDisplay(formatTime(time));
      setStartTime(formatTimeForMySQL(time));
    }
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = time => {
    if (time) {
      if (!isValidLeaveTime(time)) {
        Alert.alert("Invalid Time", "Leave time must be between 7:00 AM and 10:00 AM.");
        return;
      }
      setToTimeDisplay(formatTime(time));
      setEndTime(formatTimeForMySQL(time));
    }
    setEndTimePickerVisible(false);
  };

  const calculateDays = (startDate, endDate) => {

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

  const addLeaveDetails = async () => {
    try {
      console.log("API URL:", `${API_URL}/api/mentor/submitLeaveRequest`);
      const response = await fetch(`${API_URL}/api/mentor/submitLeaveRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: uniqueMentorData[0].phone, name, totalLeaveDays, leaveType, startDate, endDate, startTime, endTime, description }),
      });

      const data = await response.json();

      if (data.success) {
        // Show confirmation
        Alert.alert(
          "Success",
          "Your leave application has been submitted.",
          [{ text: "OK" }]
        );
        navigation.navigate('MentorLeaveHistory');
      } else {
        Alert.alert("Leave Apply Failed", "Failed to add leave details");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error applying mentor leave:", error);
      Alert.alert("Error", "Failed to apply mentor leave");
      navigation.goBack();
    }
  };

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
      phone: uniqueMentorData[0].phone,
      totalLeaveDays,
      leaveType,
      startDate,
      endDate,
      description,
      startTime,
      endTime
    };

    // Log the submitted data
    console.log('Leave Application:', leaveApplication);

    // You can send this data to your API here
    addLeaveDetails();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Arrow style={{ width: '80%', height: '10%' }} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Leave Apply</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#999"
            value={uniqueMentorData[0].name}
            onChangeText={(text) => {
              setName(text);
              setErrors({ ...errors, name: false });
            }}
            editable={false}
          />
          {errors.name && <Text style={styles.errorText}>Name is required</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Leave Type *</Text>
          <DropDownPicker
            open={open}
            value={leaveType}
            items={items}
            setOpen={setOpen}
            setValue={setLeaveType}
            setItems={setItems}
            placeholder="Select leave type"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
          {errors.leaveType && <Text style={styles.errorText}>Leave type is required</Text>}
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>From Date *</Text>
            <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
              <TextInput
                style={[styles.input, errors.fromDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="grey"
                value={startDate}
                editable={false}
              />
            </TouchableOpacity>
            {errors.startDate && <Text style={styles.errorText}>From date is required</Text>}
            <DateTimePickerModal
              isVisible={isStartDatePickerVisible}
              mode="date"
              onConfirm={handleStartDateConfirm}
              onCancel={() => setStartDatePickerVisible(false)}
              minimumDate={new Date()}
            />
          </View>

          <View style={styles.halfInputContainerTime}>
            <Text style={styles.label}>From Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setStartTimePickerVisible(true)}
            >
              <Text style={styles.timeValue}>{fromTimeDisplay}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isStartTimePickerVisible}
              mode="time"
              onConfirm={handleStartTimeConfirm}
              onCancel={() => setStartTimePickerVisible(false)}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>To Date *</Text>
            <TouchableOpacity onPress={() => setEndDatePickerVisible(true)}>
              <TextInput
                style={[styles.input, errors.toDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="grey"
                value={endDate}
                editable={false}
              />
            </TouchableOpacity>
            {errors.endDate && <Text style={styles.errorText}>To date is required</Text>}
            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="date"
              onConfirm={handleEndDateConfirm}
              onCancel={() => setEndDatePickerVisible(false)}
              minimumDate={startDate ? new Date(startDate) : new Date()}
            />
          </View>

          <View style={styles.halfInputContainerTime}>
            <Text style={styles.label}>To Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setEndTimePickerVisible(true)}
            >
              <Text style={styles.timeValue}>{toTimeDisplay}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isEndTimePickerVisible}
              mode="time"
              onConfirm={handleEndTimeConfirm}
              onCancel={() => setEndTimePickerVisible(false)}
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
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.confirmText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorLeaveApply;