import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Switch } from 'react-native-switch';
import styles from "./MenuStyle";
import Iconlogo from "../../../assets/CoordinatorPage/Menu/IconProfile.svg";
import LogoutIcon from '../../../assets/CoordinatorPage/Menu/LogoutIcon.svg';
import BackIcon from '../../../assets/CoordinatorPage/Menu/BackIcon.svg';
import Mentor from '../../../assets/CoordinatorPage/Menu/Mentor.svg';
import Student from '../../../assets/CoordinatorPage/Menu/Student.svg';
import Material from '../../../assets/CoordinatorPage/Menu/Material.svg';
import Logs from '../../../assets/CoordinatorPage/Menu/Logs.svg';
import Schedule from '../../../assets/CoordinatorPage/Menu/Schedule.svg';
import Events from '../../../assets/CoordinatorPage/Menu/Events.svg';
import Calender from '../../../assets/CoordinatorPage/Menu/Calender.svg';
import Request from '../../../assets/CoordinatorPage/Menu/Request.svg';
import Enrollment from '../../../assets/CoordinatorPage/Menu/Enrollment.svg';
import Messages from '../../../assets/Genreal/message.svg';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

const CoordinatorMenu = ({ navigation }) => {
  const [isCoordinator, setIsCoordinator] = useState(true);
  const [coordinatorData, setCoordinatorData] = useState({});
  const [coordinatorGrades, setCoordinatorGrades] = useState({});

  const coordinatorSwitch = () => {
    if (isCoordinator) {
      setIsCoordinator(false);
      navigation.navigate('Redirect', { phoneNumber: coordinatorData.phone });
    }
  }

  const handleLogout = async () => {
    try {
      // Remove the user data from AsyncStorage
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('userRoles');

      // You can clear any other data if needed, like admin or coordinator data
      await AsyncStorage.removeItem('adminData');
      await AsyncStorage.removeItem('coordinatorData');
      await AsyncStorage.removeItem('coordinatorGrades');
      await AsyncStorage.removeItem('studentData');
      await AsyncStorage.removeItem('mentorData');

      // Show a logout confirmation (optional)
      Alert.alert('Logged Out', 'You have successfully logged out.');

      // Redirect to the Welcome or Login screen

      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],  // Navigate to the Welcome screen after logout
      });

    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'There was an issue logging out. Please try again.');
    }
  };

  useEffect(() => {
    const fetchCoordinatorData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('coordinatorData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setCoordinatorData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const fetchCoordinatorGrades = async () => {
      try {
        const storedData = await AsyncStorage.getItem('coordinatorGrades');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setCoordinatorGrades(parsedData);
        }
      } catch (error) {
        console.error('Error fetching grades data:', error);
      }
    };
    fetchCoordinatorData();
    fetchCoordinatorGrades();
  }, [])

  const handleMenuPress = (menuItem) => {
    console.log(`${menuItem} pressed`);

    switch (menuItem) {
      case 'Profile':
        navigation.navigate('CoordinatorProfile', { coordinatorData, coordinatorGrades });
        break;
      case 'Logout':
        // navigation.navigate('Login');
        handleLogout();
        break;
      case 'Mentor':
        navigation.navigate('CoordinatorMentor', { coordinatorData, coordinatorGrades });
        break;
      case 'Student':
        navigation.navigate('CoordinatorStudent', { coordinatorData, coordinatorGrades });
        break;
      case 'Materials':
        navigation.navigate('CoordinatorMaterialHome', { coordinatorData, coordinatorGrades });
        break;
      case 'Logs':
        navigation.navigate('CoordinatorLogs', { coordinatorData, coordinatorGrades });
        break;
      case 'Schedule':
        navigation.navigate('CoordinatorScheduleHome', { coordinatorData, coordinatorGrades });
        break;
      case 'Events':
        navigation.navigate('CoordinatorEvent', { coordinatorData, coordinatorGrades });
        break;
      case 'Calendar':
        navigation.navigate('CoordinatorCalendar', { coordinatorData, coordinatorGrades });
        break;
      case 'Request':
        navigation.navigate('CoordinatorRequest', { coordinatorData, coordinatorGrades });
        break;
      case 'Enrollment':
        navigation.navigate('CoordinatorEnrollmentHome', { coordinatorData, coordinatorGrades });
        break;
      case 'Messages':
        navigation.navigate('CoordinatorMessageHome', { coordinatorData, coordinatorGrades });
        break;
      default:
        console.log('No navigation defined for', menuItem);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <Pressable onPress={() => navigation.navigate('Redirect')}>
            <BackIcon width={28} height={28} />
          </Pressable>
          <Text style={styles.title}>Menu</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={() => handleMenuPress('Profile')}>
            <Iconlogo style={styles.profile} />
          </Pressable>
          <Pressable onPress={() => handleMenuPress('Logout')}>
            <LogoutIcon style={styles.logout} />
          </Pressable>
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Coordinator</Text>
        <Switch
          value={isCoordinator}
          onValueChange={(value) => coordinatorSwitch(value)}

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

      <ScrollView style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Mentor')}
          >
            <Mentor width={50} height={50} />
            <Text style={styles.menuText}>Mentor</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Student')}
          >
            <Student width={50} height={50} />
            <Text style={styles.menuText}>Student</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Materials')}
          >
            <Material width={50} height={50} />
            <Text style={styles.menuText}>Materials</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Logs')}
          >
            <Logs width={50} height={50} />
            <Text style={styles.menuText}>Logs</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Schedule')}
          >
            <Schedule width={50} height={50} />
            <Text style={styles.menuText}>Schedule</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Events')}
          >
            <Events width={60} height={60} />
            <Text style={styles.menuText}>Events</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Calendar')}
          >
            <Calender width={70} height={70} />
            <Text style={styles.menuText}>Calendar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Request')}
          >
            <Request width={50} height={50} />
            <Text style={styles.menuText}>Request</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Enrollment')}
          >
            <Enrollment width={50} height={50} />
            <Text style={styles.menuText}>Enrollment</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => handleMenuPress('Messages')}
          >
            <Messages width={50} height={50} />
            <Text style={styles.menuText}>Messages</Text>
          </Pressable>
        </View>

      </ScrollView>
    </ScrollView>
  );
};

export default CoordinatorMenu;