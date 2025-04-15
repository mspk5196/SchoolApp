import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../../assets/Event/Back.svg';
import styles from './EventStyle';

const EventDetail = ({ event, visible, onClose }) => {
  if (!event) return null;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dateObj = new Date(2023, monthNames.indexOf(event.date.month), event.date.day);
  const formattedDate = `${event.date.day} ${event.date.month}, ${dateObj.getFullYear()}`;
  const formattedTime = '4:00PM - 9:00PM'; 
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Events</Text>
        </View>
        
        <ScrollView style={styles.detailScrollView}>
          <View style={styles.detailImageContainer}>
            {event.bannerImage ? (
              typeof event.bannerImage === 'number' || (typeof event.bannerImage === 'object' && !event.bannerImage.uri) ? 
            
                <Image source={event.bannerImage} style={styles.detailBannerImage} resizeMode="cover" /> :
             
                <Image source={event.bannerImage} style={styles.detailBannerImage} resizeMode="cover" />
            ) : (
              // Fallback for no image
              <View style={[styles.detailBannerImage, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.placeholderText}>{event.title.substring(0, 1)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.favoriteBtnOverlay}>
              <Text style={styles.favoriteIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{event.title}</Text>
            
            <View style={styles.detailInfoContainer}>
              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <Text style={styles.detailInfoIcon}>📅</Text>
                </View>
                <View>
                  <Text style={styles.detailInfoTitle}>{formattedDate}</Text>
                  <Text style={styles.detailInfoSubtitle}>{formattedTime}</Text>
                </View>
              </View>
              
              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <Text style={styles.detailInfoIcon}>📍</Text>
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
                <Text style={styles.guidelineText}>{event.guidelines || "Registration:"}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// EventCard component updated for consistent sizing
const EventCard = ({ date, title, participants, location, bannerImage, onPress }) => {
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventImageContainer}>
        {bannerImage ? (
          typeof bannerImage === 'number' || (typeof bannerImage === 'object' && !bannerImage.uri) ? 
            // Handle require() imported images
            <Image source={bannerImage} style={styles.eventImage} resizeMode="cover" /> :
            // Handle URI images from gallery
            <Image source={bannerImage} style={styles.eventImage} resizeMode="cover" />
        ) : (
          // Fallback for no image
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
            <Image source={require('../../assets/Event/image1.png')} style={styles.avatar} />
            <Image source={require('../../assets/Event/image2.png')} style={[styles.avatar, styles.avatarOverlap]} />
          </View> 
          <Text style={styles.participantsText}>{participants}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EventSection = ({ title, events, onPressEvent }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventRowScroll}
        decelerationRate="fast"
      >
        {events.map((event, index) => (
          <View key={index} style={styles.cardWrapper}>
            <EventCard
              date={event.date}
              title={event.title}
              participants={event.participants || '0 participants'}
              location={event.location}
              bannerImage={event.bannerImage}
              onPress={() => onPressEvent(event)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const Event = ({ navigation, route }) => {
  const initialInterSchoolEvents = [
    {
      date: { day: 10, month: 'JUNE' },
      title: 'International Band Music...',
      participants: '20+ participants',
      location: '36 Guild Street London, UK',
      bannerImage: require('../../assets/Event/BannerImage.png'),
      eventType: 'Inter-school'
    },
    // ... other initial events
  ];
  
  const initialInSchoolEvents = [
    {
      date: { day: 10, month: 'JUNE' },
      title: 'School Art Exhibition',
      participants: '20+ participants',
      location: '36 Guild Street London, UK',
      bannerImage: require('../../assets/Event/BannerImage.png'),
      eventType: 'In-School'
    },
    // ... other initial events
  ];
  
  const initialBeyondCampusEvents = [
    {
      date: { day: 10, month: 'JUNE' },
      title: 'City Science Fair',
      participants: '20+ participants',
      location: '36 Guild Street London, UK',
      bannerImage: require('../../assets/Event/BannerImage.png'),
      eventType: 'Beyond-campus'
    },
    // ... other initial events
  ];

  const [interSchoolEvents, setInterSchoolEvents] = useState(initialInterSchoolEvents);
  const [inSchoolEvents, setInSchoolEvents] = useState(initialInSchoolEvents);
  const [beyondCampusEvents, setBeyondCampusEvents] = useState(initialBeyondCampusEvents);
  
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

  const getImageIdentifier = (imageSource) => {
    if (!imageSource) return null;
    
    if (typeof imageSource === 'number') {
      return { type: 'required', id: imageSource };
    } 
    else if (typeof imageSource === 'object' && imageSource.uri) {
      return { type: 'uri', uri: imageSource.uri };
    }
    else if (typeof imageSource === 'string') {
      return { type: 'uri', uri: imageSource };
    }
    return null;
  };

  const reconstructImage = (imageIdentifier) => {
    if (!imageIdentifier) return null;
    
    if (imageIdentifier.type === 'required') {
      switch (imageIdentifier.id) {
        case 1:
          return require('../../assets/Event/BannerImage.png');
        case 2:
          return require('../../assets/Event/BannerImage.png');
        case 3:
          return require('../../assets/Event/BannerImage.png');
        default:
          return require('../../assets/Event/BannerImage.png');
      }
    } 
    else if (imageIdentifier.type === 'uri') {
      return { uri: imageIdentifier.uri };
    }
    return null;
  };

  const saveEvents = async () => {
    try {
      const serializableInterSchoolEvents = interSchoolEvents.map(event => ({
        ...event,
        bannerImage: getImageIdentifier(event.bannerImage)
      }));
      
      const serializableInSchoolEvents = inSchoolEvents.map(event => ({
        ...event,
        bannerImage: getImageIdentifier(event.bannerImage)
      }));
      
      const serializableBeyondCampusEvents = beyondCampusEvents.map(event => ({
        ...event,
        bannerImage: getImageIdentifier(event.bannerImage)
      }));
      
      const events = {
        interSchool: serializableInterSchoolEvents,
        inSchool: serializableInSchoolEvents,
        beyondCampus: serializableBeyondCampusEvents
      };
      
      await AsyncStorage.setItem('events', JSON.stringify(events));
      console.log('Events saved successfully');
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        
        // Reconstruct images for each category
        const reconstructedInterSchool = parsedEvents.interSchool?.map(event => ({
          ...event,
          bannerImage: reconstructImage(event.bannerImage)
        })) || initialInterSchoolEvents;
        
        const reconstructedInSchool = parsedEvents.inSchool?.map(event => ({
          ...event,
          bannerImage: reconstructImage(event.bannerImage)
        })) || initialInSchoolEvents;
        
        const reconstructedBeyondCampus = parsedEvents.beyondCampus?.map(event => ({
          ...event,
          bannerImage: reconstructImage(event.bannerImage)
        })) || initialBeyondCampusEvents;
        
        setInterSchoolEvents(reconstructedInterSchool);
        setInSchoolEvents(reconstructedInSchool);
        setBeyondCampusEvents(reconstructedBeyondCampus);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addNewEvent = (newEvent) => {
    console.log('Adding new event:', newEvent);
    
    const dateParts = newEvent.date.split('/');
    const day = parseInt(dateParts[0], 10);
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[monthIndex];

    let bannerImage;
    
    if (newEvent.bannerImage !== null && newEvent.bannerImage !== undefined) {
      if (typeof newEvent.bannerImage === 'number') {
        switch(newEvent.bannerImage) {
          case 1:
            bannerImage = require('../../assets/Event/BannerImage.png');
            break;
          case 2:
            bannerImage = require('../../assets/Event/BannerImage.png');
            break;
          case 3:
            bannerImage = require('../../assets/Event/BannerImage.png');
            break;
          default:
            bannerImage = require('../../assets/Event/BannerImage.png');
        }
      } 
      else if (typeof newEvent.bannerImage === 'string') {
        bannerImage = { uri: newEvent.bannerImage };
      }
      else if (typeof newEvent.bannerImage === 'object' && newEvent.bannerImage.uri) {
        bannerImage = { uri: newEvent.bannerImage.uri };
      }
      else {
        bannerImage = require('../../assets/Event/BannerImage.png');
      }
    } else {
      bannerImage = require('../../assets/Event/BannerImage.png');
    }

    const formattedEvent = {
      date: { day, month },
      title: newEvent.eventName,
      participants: `${newEvent.participantsLimit} participants`,
      location: newEvent.location,
      bannerImage: bannerImage,
      eventType: newEvent.eventType,
      aboutEvent: newEvent.aboutEvent || '',
      guidelines: newEvent.guidelines || ''
    };

    console.log('Formatted event:', formattedEvent);

    switch (newEvent.eventType) {
      case 'Inter-school':
        setInterSchoolEvents(prevEvents => {
          const updatedEvents = [...prevEvents, formattedEvent];
          setTimeout(() => saveEvents(), 100);
          return updatedEvents;
        });
        break;
      case 'In-School':
        setInSchoolEvents(prevEvents => {
          const updatedEvents = [...prevEvents, formattedEvent];
          setTimeout(() => saveEvents(), 100);
          return updatedEvents;
        });
        break;
      case 'Beyond-campus':
        setBeyondCampusEvents(prevEvents => {
          const updatedEvents = [...prevEvents, formattedEvent];
          setTimeout(() => saveEvents(), 100);
          return updatedEvents;
        });
        break;
      default:
        // If no eventType is specified, default to In-School
        setInSchoolEvents(prevEvents => {
          const updatedEvents = [...prevEvents, formattedEvent];
          setTimeout(() => saveEvents(), 100);
          return updatedEvents;
        });
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Events</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <EventSection 
          title="Inter-school events" 
          events={interSchoolEvents} 
          onPressEvent={handlePressEvent}
        />
        <EventSection 
          title="In-School events" 
          events={inSchoolEvents} 
          onPressEvent={handlePressEvent}
        />
        <EventSection 
          title="Beyond campus events" 
          events={beyondCampusEvents} 
          onPressEvent={handlePressEvent}
        />
      </ScrollView>
      
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