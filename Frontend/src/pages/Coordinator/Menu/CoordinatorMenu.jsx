import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, ScrollView } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

const CoordinatorMenu = ({ navigation }) => {
  const [isCoordinator, setIsCoordinator] = useState(true);  
  const [coordinatorData, setCoordinatorData] = useState({});

  const coordinatorSwitch = () => {
    if(isCoordinator){
      setIsCoordinator(false);
      navigation.navigate('Redirect', {phoneNumber:coordinatorData.phone});
    }
  }
 
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Clear user data
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }], // Redirect to Login screen
        })
      );
    } catch (error) {
      console.error('Error logging out:', error);
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
        console.error('Error fetching roles:', error);
      }
    };
    fetchCoordinatorData();
  }, [])

  const handleMenuPress = (menuItem) => {
    console.log(`${menuItem} pressed`);

    switch (menuItem) {
      case 'Profile':
        navigation.navigate('CoordinatorProfile', { coordinatorData });
        break;
      case 'Logout':
        // navigation.navigate('Login');
        handleLogout();
        break;
      case 'Mentor':
        navigation.navigate('CoordinatorMentor',{ coordinatorData });
        break;
      case 'Student':
        navigation.navigate('CoordinatorStudent',{ coordinatorData });
        break;
      case 'Materials':
        navigation.navigate('CoordinatorMaterialHome', { coordinatorData });
        break;
      case 'Logs':
        navigation.navigate('CoordinatorLogs',{ coordinatorData });
        break;
      case 'Schedule':
        navigation.navigate('CoordinatorScheduleHome',{ coordinatorData });
        break;
      case 'Events':
        navigation.navigate('CoordinatorEvent',{ coordinatorData });
        break;
      case 'Calendar':
        navigation.navigate('CoordinatorCalendar',{ coordinatorData });
        break;
      case 'Request':
        navigation.navigate('CoordinatorRequest'); 
        break;
      case 'Enrollment':
        navigation.navigate('CoordinatorEnrollmentHome',{ coordinatorData });
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
          </View>
      </ScrollView>
    </ScrollView>
  );
};

export default CoordinatorMenu;