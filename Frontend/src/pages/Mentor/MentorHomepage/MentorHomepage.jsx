import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TouchableOpacity, Alert } from "react-native";
import styles from "./MentorHomepagesty";
import { Switch } from 'react-native-switch';
import Iconlogo from "../../../assets/MentorPage/Group.svg";
import Icon from '../../../assets/MentorPage/ic_round-logout.svg';
import Logo from '../../../assets/MentorPage/backicon.svg';
import Dashboard from '../../../assets/MentorPage/Dashboard.svg';
import Approve from '../../../assets/MentorPage/Approve.svg';
import Homework from '../../../assets/MentorPage/noto_books.svg';
import Message from '../../../assets/MentorPage/message.svg';
import Activity from '../../../assets/MentorPage/activity.svg';
import AssessmentRequest from '../../../assets/MentorPage/newspaper.svg';
import { CommonActions, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutModal from "../../../components/Logout/LogoutModal";

const MentorHomepage = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [isMentor, setIsMentor] = useState(true);
  const [phone, setPhone] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchPhone = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone');
      if (storedPhone) {
        const parsedPhone = JSON.parse(storedPhone);
        setPhone(parsedPhone);
      }
    } catch (error) {
      console.error('Error fetching phone:', error);
    }
  };

  useEffect(() => {
    fetchPhone();
  }, [])

  const mentorSwitch = () => {
    if (isMentor) {
      setIsMentor(false);
      navigation.navigate('Redirect', { phoneNumber: phone });
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.page}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Logo style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MentorProfileDetails', { mentorData })}>
          <Iconlogo style={styles.profile} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
          <Icon style={styles.logout} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Mentor</Text>
        <View style={styles.switch}>
          <Switch
            value={isMentor}
            onValueChange={(value) => mentorSwitch(value)}

            // Track Colors
            backgroundActive="#2962ff"
            backgroundInactive="#dcdcdc"

            // Thumb (circle)
            circleActiveColor="#ffffff"
            circleInActiveColor="#ffffff"

            // Sizes
            barHeight={30}
            circleSize={24}
            switchWidthMultiplier={2.3}

            // Style tweaks
            renderActiveText={false}
            renderInActiveText={false}
            changeValueImmediately={true}
            innerCircleStyle={{ elevation: 4, borderColor: 'white' }}
          />
        </View>
      </View>

      <View style={styles.mainpage}>
        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorDashboard', { mentorData })}>
            <Dashboard style={styles.icons} />
            <Text style={styles.menutitle}>Dashboard</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorStudentLeaveApproval', { mentorData })}>
            <Approve style={styles.icons} />
            <Text style={styles.menutitle}>Approval</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorHomeworkList', { mentorData })}>
            <Homework style={styles.icons} />
            <Text style={styles.menutitle}>Homework</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorMessages', { mentorData })}>
            <Message style={styles.icons} />
            <Text style={styles.menutitle}>Messages</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorActivity', { mentorData })}>
            <Activity style={styles.icons1} />
            <Text style={styles.menutitle1}>Activity</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorAssesmentRequest', { mentorData })}>
            <AssessmentRequest style={styles.icons1} />
            <Text style={styles.menutitle1}>Assessment Request</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('MentorMaterialHome', { mentorData })}>
            <Homework style={styles.icons} />
            <Text style={styles.menutitle}>Materials</Text>
          </Pressable>
        </View>
        <LogoutModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          navigation={navigation}
        />
      </View>
    </View>
  );
};

export default MentorHomepage;
