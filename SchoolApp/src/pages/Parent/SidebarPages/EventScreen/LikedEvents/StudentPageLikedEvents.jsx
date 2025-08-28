import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Text, Alert, RefreshControl } from 'react-native';
import EventList from '../../../../../components/Parent/Event/EventList';
import PreviousIcon from '../../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import styles from './LikedvevntsStyles';
import { API_URL } from '../../../../../utils/env.js'
import Nodata from '../../../../../components/General/Nodata';

const StudentPageLikedEvents = ({ navigation, route }) => {
  const { studentData } = route.params;
  const [favorites, setFavorites] = useState({});
  const [events, setEvents] = useState([]);
  const [refresh, setRefresh] = useState(false)

  // Fetch liked events
  const fetchLikedEvents = async () => {
    if (studentData) {
      try {
        setRefresh(true)
        const res = await fetch(`${API_URL}/api/student/getFavouriteEvents?student_roll=${studentData.roll}`);
        const data = await res.json();
        if (data.success) {
          setEvents(data.favouriteEvents);
          // Set favorites mapping
          const favMap = {};
          data.favouriteEvents.forEach(ev => { favMap[ev.id] = true; });
          setFavorites(favMap);
          setRefresh(false)
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load liked events');
        setRefresh(false)
      }
    }
  };

  useEffect(() => {
    fetchLikedEvents();
  }, []);

  // Toggle favorite/unfavorite
  const toggleFavorite = async (eventId) => {
    if (!studentData?.roll) return;
    const isFav = favorites[eventId];
    try {
      if (isFav) {
        await fetch(`${API_URL}/api/student/removeFavouriteEvent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_roll: studentData.roll, event_id: eventId }),
        });
      } else {
        await fetch(`${API_URL}/api/student/addFavouriteEvent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_roll: studentData.roll, event_id: eventId }),
        });
      }
      // Refresh list after toggle
      fetchLikedEvents();
    } catch (e) {
      Alert.alert('Error', 'Failed to update favourite');
    }
  };

  // Map backend event fields to EventList expected fields
  const mappedEvents = events.map(ev => ({
    id: ev.id,
    title: ev.event_name,
    date: ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '',
    image: ev.banner_url ? `${API_URL}/${ev.banner_url}` : '', // fallback if needed
    participants: ev.participants_limit ? `${ev.participants_limit} participants` : '',
    location: ev.location || '',
    event_type: ev.event_type || '',
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Events</Text>
      </View>
      <FlatList
        data={mappedEvents}
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={fetchLikedEvents}
            colors={['#0C36FF']}
            tintColor="#0C36FF"
          />
        }
        ListEmptyComponent={
          <View style={{flex: 1, height: 400, justifyContent: 'center', alignItems: 'center'}}>
            <Nodata/>
          </View>
        }
        renderItem={({ item }) => (
          <EventList
            categoryName={item.event_type}
            events={[item]}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </SafeAreaView>
  );
};

export default StudentPageLikedEvents;