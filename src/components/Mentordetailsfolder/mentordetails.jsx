import React from 'react';
import {SafeAreaView, View, Text, Image, TouchableOpacity} from 'react-native';
import {  widthPercentageToDP as wp,  heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import Arrow from '../../assets/arrow.svg';
import Profile from '../../assets/profile.png';
import Total from '../../assets/total.svg';
import Present from '../../assets/present.svg';
import Leave from '../../assets/leave.png';
import Home from '../../assets/home.svg';
import Leave2 from '../../assets/leave2.svg';
import Grade from '../../assets/grade.svg';
import styles from './mentordetailssty';


const MentorDetails = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() =>navigation.goBack()}>
          <Arrow width={wp('8%')} height={wp('8%')} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mentor Details</Text>
      </View>
      <View style={styles.headerBorder} />

      <View style={styles.card}>
        <View style={styles.profileContainer}>
          <Image source={Profile} style={styles.profileImage} />
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>Ram Kumar</Text>
          <Text style={styles.phone}>7376232206</Text>
          <View style={styles.gradeContainer}>
            <Grade />
            <Text style={styles.grade}> Grade : VI - A</Text>
          </View>
        </View>
      </View>

      <View style={styles.attendanceCard}>
        <Text style={styles.attendanceTitle}>Attendance</Text>
        <Text style={{...styles.percentValue, fontSize: wp('8%')}}>70%</Text>

        <View style={styles.attendanceDetails}>
          <View style={styles.attendanceItem}>
            <Total width={wp('9%')} height={wp('9%')} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Total</Text>
              <Text style={styles.attendanceNumber}>56</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Present width={wp('9%')} height={wp('9%')} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Present</Text>
              <Text style={styles.attendanceNumber}>53</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Image source={Leave} style={styles.attendanceIcon} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Leave</Text>
              <Text style={styles.attendanceNumber}>3</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.leftColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Subject:</Text> Maths, Social
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Issues:</Text> 01
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Mentor For:</Text> Grade 5
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Handling:</Text> Class 1,5,7
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={() => navigation.navigate("LeaveApply")}>
        <Leave2 width={wp('8%')} height={wp('8%')} />
        <Text style={styles.leaveButtonText}>Leave Apply</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=> navigation.navigate("MentorHomepage")}
        style={{
          ...styles.homeButton,
          width: wp('17.5%'),
          height: wp('17.5%'),
        }}>
        <Home width={wp('9%')} height={wp('9%')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MentorDetails;
