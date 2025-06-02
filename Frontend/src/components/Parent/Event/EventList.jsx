import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import Liked from '../../../assets/ParentPage/Event/liked.svg';
import Unliked from '../../../assets/ParentPage/Event/unliked.svg';
import Location from '../../../assets/ParentPage/Event/location.svg';
import styles from './ListStyles';
import { useNavigation } from '@react-navigation/native';

const EventList = ({
  categoryName,
  events,
  favorites,
  toggleFavorite,
  showLikedIcon = false,
}) => {
  const navigation = useNavigation();

  const renderEventCard = ({ item }) => {
    const dateParts = (item.date || '').split(' ');
    const dateNumber = dateParts[0] || '';
    const dateMonth = dateParts[1] || '';
    const imageUrl = item.image || '';
    const title = item.title || 'Untitled';
    const participants = item.participants || 'N/A';
    const location = item.location || 'No location';

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.dateTag}>
            <Text style={styles.dateNumber}>{dateNumber}</Text>
            <Text style={styles.dateMonth}>{dateMonth}</Text>
          </View>

          <Image source={{ uri: imageUrl }} style={styles.cardImage} />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite?.(item.id)}
          >
            {favorites?.[item.id] ? <Liked /> : <Unliked />}
          </TouchableOpacity>

          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.participantsContainer}>

              <Text style={styles.participantsText}>{participants}</Text>
            </View>

            <View style={styles.locationContainer}>
              <Location />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleLikedEventsPress = () => {
    navigation.navigate('StudentPageLikedEvents');
  };

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName || 'Events'}</Text>
        {showLikedIcon && (
          <TouchableOpacity style={styles.likedContainer} onPress={handleLikedEventsPress}>
            <Liked width={28} height={28} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={Array.isArray(events) ? events : []}
        renderItem={renderEventCard}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventList}
      />
    </View>
  );
};

export default EventList;
