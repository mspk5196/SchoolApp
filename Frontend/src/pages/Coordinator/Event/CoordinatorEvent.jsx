import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import BackIcon from '../../../assets/CoordinatorPage/Event/Back.svg';
import LocationIcon from '../../../assets/CoordinatorPage/Event/location.svg';
import CalendarIcon from '../../../assets/CoordinatorPage/Event/Calendar.svg';
import LocationMain from '../../../assets/CoordinatorPage/Event/Locationmain.svg';
import DeleteIcon from '../../../assets/CoordinatorPage/Event/delete-icon.svg';
import styles from './EventStyle';
import { API_URL } from '../../../utils/env.js';
import CurvedImageBanner from '../../../components/CurvedImage/CurvedImageBanner';

const EventCard = ({ event, onPress, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const { event_date, event_name, participants_limit, location, banner_url } = event;
  const date = formatDate(event_date);

  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => onPress(event)}>
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
          style={styles.deleteButton}
          onPress={() => onDelete(event.id)}
        >
          <DeleteIcon width={20} height={20} />
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

const EventSection = ({ title, events, onPressEvent, onDeleteEvent }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {/* <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventRowScroll}
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <EventCard
              event={item}
              onPress={onPressEvent}
              onDelete={onDeleteEvent}
            />
          </View>
        )}
      /> */}
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
                event={item}
                onPress={onPressEvent}
                onDelete={onDeleteEvent}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const EventDetail = ({ event, visible, onClose }) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  const [showFullText, setShowFullText] = useState(true);

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  // <CurvedImageBanner imageSource={{ uri: `${API_URL}/${event.banner_url}` }} />

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTxt}>Event Details</Text>
        </View>

        <ScrollView style={styles.detailScrollView}>
          <View style={styles.detailImageContainer}>
            {event.banner_url ? (
              <Image source={{ uri: `${API_URL}/${event.banner_url}` }} style={styles.eventImage} resizeMode="cover" />
            ) : (
              <View style={[styles.eventImage, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.placeholderText}>{event.event_name}</Text>
              </View>
            )}
            <View style={styles.imageCurve} />
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{event.event_name}</Text>

            <View style={styles.detailInfoContainer}>
              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <CalendarIcon width={20} height={20} />
                </View>
                <View>
                  <Text style={styles.detailInfoTitle}>{formatDate(event.event_date)}</Text>
                </View>
              </View>

              <View style={styles.detailInfoItem}>
                <View style={styles.detailInfoIconContainer}>
                  <LocationIcon width={20} height={20} />
                </View>
                <View>
                  <Text style={styles.detailInfoTitle}>{event.location}</Text>
                  <Text style={styles.detailInfoSubtitle}>{event.event_type} Event</Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.innerscroll}>
              {/* About Event */}
              <View style={styles.aboutContainer}>
                <Text style={styles.aboutTitle}>About Event</Text>
                <Text
                  style={styles.aboutText}
                  numberOfLines={showFullText ? undefined : 3}
                  ellipsizeMode="tail">
                  {event.about}
                </Text>
                <TouchableOpacity onPress={toggleShowFullText}>
                  <Text style={styles.readMoreText}>
                    {showFullText ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Guidelines Section */}
              <View style={styles.guidelinesContainer}>
                <Text style={styles.guidelinesTitle}>Guidelines</Text>

                {/* Registration Guidelines */}
                <View style={styles.guidelineSection}>
                  <View style={styles.guidelineTitleRow}>
                    <View style={styles.diamondBullet} />
                    <Text style={styles.guidelineSectionTitle}>
                      Registration:
                    </Text>
                  </View>
                  <View style={styles.guidelineItems}>
                    <Text style={styles.guidelineItem}>
                      • {event.registration_guidelines}
                    </Text>
                  </View>
                </View>

                {/* Participation Guidelines */}
                <View style={styles.guidelineSection}>
                  <View style={styles.guidelineTitleRow}>
                    <View style={styles.diamondBullet} />
                    <Text style={styles.guidelineSectionTitle}>
                      Participation:
                    </Text>
                  </View>
                  <View style={styles.guidelineItems}>
                    <Text style={styles.guidelineItem}>
                      • {event.participation_guidelines}
                    </Text>
                  </View>
                </View>

                {/* Cancellations Guidelines */}
                {/* <View style={styles.guidelineSection}>
                <View style={styles.guidelineTitleRow}>
                  <View style={styles.diamondBullet} />
                  <Text style={styles.guidelineSectionTitle}>
                    Cancellations:
                  </Text>
                </View>
                <View style={styles.guidelineItems}>
                  <Text style={styles.guidelineItem}>
                    • Cancel at least X hours before if unable to attend.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Frequent no-shows may affect future participation.
                  </Text>
                </View>
              </View>

              // comment - Special Rules Guidelines 
              <View style={styles.guidelineSection}>
                <View style={styles.guidelineTitleRow}>
                  <View style={styles.diamondBullet} />
                  <Text style={styles.guidelineSectionTitle}>
                    Special Rules:
                  </Text>
                </View>
                <View style={styles.guidelineItems}>
                  <Text style={styles.guidelineItem}>
                    • Some events may have limited seats or require prior
                    submissions.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Paid events will have refund policies mentioned.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Virtual events will include a meeting link and
                    instructions.
                  </Text>
                </View>
              </View> */}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const CoordinatorEvent = ({ navigation, route }) => {
  const { coordinatorData, coordinatorGrades } = route.params;
  const [activeGrade, setActiveGrade] = useState();

  const [events, setEvents] = useState({
    'Inter-school': [],
    'In-school': [],
    'National': [],
    'Other': [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (coordinatorGrades) {
      setActiveGrade(coordinatorGrades[0].grade_id)
    }
  }, [coordinatorGrades])

  const fetchEvents = async () => {
    try {

      setRefreshing(true);
      const response = await fetch(`${API_URL}/api/coordinator/events/get?phone=${activeGrade}`);
      const data = await response.json();

      if (data.success) {
        // Group events by type
        const groupedEvents = {
          'Inter-school': [],
          'In-school': [],
          'National': [],
          'Other': [],
        };

        data.events.forEach(event => {
          if (groupedEvents[event.event_type]) {
            groupedEvents[event.event_type].push(event);
          }
        });

        setEvents(groupedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/events/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Event deleted successfully');
        fetchEvents(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeGrade]);

  const handlePressEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
  };

  const handleAddEvent = () => {
    navigation.navigate('AddEventForm', { coordinatorData, activeGrade });
  };

  const onRefresh = () => {
    fetchEvents();
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
      >
        {coordinatorGrades?.map(grade => (
          <TouchableOpacity
            key={grade.grade_id}
            style={[styles.sectionTab, activeGrade === grade.grade_id && styles.activeSectionTab]}
            onPress={() => setActiveGrade(grade.grade_id)}
          >
            <Text style={[styles.sectionTabText, activeGrade === grade.grade_id && styles.activeSectionTabText]}>
              Grade {grade.grade_id}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flex: 300 }}>

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
              onPressEvent={handlePressEvent}
              onDeleteEvent={deleteEvent}
            />
          )}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
        />

        <TouchableOpacity style={styles.floatingButton} onPress={handleAddEvent}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>

      </View>

      <EventDetail
        event={selectedEvent}
        visible={showEventDetail}
        onClose={handleCloseEventDetail}
      />
    </SafeAreaView>
  );
};

export default CoordinatorEvent;