import { apiFetch } from "../../../../../utils/apiClient.js";
import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Text, Alert, RefreshControl, Pressable, Image, Modal, ScrollView } from 'react-native';
import EventList from '../../../../../components/Parent/Event/EventList';
import PreviousIcon from '../../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import LocationIcon from '../../../../../assets/ParentPage/Event/location.svg';
import CalendarIcon from '../../../../../assets/ParentPage/Event/calendar.svg';
import styles from './EventStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Liked from '../../../../../assets/ParentPage/Event/liked.svg';
import Unliked from '../../../../../assets/ParentPage/Event/unliked.svg';
import CurvedImageBanner from '../../../../../components/CurvedImage/CurvedImageBanner';
import { API_URL } from '../../../../../utils/env.js'
import { useNavigation } from '@react-navigation/native';

const EventCard = ({ event, navigation, title, isFavourite, onToggleFavourite }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const { event_date, event_name, participants_limit, location, banner_url } = event;
  const date = formatDate(event_date);

  const [favorites, setFavorites] = useState({});

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePressEvent = (event) => {
    console.log(event);

    // setSelectedEvent(event);
    navigation.navigate("StudentEventDetails", { event, title })
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => handlePressEvent(event)}>
      <View style={styles.eventImageContainer}>
        {banner_url ? (
          <Image source={{ uri: `${API_URL}/${banner_url}` }} style={styles.eventImage} resizeMode="cover" />
        ) : (
          <View style={[styles.eventImage, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.placeholderText}>{event_name.substring(0, 1)}</Text>
          </View>
        )}

        <View style={styles.dateOverlay}>
          <Text style={styles.dateDay}>{date.day}</Text>
          <Text style={styles.dateMonth}>{date.month}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavourite(event.id)}
        >
          {isFavourite ? <Liked /> : <Unliked />}
        </TouchableOpacity>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event_name}</Text>

        <View style={styles.participantsContainer}>
          <Text style={styles.participantsText}>{participants_limit} participants limit</Text>
        </View>

        <View style={styles.locationContainer}>
          <LocationIcon width={16} height={16} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EventSection = ({ title, events, navigation, favourites, onToggleFavourite }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events available</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventRowScroll}
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <EventCard
                title={title}
                event={item}
                navigation={navigation}
                isFavourite={favourites[item.id]}
                onToggleFavourite={onToggleFavourite}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const StudentPageEvent = ({ navigation }) => {
  const [activeGrade, setActiveGrade] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [favourites, setFavourites] = useState({});

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('studentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStudentData(parsedData[0]);
        setActiveGrade(parsedData[0].grade_id);
        console.log('Student Data:', parsedData[0].grade_id);

        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Fetch favourite events for this student
  const fetchFavourites = async (student_roll) => {
    try {
      const res = await fetch(`${API_URL}/api/student/getFavouriteEvents?student_roll=${student_roll}`);
      const data = await res.json();
      if (data.success) {
        // Map event IDs to true
        const favMap = {};
        data.favouriteEvents.forEach(ev => { favMap[ev.id] = true; });
        setFavourites(favMap);
      }
    } catch (e) {
      console.error('Error fetching favourites:', e);
    }
  };

  useEffect(() => {
    if (studentData?.roll) {
      fetchFavourites(studentData.roll);
    }
  }, [studentData]);

  // Toggle favourite
  const handleToggleFavourite = async (eventId) => {
    if (!studentData?.roll) return;
    const isFav = favourites[eventId];
    try {
      if (isFav) {
        await apiFetch(`/student/removeFavouriteEvent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_roll: studentData.roll, event_id: eventId }),
        });
      } else {
        await apiFetch(`/student/addFavouriteEvent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_roll: studentData.roll, event_id: eventId }),
        });
      }
      setFavourites(prev => ({ ...prev, [eventId]: !isFav }));
    } catch (e) {
      Alert.alert('Error', 'Failed to update favourite');
    }
  };

  const [events, setEvents] = useState({
    'Registered Events': [],
    'Inter-school': [],
    'In-school': [],
    'National': [],
    'Other': [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllEvents = async () => {
    try {
      setRefreshing(true);

      // Fetch all events and registered events in parallel
      const [allRes, regRes] = await Promise.all([
        fetch(`${API_URL}/api/coordinator/events/get?phone=${activeGrade}`),
        fetch(`${API_URL}/api/student/events/getRegisteredEvents?studentId=${studentData.student_id}`)
      ]);
      const allData = await allRes.json();
      const regData = await regRes.json();

      if (allData.success && regData.success) {
        // Prepare registered events
        const registeredEvents = regData.registeredEvents || [];

        // Prepare other event types
        const groupedEvents = {
          'Registered Events': registeredEvents,
          'Inter-school': [],
          'In-school': [],
          'National': [],
          'Other': [],
        };

        // Optionally, filter out registered events from other categories
        const registeredIds = new Set(registeredEvents.map(ev => ev.id));

        allData.events.forEach(event => {
          if (groupedEvents[event.event_type]) {
            // Optionally skip if already registered:
            // if (!registeredIds.has(event.id)) {
            //   groupedEvents[event.event_type].push(event);
            // }
            // If you want to show in both, just push:
            groupedEvents[event.event_type].push(event);
          }
        });

        setEvents(groupedEvents);
        fetchFavourites(studentData.roll)
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (activeGrade && studentData) {
      fetchAllEvents()
    }
  }, [studentData, activeGrade]);


  const onRefresh = () => {
    if (activeGrade && studentData) {
      fetchAllEvents()
    }
  };

  const handleLikedEventsPress = () => {
    navigation.navigate('StudentPageLikedEvents', { studentData })
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Events</Text>
      </View>

      <View style={{ flex: 300 }}>

        <TouchableOpacity
          style={styles.likedContainer}
          onPress={() => handleLikedEventsPress()}
        >
          <Liked width={28} height={28} />
        </TouchableOpacity>

        <FlatList
          data={Object.keys(events)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => (
            <EventSection
              title={item}
              events={events[item]}
              navigation={navigation}
              favourites={favourites}
              onToggleFavourite={handleToggleFavourite}
            />
          )}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
        />

      </View>

    </SafeAreaView>
  );
};

export default StudentPageEvent;