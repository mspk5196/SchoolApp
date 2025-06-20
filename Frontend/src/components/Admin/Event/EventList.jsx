import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Image} from 'react-native';
import Liked from    '../../../assets/AdminPage/Event/liked.svg';
import Unliked from  '../../../assets/AdminPage/Event/unliked.svg';
import Location from '../../../assets/AdminPage/Event/location.svg';
import styles from   '../../../pages/Admin/Events/EventStyle';
import { useNavigation } from '@react-navigation/native';

const EventList1 = ({
  categoryName,
  events,
  favorites,
  toggleFavorite,
  showLikedIcon = false, 
}) => {
  // Event card component
  const renderEventCard = ({item}) => (
    
    <TouchableOpacity onPress={() => navigation.navigate("EventDetails",{item:item.id})} style={styles.card} >
      <View style={styles.cardContent}>
        <View style={styles.dateTag}>
          <Text style={styles.dateNumber}>{item.date.split(' ')[0]}</Text>
          <Text style={styles.dateMonth}>{item.date.split(' ')[1]}</Text>
        </View>
        <Image source={{uri: item.image}} style={styles.cardImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}>
          {favorites[item.id] ? <Liked /> : <Unliked />}
        </TouchableOpacity>
        <View style={styles.cardTextContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.participantsContainer}>
            <View style={styles.avatarGroup}>
              <Image
                style={styles.avatar}
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/43.jpg',
                }}
              />
              <Image
                style={[styles.avatar, styles.avatarOffset]}
                source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
              />
              <Image
                style={[styles.avatar, styles.avatarOffset2]}
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/11.jpg',
                }}
              />
            </View>
            <Text style={styles.participantsText}>{item.participants}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Location />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const navigation = useNavigation();

  const handleLikedEventsPress = () => {
    navigation.navigate('LikedEvents')
  };
  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        {showLikedIcon && (
          <TouchableOpacity 
            style={styles.likedContainer}
            onPress={handleLikedEventsPress}
          >
            <Liked width={28} height={28} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventList}
      />
    </View>
  );
};

export default EventList1;