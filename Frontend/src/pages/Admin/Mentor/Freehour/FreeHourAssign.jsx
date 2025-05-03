import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackIcon from '../../../assets/SubjectMentor/leftarrow.svg';
import styles from './FreeHourAssignStyle';
import staff from '../../../assets/SubjectMentor/staff.png';
import HomeIcon from '../../../assets/FreeHour/home.svg';

const FreeHourAssign = ({ navigation, route }) => {
  const { faculty } = route.params;
  const [description, setDescription] = useState('');
  const [activity, setActivity] = useState('');
  const [fromTime, setFromTime] = useState('10:30 PM');
  const [toTime, setToTime] = useState('10:30 PM');
  
  // Date objects for time pickers
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  
  // State for modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showIosFromModal, setShowIosFromModal] = useState(false);
  const [showIosToModal, setShowIosToModal] = useState(false);

  // Available activities
  const activities = [
    "Substitution",
    "Additional Class",
    "Lab Work"
  ];

  const handleConfirm = () => {
    // Create task object
    const task = {
      id: Date.now().toString(),
      facultyId: faculty.facultyId,
      description,
      activity,
      fromTime,
      toTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Pass task back and navigate
    navigation.navigate('Freehour', { newTask: task });
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const onFromTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowFromTimePicker(false);
    }
    
    if (selectedDate) {
      setFromDate(selectedDate);
      setFromTime(formatTime(selectedDate));
    }
  };

  const onToTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowToTimePicker(false);
    }
    
    if (selectedDate) {
      setToDate(selectedDate);
      setToTime(formatTime(selectedDate));
    }
  };

  const showFromPicker = () => {
    if (Platform.OS === 'android') {
      setShowFromTimePicker(true);
    } else {
      setShowIosFromModal(true);
    }
  };

  const showToPicker = () => {
    if (Platform.OS === 'android') {
      setShowToTimePicker(true);
    } else {
      setShowIosToModal(true);
    }
  };

  const confirmIosTime = (type) => {
    if (type === 'from') {
      setFromTime(formatTime(fromDate));
      setShowIosFromModal(false);
    } else {
      setToTime(formatTime(toDate));
      setShowIosToModal(false);
    }
  };

  const selectActivity = (selectedActivity) => {
    setActivity(selectedActivity);
    setShowActivityModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackIcon
          width={styles.BackIcon.width}
          height={styles.BackIcon.height}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Free hour</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.blueBorder} />
          <Image source={staff} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{faculty.name}</Text>
            <Text style={styles.facultyId}>Faculty ID: {faculty.facultyId}</Text>
            <Text style={styles.timeSlot}>{faculty.timeSlot}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Description <Text style={styles.optionalText}>(optional)</Text></Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          
          <Text style={styles.sectionLabel}>Activity</Text>
          <TouchableOpacity 
            style={styles.activitySelector}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={activity ? styles.activityText : styles.placeholderText}>
              {activity || "Select Activity"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>From :</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={showFromPicker}
              >
                <Text style={styles.timeText}>{fromTime}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>To :</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={showToPicker}
              >
                <Text style={styles.timeText}>{toTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <HomeIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* Activity Selection Modal */}
      <Modal
        transparent={true}
        visible={showActivityModal}
        animationType="fade"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowActivityModal(false)}
        >
          <View style={styles.activityModalContainer}>
            {activities.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.activityModalItem}
                onPress={() => selectActivity(item)}
              >
                <Text style={styles.activityModalText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Android Time Pickers */}
      {Platform.OS === 'android' && showFromTimePicker && (
        <DateTimePicker
          value={fromDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onFromTimeChange}
        />
      )}

      {Platform.OS === 'android' && showToTimePicker && (
        <DateTimePicker
          value={toDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onToTimeChange}
        />
      )}

      {/* iOS Time Picker Modals */}
      <Modal
        transparent={true}
        visible={showIosFromModal}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <Text style={styles.timeModalTitle}>Select From Time</Text>
            <DateTimePicker
              value={fromDate}
              mode="time"
              display="spinner"
              onChange={(event, date) => date && setFromDate(date)}
              style={styles.iosTimePicker}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowIosFromModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => confirmIosTime('from')}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showIosToModal}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <Text style={styles.timeModalTitle}>Select To Time</Text>
            <DateTimePicker
              value={toDate}
              mode="time"
              display="spinner"
              onChange={(event, date) => date && setToDate(date)}
              style={styles.iosTimePicker}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowIosToModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => confirmIosTime('to')}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FreeHourAssign;