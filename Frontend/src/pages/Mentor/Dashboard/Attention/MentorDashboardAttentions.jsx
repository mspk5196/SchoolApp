import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import Arrow from '../../../../assets/MentorPage/arrow.svg';
import styles from './Attentionssty';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Profile from '../../../../assets/MentorPage/profile.png';

const MentorDashboardAttentions = ({navigation}) => {
  const [accepted, setAccepted] = useState(false);
  const [hideCard, setHideCard] = useState(false);

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
            <Arrow width={wp('9%')} height={wp('9%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Attentions</Text>
      </View>
      <View style={styles.headerBorder} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardSection}>
          <View style={[styles.card, styles.cardPeach]}>
            <Image source={Profile} style={styles.avatar} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>Prakash Raj</Text>
              <Text style={styles.id}>2024VI023</Text>
              <Text style={styles.assessment}>Level 2 Assessment</Text>
            </View>
            <View style={styles.subjectBox}>
              <Text style={styles.subject}>Science</Text>
              <Text style={styles.daysOrange}>4 days</Text>
            </View>
          </View>

          <View style={[styles.card, styles.cardPeach]}>
            <Image source={Profile} style={styles.avatar} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>Prakash Raj</Text>
              <Text style={styles.id}>2024VI023</Text>
              <Text style={styles.assessment}>Level 2 Assessment</Text>
            </View>
            <View style={styles.subjectBox}>
              <Text style={styles.subject}>Science</Text>
              <Text style={styles.daysOrange}>4 days</Text>
            </View>
          </View>

          {!hideCard && (
            <Text style={styles.subHeading}>Tasks from coordinator</Text>
          )}

          {!hideCard && (
            <View style={[styles.card, styles.cardPink]}>
              <Image source={Profile} style={styles.avatar} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>Prakash Raj</Text>
                <Text style={styles.id}>2024VI023</Text>
                <Text style={styles.assessment}>Level 2 Assessment</Text>
              </View>
              <View style={styles.subjectBox}>
                <Text style={styles.subject}>Science</Text>
                <Text style={styles.daysRed}>11 days</Text>
              </View>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  if (!accepted) {
                    setAccepted(true);
                  } else {
                    setHideCard(true); 
                  }
                }}>
                <Text style={styles.acceptText}>
                  {accepted ? 'Completed' : 'Accept task'}
                </Text>
              </TouchableOpacity>

              {accepted && (
                <Text style={styles.acceptedDateText}>
                  Task Accept on {formattedDate}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MentorDashboardAttentions;
