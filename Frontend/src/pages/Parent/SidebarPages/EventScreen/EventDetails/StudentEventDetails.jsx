import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import styles from './EventDetailsStyles';
import Mainimg from '../../../../../assets/ParentPage/Event/eventdetailsimg.jpeg';
import PreviousIcon from '../../../../../assets/ParentPage/LeaveIcon/PrevBtn.svg';
import Liked from '../../../../../assets/ParentPage/Event/liked.svg';
import Unliked from '../../../../../assets/ParentPage/Event/unliked.svg';
import Location from '../../../../../assets/ParentPage/Event/Detailslocation.svg';
import Calendericon from '../../../../../assets/ParentPage/Event/Date.svg';
import { API_URL } from '@env'

const StudentEventDetails = ({ navigation, route }) => {
  const { event, title } = route.params;
  // console.log(event);

  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
    });
  };

  // <CurvedImageBanner imageSource={{ uri: `${API_URL}/${event.banner_url}` }} />

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.scrollContainer}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation && navigation.goBack()}>
            <PreviousIcon size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Events</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Event Image */}
          <View style={styles.imageContainer}>
            {/* <Image
              source={Mainimg}
              style={styles.eventImage}
              resizeMode="cover"
            /> */}
            {event.banner_url ? (
              <Image source={{ uri: `${API_URL}/${event.banner_url}` }} style={styles.eventImage} resizeMode="cover" />
            ) : (
              <View style={[styles.eventImage, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.placeholderText}>{event.event_name}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite()}>
              {isFavorite ? (
                <Liked width={35} height={35} />
              ) : (
                <Unliked width={35} height={35} />
              )}
            </TouchableOpacity>
            <View style={styles.imageCurve} />
          </View>

          {/* Rest of your content... */}
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{event.event_name}</Text>
            <Text style={styles.eventTitle}>{event.event_type}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            {/* Date and Time */}
            <View style={styles.detailRow}>
              <Calendericon />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>{formatDate(event.event_date)}</Text>
                <Text style={styles.detailSubtitle}>
                  {formatTime(event.event_date)}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <Location />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>{event.location}</Text>
                {/* <Text style={styles.detailSubtitle}>
                  36 Guild Street London, UK
                </Text> */}
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
        </ScrollView>
      </View>

      {/* Fixed Register Button (outside ScrollView) */}
      {title === 'Registered Events' ? (
        <View style={{flex:0}}></View>
      ) : (
        <View style={styles.registerButtonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("StudentPageEventRegister", { event })}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
};

export default StudentEventDetails;
