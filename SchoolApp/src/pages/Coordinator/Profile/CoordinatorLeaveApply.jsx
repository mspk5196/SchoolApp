import {View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator} from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Profile/Back.svg';
import DropdownIcon from '../../../assets/CoordinatorPage/Profile/DropDown.svg';
import React, {useState, useEffect} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from './LeaveApplyStyle';
import { API_URL } from '../../../utils/env.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoordinatorLeaveApply = ({ navigation, route }) => {
  const { coordinatorData } = route.params;
  const [name, setName] = useState(coordinatorData.name);
  const [leaveType, setLeaveType] = useState('');
  const [leaveLabel, setLeaveLabel] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Casual Leave', value: 'casual'},
    {label: 'Sick Leave', value: 'sick'},
    {label: 'Paid Leave', value: 'paid'},
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('17:00:00');
  const [fromTimeDisplay, setFromTimeDisplay] = useState('09:00 AM');
  const [toTimeDisplay, setToTimeDisplay] = useState('05:00 PM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalLeaveDays, setTotalLeaveDays] = useState('');
  
  // Error state
  const [errors, setErrors] = useState({
    name: false,
    leaveType: false,
    startDate: false,
    endDate: false,
  });

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  // Format time as hh:mm AM/PM
  const formatTime = (time) => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatTimeForMySQL = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSunday = (date) => {
    return date.getDay() === 0;
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
      setErrors({ ...errors, startDate: false });

      if (endDate) {
        const totalDays = calculateDays(formattedDate, endDate);
        setTotalLeaveDays(totalDays);
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
        Alert.alert("Invalid Range", "End date cannot be before start date.");
        return;
      }

      const formattedDate = formatDate(date);
      setEndDate(formattedDate);
      setErrors({ ...errors, endDate: false });

      if (startDate) {
        const totalDays = calculateDays(startDate, formattedDate);
        setTotalLeaveDays(totalDays);
      }
    }
  };

  const handleStartTimeConfirm = time => {
    if (time) {
      setFromTimeDisplay(formatTime(time));
      setStartTime(formatTimeForMySQL(time));
    }
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = time => {
    if (time) {
      setToTimeDisplay(formatTime(time));
      setEndTime(formatTimeForMySQL(time));
    }
    setEndTimePickerVisible(false);
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start.getTime() === end.getTime()) {
      return start.getDay() === 0 ? 0 : 1;
    }

    let totalDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      if (currentDate.getDay() !== 0) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalDays;
  };

  const validateForm = () => {
    const newErrors = {
      name: !name,
      leaveType: !leaveType,
      startDate: !startDate,
      endDate: !endDate,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const submitLeaveRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coordinator/submitLeaveRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: coordinatorData.phone,
          name,
          leaveType,
          startDate,
          endDate,
          startTime,
          endTime,
          description,
          totalLeaveDays
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Success",
          "Your leave application has been submitted.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      Alert.alert("Error", "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    submitLeaveRequest();
  };

  const handleSelectItem = (item) => {
    setLeaveType(item.value);
    setLeaveLabel(item.label);
    setOpen(false);
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
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Leave Apply</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Leave Type *</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity 
              style={styles.dropdownField} 
              onPress={() => setOpen(true)}
            >
              <TextInput
                style={styles.input}
                placeholder="Select leave type"
                placeholderTextColor="#999"
                value={leaveLabel}
                editable={false}
              />
              <DropdownIcon style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>
          
          <Modal
            visible={open}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setOpen(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setOpen(false)}
            >
              <View style={styles.modalContent}>
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.value}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => handleSelectItem(item)}
                    >
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          {errors.leaveType && <Text style={styles.errorText}>Leave type is required</Text>}
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>From Date *</Text>
            <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
              <TextInput
                style={[styles.input, errors.startDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
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
            <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={fromTimeDisplay}
                editable={false}
              />
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
                style={[styles.input, errors.endDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
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
            <TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={toTimeDisplay}
                editable={false}
              />
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
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

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

export default CoordinatorLeaveApply;