import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import styles from './AddEventStyle';
import PreviousIcon from '../../../assets/AdminPage/Basicimg/PrevBtn.svg';
import CalendarIcon from '../../../assets/AdminPage/Event/Date.svg';
import { API_URL } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';

const AdminAddEvent = ({ navigation, route }) => {
  const { adminData } = route.params;
  // console.log(adminData);

  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [participantsLimit, setParticipantsLimit] = useState('');
  const [date, setDate] = useState('');
  const [grade, setGrade] = useState(null);
  const [eventType, setEventType] = useState('');
  const [aboutEvent, setAboutEvent] = useState('');
  const [guidelinesRegistration, setGuidelinesRegistration] = useState('');
  const [guidelinesParticipation, setGuidelinesParticipation] = useState('');

  // For date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // For dropdowns
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);

  // For banner image
  const [bannerImage, setBannerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Options for dropdowns
  const [gradeOptions, setGradeOptions] = useState([])
  const eventTypeOptions = ['Inter-school', 'In-school', 'National', 'Other'];

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getGrades`);
      const data = await response.json();

      if (data.success) {
        setGradeOptions(data.grades);
      } else {
        Alert.alert('Error', 'Failed to fetch grades');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      Alert.alert('Error', 'Failed to fetch grades');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios'); // Only hide for Android
    setSelectedDate(currentDate);

    // Format date as YYYY-MM-DD for backend
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
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
        setBannerImage(result[0].uri); // Store just the URI string
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

  const uploadImage = async () => {
    if (!bannerImage) return null;

    const formData = new FormData();
    // Create a file object from the URI
    formData.append('file', {
      uri: bannerImage,
      type: 'image/jpeg', // Default type
      name: 'image.jpg' // Default name
    });

    try {
      const response = await fetch(`${API_URL}/api/coordinator/events/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.filePath;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleEnrollEvent = async () => {
    console.log('typeof adminData:', typeof adminData);
    const parsedAdminData = typeof adminData === 'string' ? JSON.parse(adminData) : adminData;
    console.log('parsedAdminData:', parsedAdminData);
    console.log('parsedAdminData.phone:', parsedAdminData.phone);

    if (!eventName || !location || !participantsLimit || !date || !grade || !eventType || !bannerImage || !parsedAdminData.phone) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();


      // Append all fields to FormData
      formData.append('phone', parsedAdminData.phone);
      formData.append('event_name', eventName);
      formData.append('location', location);
      formData.append('participants_limit', participantsLimit);
      formData.append('event_date', date);
      formData.append('grade_id', grade);
      formData.append('event_type', eventType);
      formData.append('about', aboutEvent);
      formData.append('guidelinesRegistration', guidelinesRegistration);
      formData.append('guidelinesParticipation', guidelinesParticipation);

      // Append the image file
      formData.append('bannerPhoto', {
        uri: bannerImage,
        type: 'image/jpeg',
        name: 'event_banner.jpg'
      });

      const response = await fetch(`${API_URL}/api/coordinator/events/create`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Event created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeBannerImage = () => {
    setBannerImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Create Event</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              placeholderTextColor='grey'
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={location}
              placeholderTextColor='grey'
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Participants Limit</Text>
            <TextInput
              style={styles.input}
              placeholder="Participant limit"
              placeholderTextColor='grey'
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
                placeholder="Select Date"
                value={date}
                placeholderTextColor='grey'
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
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                          setGrade(item.id);
                          setShowGradeDropdown(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item.grade_name}</Text>
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
              placeholderTextColor='grey'
              value={aboutEvent}
              onChangeText={setAboutEvent}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Guidelines(registration)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter registration guidelines"
              multiline={true}
              numberOfLines={4}
              placeholderTextColor='grey'
              value={guidelinesRegistration}
              onChangeText={setGuidelinesRegistration}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Guidelines(participation)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter participation guidelines"
              multiline={true}
              numberOfLines={4}
              placeholderTextColor='grey'
              value={guidelinesParticipation}
              onChangeText={setGuidelinesParticipation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banner</Text>
            {bannerImage ? (
              <View style={styles.selectedBannerContainer}>
                <Image
                  source={{ uri: bannerImage }} // bannerImage is just the URI string
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
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={handleEnrollEvent}
          disabled={isLoading}
        >
          <Text style={styles.enrollButtonText}>
            {isLoading ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminAddEvent;
