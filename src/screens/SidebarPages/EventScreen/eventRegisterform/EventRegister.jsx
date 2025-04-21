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
import PreviousIcon from '../../../../assets/LeaveIcon/PrevBtn.svg';
import DownIcon from '../../../../assets/LeaveIcon/downline.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './EventRegistrtStyles';

const EventRegistration = ({ navigation }) => {
  // Form state
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('');
  
  // Error state
  const [errors, setErrors] = useState({
    name: false,
    grade: false,
    fromDate: false,
    toDate: false,
    eventName: false,
    location: false,
    eventType: false
  });
  
  // UI state
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  
  const eventTypes = [
    'School',
    'District',
    'State',
    'National',
    'International'
  ];
  
  const handleEventTypeSelect = (type) => {
    setEventType(type);
    setShowEventTypeDropdown(false);
    setErrors({...errors, eventType: false});
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
  
  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      grade: !grade.trim(),
      fromDate: !fromDate,
      toDate: !toDate,
      eventName: !eventName.trim(),
      location: !location.trim(),
      eventType: !eventType
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
    
    // Create event registration object
    const eventRegistration = {
      name,
      grade,
      fromDate,
      toDate,
      eventName,
      location,
      eventType
    };
    
    // Log the submitted data
    console.log('Event Registration:', eventRegistration);
    
    // You can send this data to your API here
    
    // Show confirmation
    Alert.alert(
      "Success",
      "Your event registration has been submitted.",
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
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({...errors, name: false});
              }}
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
              value={grade}
              onChangeText={(text) => {
                setGrade(text);
                setErrors({...errors, grade: false});
              }}
            />
            {errors.grade && <Text style={styles.errorText}>Grade is required</Text>}
          </View>
          
          {/* From Date */}
          <View style={styles.inputGroup}>
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
          </View>
          
          {/* To Date */}
          <View style={styles.inputGroup}>
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
          </View>
          
          {/* Event Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event name</Text>
            <TextInput 
              style={[styles.input, errors.eventName && styles.inputError]}
              placeholder="Enter event name"
              placeholderTextColor="gray"
              value={eventName}
              onChangeText={(text) => {
                setEventName(text);
                setErrors({...errors, eventName: false});
              }}
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
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setErrors({...errors, location: false});
              }}
            />
            {errors.location && <Text style={styles.errorText}>Location is required</Text>}
          </View>
          
          {/* Event Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event type</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, errors.eventType && styles.inputError]}
              onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {eventType || 'Select event type'}
              </Text>
              <DownIcon size={20} color="#777" />
            </TouchableOpacity>
            {errors.eventType && <Text style={styles.errorText}>Event type is required</Text>}
            
            {showEventTypeDropdown && (
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
            )}
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

export default EventRegistration;