import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Modal, 
  FlatList, 
  StatusBar,
  ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../../assets/GeneralAssests/backarrow.svg';
import styles from './EventStyle';
import CalendarIcon from '../../assets/Event/Calendar.svg';
import LocationIcon from '../../assets/Event/location.svg';
import LocationMain from '../../assets/Event/Locationmain.svg';
import { Calendar } from 'react-native-calendars';

// Import sample avatars for participants
const AVATAR1 = require('../../assets/Event/image1.png');
const AVATAR2 = require('../../assets/Event/image2.png');

// Event Card Component
const EventCard = ({ event, onPress }) => {
  const { date, title, participants, location, bannerImage } = event;

  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => onPress(event)}>
      <View style={styles.eventImageContainer}>
        {bannerImage ? (
          typeof bannerImage === 'number' || (typeof bannerImage === 'object' && !bannerImage.uri) ? 
            <Image source={bannerImage} style={styles.eventImage} resizeMode="cover" /> :
            <Image source={{ uri: bannerImage }} style={styles.eventImage} resizeMode="cover" />
        ) : (
          <View style={[styles.eventImage, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.placeholderText}>{title.substring(0, 1)}</Text>
          </View>
        )}
        
        <View style={styles.dateOverlay}>
          <Text style={styles.dateDay}>{date.day}</Text>
          <Text style={styles.dateMonth}>{date.month}</Text>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{title}</Text>
        
        <View style={styles.participantsContainer}>
          <View style={styles.avatarGroup}>
            <Image source={AVATAR1} style={styles.avatar} />
            <Image source={AVATAR2} style={[styles.avatar, styles.avatarOverlap]} />
          </View> 
          <Text style={styles.participantsText}>{participants}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <LocationIcon width={16} height={16} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Event Category Section
const EventSection = ({ title, events, onPressEvent }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <FlatList 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventRowScroll}
        data={events}
        keyExtractor={(item, index) => `${title}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <EventCard
              event={item}
              onPress={onPressEvent}
            />
          </View>
        )}
      />
    </View>
  );
};

// Event Detail Modal
const EventDetail = ({ event, visible, onClose }) => {
  if (!event) return null;
  
  const formattedDate = `${event.date.day} ${event.date.month}`;
  const formattedTime = event.startTime && event.endTime 
    ? `${event.startTime} - ${event.endTime}` 
    : '4:00PM - 9:00PM'; // Default if times not provided
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <BackIcon width={19} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTxt}>Events</Text>
        </View>
        
        <ScrollView style={styles.detailScrollView}>
          <View style={styles.detailImageContainer}>
            {event.bannerImage ? (
              typeof event.bannerImage === 'number' || (typeof event.bannerImage === 'object' && !event.bannerImage.uri) ? 
                <Image source={event.bannerImage} style={styles.detailBannerImage} resizeMode="cover" /> :
                <Image source={{ uri: event.bannerImage }} style={styles.detailBannerImage} resizeMode="cover" />
            ) : (
              <View style={[styles.detailBannerImage, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.placeholderText}>{event.title.substring(0, 1)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{event.title}</Text>
            
            <View style={styles.detailInfoContainer}>
              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <CalendarIcon width={20} height={20} />
                </View>
                <View>
                  <Text style={styles.detailInfoTitle}>{formattedDate}</Text>
                  <Text style={styles.detailInfoSubtitle}>{formattedTime}</Text>
                </View>
              </View>
              
              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <LocationMain width={20} height={20} />
                </View>
                <View>
                  <Text style={styles.detailInfoTitle}>{event.location}</Text>
                  <Text style={styles.detailInfoSubtitle}>{event.eventType} Event</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>About Event</Text>
              <Text style={styles.detailSectionText}>
                {event.aboutEvent || "Enjoy your favorite dishe and a lovely your friends and family and have a great time. Food from local food trucks will be available for purchase. Enjoy your favorite dishe and a lovely your friends and family and have a great time."}
              </Text>
              <TouchableOpacity>
                <Text style={styles.readMoreLink}>Read More...</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Guidelines</Text>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineBullet}>•</Text>
                <Text style={styles.guidelineText}>{event.guidelines || "Registration is required for this event. Please make sure to bring your ID."}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Main Event Component
const Event = ({ navigation, route }) => {
  // Define sample banner images
  const BANNER_IMAGE = require('../../assets/Event/BannerImage.png');
  const BANNER_IMAGE1 = require('../../assets/Event/BannerImage1.png');
  const BANNER_IMAGE2 = require('../../assets/Event/BannerImage2.png');
  const BANNER_IMAGE3 = require('../../assets/Event/BannerImage3.png');

  const initialEvents = {
    'Inter-School events': [  // Changed from "Registered events" to "Inter-School events"
      {
        id: '1',
        date: { day: 10, month: 'JUNE' },
        title: 'International Band Music...',
        participants: '20+ participants',
        location: '36 Guild Street London, UK',
        bannerImage: BANNER_IMAGE,
        eventType: 'Inter-school',
        aboutEvent: 'Join us for an exciting international band music festival featuring talented artists from around the world.',
        startTime: '2:00PM',
        endTime: '8:00PM'
      },
      {
        id: '2',
        date: { day: 15, month: 'JUNE' },
        title: 'Jazz Night',
        participants: '30+ participants',
        location: '42 Music Avenue London, UK',
        bannerImage: BANNER_IMAGE1,
        eventType: 'Inter-school',
        aboutEvent: 'Experience a night of smooth jazz with leading performers in the heart of London.',
        startTime: '7:00PM',
        endTime: '11:00PM'
      }
    ],
    'In-School events': [
      {
        id: '3',
        date: { day: 20, month: 'JUNE' },
        title: 'School Art Exhibition',
        participants: '15+ participants',
        location: 'Main Campus Hall',
        bannerImage: BANNER_IMAGE2,
        eventType: 'In-School',
        aboutEvent: 'Showcase of student artwork from all grades. Come support our talented young artists!',
        startTime: '10:00AM',
        endTime: '4:00PM'
      },
      {
        id: '4',
        date: { day: 25, month: 'JUNE' },
        title: 'Science Fair',
        participants: '25+ participants',
        location: 'Science Building',
        bannerImage: BANNER_IMAGE3,
        eventType: 'In-School',
        aboutEvent: 'An exciting day of scientific discovery featuring student projects and demonstrations.',
        startTime: '9:00AM',
        endTime: '3:00PM'
      }
    ],
    'Beyond campus events': [
      {
        id: '5',
        date: { day: 30, month: 'JUNE' },
        title: 'City Science Fair',
        participants: '50+ participants',
        location: 'City Convention Center',
        bannerImage: BANNER_IMAGE1,
        eventType: 'Beyond-campus',
        aboutEvent: 'Join the largest science fair in the city with exhibitors from schools across the region.',
        startTime: '9:00AM',
        endTime: '6:00PM'
      },
      {
        id: '6',
        date: { day: 5, month: 'JULY' },
        title: 'Charity Marathon',
        participants: '100+ participants',
        location: 'Central Park',
        bannerImage: BANNER_IMAGE3,
        eventType: 'Beyond-campus',
        aboutEvent: 'Run for a cause! Join our annual charity marathon to raise funds for local education initiatives.',
        startTime: '6:00AM',
        endTime: '12:00PM'
      }
    ]
  };

  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (route.params?.newEvent) {
      console.log('Received new event in Event.jsx:', route.params.newEvent);
      addNewEvent(route.params.newEvent);
      navigation.setParams({ newEvent: null });
    }
  }, [route.params?.newEvent]);

  // Save events to AsyncStorage
  const saveEvents = async (eventsData) => {
    try {
      await AsyncStorage.setItem('eventsData', JSON.stringify(eventsData));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  // Load events from AsyncStorage
  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('eventsData');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Determine the banner image to use
  const getBannerImageFromId = (imageId) => {
    switch(imageId) {
      case 1: return BANNER_IMAGE1;
      case 2: return BANNER_IMAGE2;
      case 3: return BANNER_IMAGE3;
      default: return BANNER_IMAGE;
    }
  };

  // Add a new event from AddEventForm
  const addNewEvent = (newEvent) => {
    console.log('Adding new event:', newEvent);
    
    // Parse date from DD/MM/YY format
    const dateParts = newEvent.date.split('/');
    const day = parseInt(dateParts[0], 10);
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[monthIndex];

    // Determine banner image
    let bannerImage;
    if (newEvent.bannerImage !== null && newEvent.bannerImage !== undefined) {
      if (typeof newEvent.bannerImage === 'number') {
        bannerImage = getBannerImageFromId(newEvent.bannerImage);
      } else if (typeof newEvent.bannerImage === 'string') {
        bannerImage = newEvent.bannerImage;
      } else if (typeof newEvent.bannerImage === 'object' && newEvent.bannerImage.uri) {
        bannerImage = newEvent.bannerImage.uri;
      } else {
        bannerImage = BANNER_IMAGE;
      }
    } else {
      bannerImage = BANNER_IMAGE;
    }

    // Create formatted event object
    const formattedEvent = {
      id: Date.now().toString(), // Generate unique ID
      date: { day, month },
      title: newEvent.eventName,
      participants: '0 participants', // Default to 0 participants for new events
      location: newEvent.location,
      bannerImage: bannerImage,
      eventType: newEvent.eventType,
      aboutEvent: newEvent.aboutEvent || '',
      guidelines: newEvent.guidelines || '',
      startTime: newEvent.startTime || '9:00AM', // Include start time
      endTime: newEvent.endTime || '5:00PM'      // Include end time
    };

    // Determine the category based on event type
    let categoryKey;
    switch (newEvent.eventType) {
      case 'Inter-school':
        categoryKey = 'Inter-School events';  // Changed from "Registered events"
        break;
      case 'In-School':
        categoryKey = 'In-School events';
        break;
      case 'Beyond-campus':
        categoryKey = 'Beyond campus events';
        break;
      default:
        categoryKey = 'In-School events';
    }

    // Update events state
    const updatedEvents = { ...events };
    if (!updatedEvents[categoryKey]) {
      updatedEvents[categoryKey] = [];
    }
    updatedEvents[categoryKey] = [...updatedEvents[categoryKey], formattedEvent];
    
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  // Event handlers
  const handlePressEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
    setSelectedEvent(null);
  };

  const handleAddEvent = () => {
    navigation.navigate('AddEventForm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Events</Text>
      </View>
      
      <FlatList
        data={Object.keys(events)}
        renderItem={({ item }) => (
          <EventSection 
            title={item} 
            events={events[item]} 
            onPressEvent={handlePressEvent}
          />
        )}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      />
      
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddEvent}>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      {/* Event Detail Modal */}
      <EventDetail 
        event={selectedEvent}
        visible={showEventDetail}
        onClose={handleCloseEventDetail}
      />
    </SafeAreaView>
  );
};

export default Event;