import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  Image,
  Alert,
  StatusBar
} from 'react-native';
import BackIcon from '../../assets/GeneralAssests/backarrow.svg';
import CalendarIcon from '../../assets/Event/Calender.svg';
import styles from './AddEventFormStyle';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';

const sampleImages = [
  { id: 1, source: require('../../assets/Event/BannerImage1.png') },
  { id: 2, source: require('../../assets/Event/BannerImage2.png') },
  { id: 3, source: require('../../assets/Event/BannerImage3.png') },
];

const AddEvent = ({ navigation }) => {
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [participantsLimit, setParticipantsLimit] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [grade, setGrade] = useState('');
  const [eventType, setEventType] = useState('');
  const [aboutEvent, setAboutEvent] = useState('');
  const [guidelines, setGuidelines] = useState('');
  
  // For date & time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // Default to current time + 2 hours
  
  // For dropdowns
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  
  // For banner image
  const [bannerImage, setBannerImage] = useState(null);
  const [showSampleImageModal, setShowSampleImageModal] = useState(false);
  
  // Options for dropdowns
  const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const eventTypeOptions = ['Inter-school', 'In-School', 'Beyond-campus'];

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios' ? true : false);
    setSelectedDate(currentDate);
    
    // Format date as DD/MM/YY
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString().substr(-2);
    setDate(`${day}/${month}/${year}`);
  };

  const formatTimeToAmPm = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return hours + ':' + minutes + ampm;
  };

  const handleStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || selectedStartTime;
    setShowStartTimePicker(Platform.OS === 'ios' ? true : false);
    setSelectedStartTime(currentTime);
    setStartTime(formatTimeToAmPm(currentTime));
  };

  const handleEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || selectedEndTime;
    setShowEndTimePicker(Platform.OS === 'ios' ? true : false);
    setSelectedEndTime(currentTime);
    setEndTime(formatTimeToAmPm(currentTime));
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      
      setBannerImage({ uri: result[0].uri });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'There was an issue selecting the image.');
      }
    }
  };

  const handleSelectSampleImage = (id) => {
    setBannerImage(id);
    setShowSampleImageModal(false);
  };

  const handleSaveEvent = () => {
    // Validate form
    if (!eventName || !location || !participantsLimit || !date || !grade || !eventType) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Ensure there's a default banner image to prevent null warnings
    let finalBannerImage = bannerImage;
    if (!finalBannerImage) {
      // Default to the first sample image if none selected
      finalBannerImage = 1;
    }

    // Create event object with time information
    const newEvent = {
      eventName,
      location,
      participantsLimit,
      date,
      startTime: startTime || '9:00AM', // Default time if not provided
      endTime: endTime || '5:00PM',     // Default time if not provided
      grade,
      eventType,
      aboutEvent,
      guidelines,
      bannerImage: finalBannerImage
    };

    // Navigate back to Events screen with the new event data
    navigation.navigate('Event', { newEvent });
  };

  const renderGradeDropdown = () => {
    if (!showGradeDropdown) return null;
    
    return (
      <Modal
        visible={showGradeDropdown}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          onPress={() => setShowGradeDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={gradeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGrade(item);
                    setShowGradeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderEventTypeDropdown = () => {
    if (!showEventTypeDropdown) return null;
    
    return (
      <Modal
        visible={showEventTypeDropdown}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          onPress={() => setShowEventTypeDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={eventTypeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setEventType(item);
                    setShowEventTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderSampleImageModal = () => {
    return (
      <Modal
        visible={showSampleImageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.sampleImageModalContainer}>
          <View style={styles.sampleImageModalContent}>
            <Text style={styles.sampleImageModalTitle}>Select Banner Image</Text>
            
            <FlatList
              data={sampleImages}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sampleImageItem}
                  onPress={() => handleSelectSampleImage(item.id)}
                >
                  <Image source={item.source} style={styles.sampleImage} />
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSampleImageModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={19} height={17} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Event</Text>
      </View>
      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event name</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Chess Competition"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : School campus"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Participants Limit</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : 100"
            value={participantsLimit}
            onChangeText={setParticipantsLimit}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Ex : 22/10/23"
              value={date}
              editable={false}
            />
            <CalendarIcon width={20} height={20} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        
        {/* Start Time Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Ex : 9:00AM"
              value={startTime}
              editable={false}
            />
            <Text style={styles.timeIcon}>🕒</Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={selectedStartTime}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}
        </View>
        
        {/* End Time Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Ex : 5:00PM"
              value={endTime}
              editable={false}
            />
            <Text style={styles.timeIcon}>🕒</Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={selectedEndTime}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Grade</Text>
          <TouchableOpacity 
            style={styles.input}
            onPress={() => setShowGradeDropdown(true)}
          >
            <Text style={grade ? styles.dropdownText : styles.placeholderText}>
              {grade || "Select grade"}
            </Text>
          </TouchableOpacity>
          {renderGradeDropdown()}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event type</Text>
          <TouchableOpacity 
            style={[styles.input, styles.dropdownInput]}
            onPress={() => setShowEventTypeDropdown(true)}
          >
            <Text style={eventType ? styles.dropdownText : styles.placeholderText}>
              {eventType || "Select Event type"}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {renderEventTypeDropdown()}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>About event</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter here"
            value={aboutEvent}
            onChangeText={setAboutEvent}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Guidelines</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter here"
            value={guidelines}
            onChangeText={setGuidelines}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Banner</Text>
          <View style={styles.bannerOptions}>
            <TouchableOpacity 
              style={styles.bannerOption}
              onPress={handlePickDocument}
            >
              <Text style={styles.bannerOptionText}>Choose image from <Text style={styles.textLink}>gallery</Text></Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>Or</Text>
            
            <TouchableOpacity 
              style={styles.bannerOption}
              onPress={() => setShowSampleImageModal(true)}
            >
              <Text style={styles.bannerOptionText}>Choose from <Text style={styles.textLink}>sample image</Text></Text>
            </TouchableOpacity>
            
            {bannerImage && (
              <View style={styles.selectedBannerContainer}>
                {typeof bannerImage === 'number' ? (
                  <Image 
                    source={sampleImages.find(img => img.id === bannerImage).source} 
                    style={styles.selectedBanner} 
                  />
                ) : (
                  <Image 
                    source={{ uri: bannerImage.uri }} 
                    style={styles.selectedBanner} 
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSaveEvent}
        >
          <Text style={styles.submitButtonText}>Enroll event</Text>
        </TouchableOpacity>
      </View>
      
      {renderSampleImageModal()}
    </SafeAreaView>
  );
};

export default AddEvent;