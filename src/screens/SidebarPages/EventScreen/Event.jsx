import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import styles from './EventStyles';

const EventsScreen = () => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
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
    },
    {
      id: '2',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'Registered events',
    },
    {
      id: '3',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'In-School events',
    },
    {
      id: '4',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'In-School events',
    },
    {
      id: '5',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'Beyond campus events',
    },
    {
      id: '6',
      title: 'International Band Music',
      date: '10 JUNE',
      location: '36 Guild Street London, UK',
      participants: '20+ participants',
      category: 'Beyond campus events',
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

  // Event card component
  const EventCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.dateTag}>
          <Text style={styles.dateNumber}>10</Text>
          <Text style={styles.dateMonth}>JUNE</Text>
        </View>
        <Image
          source={{ uri: 'https://via.placeholder.com/150/FFD7D0' }}
          style={styles.cardImage}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          {/* <Ionicons 
            name={favorites[item.id] ? 'heart' : 'heart-outline'} 
            size={20} 
            color={favorites[item.id] ? "#FF3B30" : "#888"}
          /> */}
        </TouchableOpacity>
        <View style={styles.cardTextContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.participantsContainer}>
            <View style={styles.avatarGroup}>
              <Image style={styles.avatar} source={{ uri: 'https://randomuser.me/api/portraits/women/43.jpg' }} />
              <Image style={[styles.avatar, styles.avatarOffset]} source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} />
              <Image style={[styles.avatar, styles.avatarOffset2]} source={{ uri: 'https://randomuser.me/api/portraits/women/11.jpg' }} />
            </View>
            <Text style={styles.participantsText}>{item.participants}</Text>
          </View>
          <View style={styles.locationContainer}>
            {/* <Ionicons name="location-outline" size={14} color="#888" /> */}
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render category section
  const renderCategory = ({ item }) => {
    const categoryName = item;
    const categoryEvents = groupedEvents[categoryName];

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        <FlatList
          data={categoryEvents}
          renderItem={({ item }) => <EventCard item={item} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventList}
        />
      </View>
    );
  };

  // Get all unique categories
  const categories = Object.keys(groupedEvents);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          {/* <Ionicons name="arrow-back" size={24} color="#000" /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default EventsScreen;