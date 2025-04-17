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
  Alert
} from 'react-native';
import BackIcon from '../../assets/Event/Back.svg';
import CalendarIcon from '../../assets/Event/Calender.svg';
import styles from './AddEventFormStyle';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import { Calendar } from 'react-native-calendars';

const sampleImages = [
  { id: 1, source: require('../../assets/Event/BannerImage1.png') },
  { id: 2, source: require('../../assets/Event/BannerImage2.png') },
  { id: 3, source: require('../../assets/Event/BannerImage3.png') },
];

const AddEventForm = ({ navigation }) => {
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [participantsLimit, setParticipantsLimit] = useState('');
  const [date, setDate] = useState('');
  const [grade, setGrade] = useState('');
  const [eventType, setEventType] = useState('');
  const [aboutEvent, setAboutEvent] = useState('');
  const [guidelines, setGuidelines] = useState('');
  
  // For date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
    setShowDatePicker(Platform.OS === 'ios'); // Only hide for Android
    setSelectedDate(currentDate);
    
    // Format date as DD/MM/YY
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString().substr(-2);
    setDate(`${day}/${month}/${year}`);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: false,
      });
      
      if (result.length > 0) {
        const selectedImage = result[0];
        console.log('Selected image:', selectedImage.uri);
        
        setBannerImage({
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.name || 'image.jpg',
          source: { uri: selectedImage.uri }
        });
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled the picker');
      } else {
        console.log('Error picking document: ', error);
        Alert.alert('Error', 'Something went wrong while picking the image');
      }
    }
  };

  // Function to select sample image
  const selectSampleImage = (image) => {
    setBannerImage({
      source: image.source,
      isSampleImage: true,
      id: image.id
    });
    setShowSampleImageModal(false);
  };

  // Function to remove banner image
  const removeBannerImage = () => {
    setBannerImage(null);
  };

  const handleEnrollEvent = () => {
    // Validate form
    if (!eventName || !location || !participantsLimit || !date || !grade || !eventType) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }
  
    // Create new event object with proper banner image handling
    const newEvent = {
      eventName,
      location,
      participantsLimit,
      date,
      grade,
      eventType,
      aboutEvent,
      guidelines,
      bannerImage: bannerImage ? 
        (bannerImage.isSampleImage ? bannerImage.id : 
          (bannerImage.uri ? bannerImage.uri : null)) : null
    };
  
    console.log('Submitting new event:', newEvent);
  
    // Navigate back to events page and pass the new event
    navigation.navigate({
      name: 'Event',
      params: { newEvent },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Events</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event name</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Participants Limit</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              keyboardType="numeric"
              value={participantsLimit}
              onChangeText={setParticipantsLimit}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateInputContainer}>
              <TextInput 
                style={styles.dateInput}
                placeholder="Enter Date"
                value={date}
                onChangeText={setDate}
                editable={false}
              />
              <TouchableOpacity style={styles.calendarButton} onPress={showDatepicker}>
                <CalendarIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={[styles.inputGroup, { width: '70%' }]}>
            <Text style={styles.label}>Grade</Text>
            <TouchableOpacity 
              style={[styles.dropdownInput, { height: 45 }]}
              onPress={() => setShowGradeDropdown(true)}
            >
              <Text style={grade ? styles.inputText : styles.placeholderText}>
                {grade || "Select grade"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            <Modal
              visible={showGradeDropdown}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Grade</Text>
                  <FlatList
                    data={gradeOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.optionItem}
                        onPress={() => {
                          setGrade(item);
                          setShowGradeDropdown(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowGradeDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          
          <View style={[styles.inputGroup, { width: '70%' }]}>
            <Text style={styles.label}>Event type</Text>
            <TouchableOpacity 
              style={[styles.dropdownInput, { height: 45 }]}
              onPress={() => setShowEventTypeDropdown(true)}
            >
              <Text style={eventType ? styles.inputText : styles.placeholderText}>
                {eventType || "Select Event type"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            
            <Modal
              visible={showEventTypeDropdown}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Event Type</Text>
                  <FlatList
                    data={eventTypeOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.optionItem}
                        onPress={() => {
                          setEventType(item);
                          setShowEventTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowEventTypeDropdown(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About event</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter here"
              multiline={true}
              numberOfLines={4}
              value={aboutEvent}
              onChangeText={setAboutEvent}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Guidelines</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter here"
              multiline={true}
              numberOfLines={4}
              value={guidelines}
              onChangeText={setGuidelines}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banner</Text>
            {bannerImage ? (
              <View style={styles.selectedBannerContainer}>
                <Image 
                  source={bannerImage.isSampleImage ? bannerImage.source : { uri: bannerImage.uri }}
                  style={styles.selectedBannerImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeBannerButton}
                  onPress={removeBannerImage}
                >
                  <Text style={styles.removeBannerButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.bannerContainer}>
                <TouchableOpacity onPress={pickImageFromGallery}>
                  <Text style={styles.bannerText}>Choose image from <Text style={styles.linkText}>gallery</Text></Text>
                </TouchableOpacity>
                <Text style={styles.orText}>Or</Text>
                <TouchableOpacity onPress={() => setShowSampleImageModal(true)}>
                  <Text style={styles.bannerText}>Choose from <Text style={styles.linkText}>sample image</Text></Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollEvent}>
          <Text style={styles.enrollButtonText}>Enroll event</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSampleImageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.sampleImageModalContent]}>
            <Text style={styles.modalTitle}>Select Sample Image</Text>
            <FlatList
              data={sampleImages}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.sampleImageItem}
                  onPress={() => selectSampleImage(item)}
                >
                  <Image 
                    source={item.source}
                    style={styles.sampleImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSampleImageModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddEventForm;