import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Switch, Pressable,ScrollView } from "react-native";
import styles from "./MenuStyle";
import Iconlogo from "../../assets/Menu/IconProfile.svg";
import LogoutIcon from '../../assets/Menu/LogoutIcon.svg';
import BackIcon from '../../assets/Menu/BackIcon.svg';
import Mentor from '../../assets/Menu/Mentor.svg';
import Student from '../../assets/Menu/Student.svg';
import Material from '../../assets/Menu/Material.svg';
import Logs from '../../assets/Menu/Logs.svg';
import Schedule from '../../assets/Menu/Schedule.svg';
import Events from '../../assets/Menu/Events.svg';
import Calender from '../../assets/Menu/Calender.svg';
import Request from '../../assets/Menu/Request.svg';
import Enrollment from '../../assets/Menu/Enrollment.svg';

const Menupage = ({ navigation }) => {
  const [isCoordinator, setIsCoordinator] = useState(false);
    const handleMenuPress = (menuItem) => {
    console.log(`${menuItem} pressed`);
    
    switch(menuItem) {
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Logout':
        navigation.navigate('Login');
        break;
      case 'Mentor':
        navigation.navigate('Mentor');
        break;
      case 'Student':
        navigation.navigate('Student');
        break;
      case 'Materials':
        navigation.navigate('MaterialHome');
        break;
      case 'Logs':
        navigation.navigate('Logs');
        break;
      case 'Schedule':
        navigation.navigate('ScheduleHome');
        break;
      case 'Events':
        navigation.navigate('Event');
        break;
      case 'Calendar':
        navigation.navigate('Calendar');
        break;
      case 'Request':
        navigation.navigate('RequestHome');
        break;
      case 'Enrollment':
        navigation.navigate('Enrollment');
        break;  
      default:
        console.log('No navigation defined for', menuItem);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <Pressable onPress={() => navigation.goBack()}>
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
          trackColor={{ false: "#D9D9D9", true: "#2563EB" }}
          thumbColor={"#FFFFFF"}
          ios_backgroundColor="#D9D9D9"
          style={{ marginRight: 15 }}
          value={isCoordinator}
          onValueChange={(value) => setIsCoordinator(value)}
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
    </SafeAreaView>
  );
};

export default Menupage;