import React from 'react';
import {SafeAreaView, View, Text, Image, TouchableOpacity} from 'react-native';
import BackIcon from '../../assets/GeneralAssests/backarrow.svg';
import ProfileIcon from '../../assets/Profile/profile.png';
import Total from '../../assets/Profile/total.svg';
import Present from '../../assets/Profile/present.svg';
import Leave from '../../assets/Profile/leave.svg';
import Home from '../../assets/Profile/home.svg';
import Leave2 from '../../assets/Profile/leave2.svg';
import Grade from '../../assets/Profile/grade.svg';
import styles from './ProfileStyle';


const Profile = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackIcon 
          width={styles.BackIcon.width} 
          height={styles.BackIcon.height} 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTxt}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileContainer}>
        <Image source={ProfileIcon} style={styles.profileImage} />
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>Ram Kumar</Text>
          <Text style={styles.phone}>7376232206</Text>
          <View style={styles.gradeContainer}>
            <Grade width={18} height={18}/>
            <Text style={styles.grade}> Grade : VI - A</Text>
          </View>
        </View>
      </View>

      <View style={styles.attendanceCard}>
        <Text style={styles.attendanceTitle}>Attendance</Text>
        <Text style={{...styles.percentValue, fontSize: 30}}>70%</Text>

        <View style={styles.attendanceDetails}>
          <View style={styles.attendanceItem}>
            <Total width={36} height={36} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Total</Text>
              <Text style={styles.attendanceNumber}>56</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Present width={36} height={36} />
            <View style={styles.attendanceTextContainer}>
              <Text style={styles.attendanceText}>Present</Text>
              <Text style={styles.attendanceNumber}>53</Text>
            </View>
          </View>
          <View style={styles.attendanceItem}>
            <Leave width={36} height={36} />
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

      <TouchableOpacity style={styles.leaveButton} onPress={() => navigation.navigate('LeaveApply')}>
        <Leave2 width={32} height={32} />
        <Text style={styles.leaveButtonText}>Leave Apply</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton}>
        <Home width={30} height={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Profile;