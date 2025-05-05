import React, {useState} from 'react';
import {View, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Text} from 'react-native';
import EventList from '../../../components/Event/EventList';
import PreviousIcon from '../../../assets/Basicimg/PrevBtn.svg';
import styles from './EventStyle';

const AdminEvent = ({navigation}) => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sample event data
  const events = [
    {
      id: '1',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'Registered events',
      image: 'https://via.placeholder.com/150/FFD7D0',
    },
    {
      id: '2',
      title: 'Jazz Night',
      date: '15 JUNE',
      location: '42 Music Avenue London, UK',
      participants: '30+ participants',
      category: 'Registered events',
      image: 'https://via.placeholder.com/150/D0E3FF',
    },
    {
      id: '3',
      title: 'Art Exhibition',
      date: '20 JUNE',
      location: '22 Gallery Road London, UK',
      participants: '15+ participants',
      category: 'In-School events',
      image: 'https://via.placeholder.com/150/FFD0F0',
    },
    {
      id: '4',
      title: 'Science Fair',
      date: '25 JUNE',
      location: '10 Innovation Street London, UK',
      participants: '25+ participants',
      category: 'In-School events',
      image: 'https://via.placeholder.com/150/D0FFD6',
    },
    {
      id: '5',
      title: 'Food Festival',
      date: '30 JUNE',
      location: '5 Culinary Lane London, UK',
      participants: '50+ participants',
      category: 'Beyond campus events',
      image: 'https://via.placeholder.com/150/FFE8D0',
    },
    {
      id: '6',
      title: 'Charity Marathon',
      date: '5 JULY',
      location: 'Central Park London, UK',
      participants: '100+ participants',
      category: 'Beyond campus events',
      image: 'https://via.placeholder.com/150/E0D0FF',
    },
  ];

  // Group events by category
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {});

  // Get all unique categories
  const categories = Object.keys(groupedEvents);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={({item, index}) => (
          <EventList
            categoryName={item}
            events={groupedEvents[item]}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showLikedIcon={index === 0}
          />
        )}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </SafeAreaView>
  );
};

export default AdminEvent;