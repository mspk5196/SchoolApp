import React, {useState} from 'react';
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
import Mainimg from '../../../../assets/Event/eventdetailsimg.jpeg';
import PreviousIcon from '../../../../assets/LeaveIcon/PrevBtn.svg';
import Liked from '../../../../assets/Event/liked.svg';
import Unliked from '../../../../assets/Event/unliked.svg';
import Location from '../../../../assets/Event/Detailslocation.svg';
import Calendericon from '../../../../assets/Event/Date.svg';

const EventDetailsScreen = ({navigation}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

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
            <Image
              source={Mainimg}
              style={styles.eventImage}
              resizeMode="cover"
            />
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
            <Text style={styles.eventTitle}>National Chess</Text>
            <Text style={styles.eventTitle}>Competition</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            {/* Date and Time */}
            <View style={styles.detailRow}>
              <Calendericon />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>14 December, 2021</Text>
                <Text style={styles.detailSubtitle}>
                  Tuesday, 4:00PM - 9:00PM
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <Location />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailTitle}>Gala Convention Center</Text>
                <Text style={styles.detailSubtitle}>
                  36 Guild Street London, UK
                </Text>
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
                Enjoy your favorite dish and a lovely your friends and family
                and have a great time. Food from local food trucks will be
                available for purchase. Enjoy your favorite dish and a lovely
                your friends and family and have a great time.
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
                    • Parents can register via the parent portal by filling out
                    the required details.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Registration closes X days before the event.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Confirmation will be sent via email/SMS with entry
                    details.
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
                    • Arrive X minutes before the event starts.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • QR code or ticket (if issued) must be shown at entry.
                  </Text>
                  <Text style={styles.guidelineItem}>
                    • Students must follow event rules; misbehavior may lead to
                    disqualification.
                  </Text>
                </View>
              </View>

              {/* Cancellations Guidelines */}
              <View style={styles.guidelineSection}>
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

              {/* Special Rules Guidelines */}
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
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Fixed Register Button (outside ScrollView) */}
      <View style={styles.registerButtonContainer}>
        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EventDetailsScreen;
