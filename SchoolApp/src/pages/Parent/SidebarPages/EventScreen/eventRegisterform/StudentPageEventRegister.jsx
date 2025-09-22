import { apiFetch } from "../../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PreviousIcon from '../../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import DownIcon from '../../../../../assets/ParentPage/LeaveIcon/downline.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './EventRegistrtStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../../utils/env.js'

const StudentPageEventRegister = ({ navigation, route }) => {
  const { event } = route.params;
  // Form state
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('');

  useEffect(() => {
    setName(studentData.name);
    setGrade(studentData.grade_id);
    setFromDate(event.event_date);
    setEventName(event.event_name);
    setLocation(event.location);
    setEventType(event.event_type);
  })

  // Error state
  const [errors, setErrors] = useState({
    name: false,
    grade: false,
    fromDate: false,
    toDate: true,
    eventName: false,
    location: false,
    eventType: false
  });

  // UI state
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState([])

  const eventTypes = [
    'School',
    'District',
    'State',
    'National',
    'International'
  ];

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
        setLoading(false);
        console.log(parsedData[0]);

      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleEventTypeSelect = (type) => {
    setEventType(type);
    setShowEventTypeDropdown(false);
    setErrors({ ...errors, eventType: false });
  };

  // Date handlers
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setFromDate(formattedDate);
      setErrors({ ...errors, fromDate: false });
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setToDate(formattedDate);
      setErrors({ ...errors, toDate: false });
    }
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !name,
      grade: !grade,
      fromDate: !fromDate,
      // toDate: !toDate,
      eventName: !eventName,
      location: !location,
      eventType: !eventType
    };

    setErrors(newErrors);

    // Return true if no errors (all fields filled)
    return !Object.values(newErrors).some(error => error);
  };

  const registerEvent = async () => {
    try {
      // console.log("API URL:", `${API_URL}/api/students/event/studentEventRegistration`);
      const response = await apiFetch(`/students/event/studentEventRegistration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, studentId: studentData.student_id }),
      });

      const data = response

      if (data.success) {
        // Show confirmation
        Alert.alert(
          "Success",
          "Your registration has been submitted.",
          [{ text: "OK" }]
        );
        navigation.goBack();
      } else {
        Alert.alert("Event registration Failed", data.message);
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error registering event:", error);
      Alert.alert("Error", "Failed to register for event");
    }
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

    // Create event registration object
    const eventRegistration = {
      name,
      grade,
      fromDate,
      // toDate,
      eventName,
      location,
      eventType
    };

    // Log the submitted data
    console.log('Event Registration:', eventRegistration);

    Alert.alert(
      'Confirmation',
      "Are you sure want to register ?",
      [
        { text: 'Yes', onPress: registerEvent },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    // registerEvent();

  };


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='blue' />
      </View>
    )
  }
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
        <Text style={styles.headerTitle}>Event registration</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter name"
              placeholderTextColor="gray"
              value={studentData.name}
              editable={false}
            />
            {errors.name && <Text style={styles.errorText}>Name is required</Text>}
          </View>

          {/* Grade Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade</Text>
            <TextInput
              style={[styles.input, errors.grade && styles.inputError]}
              placeholder="Enter grade"
              placeholderTextColor="gray"
              value={studentData.grade_name.toString()}
              onChangeText={(text) => {
                setGrade(text);
                setErrors({ ...errors, grade: false });
              }}
              editable={false}
            />
            {errors.grade && <Text style={styles.errorText}>Grade is required</Text>}
          </View>

          {/* From Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            {/* <TouchableOpacity onPress={() => setShowFromDatePicker(true)}> */}
            <TextInput
              style={[styles.input, errors.fromDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="gray"
              value={formatDate(event.event_date)}
              editable={false}
              disabled
            />
            {/* </TouchableOpacity> */}
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
          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>From</Text>
            <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
              <TextInput 
                style={[styles.input, errors.fromDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="gray"
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
          </View> */}

          {/* To Date */}
          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>To</Text>
            <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
              <TextInput 
                style={[styles.input, errors.toDate && styles.inputError]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="gray"
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
          </View> */}

          {/* Event Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event name</Text>
            <TextInput
              style={[styles.input, errors.eventName && styles.inputError]}
              placeholder="Enter event name"
              placeholderTextColor="gray"
              value={event.event_name}
              onChangeText={(text) => {
                setEventName(text);
                setErrors({ ...errors, eventName: false });
              }}
              editable={false}
            />
            {errors.eventName && <Text style={styles.errorText}>Event name is required</Text>}
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="Enter location"
              placeholderTextColor="gray"
              value={event.location}
              onChangeText={(text) => {
                setLocation(text);
                setErrors({ ...errors, location: false });
              }}
              editable={false}
            />
            {errors.location && <Text style={styles.errorText}>Location is required</Text>}
          </View>

          {/* Event Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event type</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="Enter location"
              placeholderTextColor="gray"
              value={event.event_type}
              editable={false}
            />
            {errors.eventType && <Text style={styles.errorText}>Event type is required</Text>}

            {/* {showEventTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {eventTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleEventTypeSelect(type)}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )} */}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSubmit}
        >
          <Text style={styles.confirmButtonText}>Confirm Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentPageEventRegister;