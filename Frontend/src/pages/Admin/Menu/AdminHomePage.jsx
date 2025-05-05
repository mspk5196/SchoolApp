import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import styles from './menustyles';
import Iconlogo from "../../../assets/AdminPage/Menu/Schlimg.svg";
import LogoutIcon from '../../../assets/AdminPage/Menu/LogoutIcon.svg';
import BackIcon from '../../../assets/AdminPage/Menu/BackIcon.svg';
import Mentor from '../../../assets/AdminPage/Menu/Mentor.svg';
import Student from '../../../assets/AdminPage/Menu/Student.svg';
import Logs from '../../../assets/AdminPage/Menu/Logs.svg';
import Coordinator from '../../../assets/AdminPage/Menu/coordinator.svg';
import Schedule from '../../../assets/AdminPage/Menu/Schedule.svg';
import Events from '../../../assets/AdminPage/Menu/Events.svg';
import Calender from '../../../assets/AdminPage/Menu/Calender.svg';
import { Switch } from 'react-native-switch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
// import Graph from '../../assets/Menu/Graph.svg';

const AdminHomePage = ({ navigation, route }) => {
  const {adminData} = route.params;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true)

  const handleMenuPress = menuItem => {
    console.log(`${menuItem} pressed`);

    switch (menuItem) {
      case 'Profile':
        navigation.navigate('AdminSchools');
        break;
      case 'Logout':
        setShowLogoutModal(true);
        break;
      case 'Mentor':
        navigation.navigate('AdminMentorHome');
        break;
      case 'Student':
        navigation.navigate('AdminStudentHome');
        break;
      case 'Logs':
        navigation.navigate('AdminLogs');
        break;
      case 'Schedule':
        navigation.navigate('AdminScheduleHome');
        break;
      case 'Events':
        navigation.navigate('AdminEvent');
        break;
      case 'Calendar':
        navigation.navigate('AdminCalendar');
        break;
      case 'Coordinator':
        navigation.navigate('AdminCoordinatorHome');
        break;
      default:
        console.log('No navigation defined for', menuItem);
    }
  };

  const AdminSwitch = () => {
    if (isAdmin) {
      setIsAdmin(false);
      navigation.navigate('Redirect', { phoneNumber: adminData.phone });
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

  const cancelLogout = () => {
    setShowLogoutModal(false);
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
        <Text style={styles.switchLabel}>Admin</Text>
        <Switch
          value={isAdmin}
          onValueChange={(value) => AdminSwitch(value)}

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
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Student')}>
            <Student width={50} height={50} />
            <Text style={styles.menuText}>Student</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Mentor')}>
            <Mentor width={50} height={50} />
            <Text style={styles.menuText}>Mentor</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Logs')}>
            <Logs width={50} height={50} />
            <Text style={styles.menuText}>Logs</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Schedule')}>
            <Schedule width={50} height={50} />
            <Text style={styles.menuText}>Schedule</Text>
          </Pressable>

        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Coordinator')}>
            <Coordinator width={70} height={70} />
            <Text style={styles.menuText}>Coordinator</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Calendar')}>
            <Calender width={70} height={70} />
            <Text style={styles.menuText}>Calendar</Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Events')}>
            <Events width={60} height={60} />
            <Text style={styles.menuText}>Events</Text>
          </Pressable>

          {/* <Pressable
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Pictorial graph')}>
            <Graph width={60} height={60} />
            <Text style={styles.menuText}>Pictorial graph</Text>
          </Pressable> */}

        </View>


      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Are you sure to log out from this device?
            </Text>

            <View style={styles.modalButtonsContainer}>
              <Pressable style={styles.cancelButton} onPress={cancelLogout}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminHomePage;
