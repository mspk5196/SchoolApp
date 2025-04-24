import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, Pressable, ScrollView, Modal} from 'react-native';
import styles from './menustyles';
import Iconlogo from "../../assets/Menu/Schlimg.svg";
import LogoutIcon from '../../assets/Menu/LogoutIcon.svg';
import BackIcon from '../../assets/Menu/BackIcon.svg';
import Mentor from '../../assets/Menu/Mentor.svg';
import Student from '../../assets/Menu/Student.svg';
import Logs from '../../assets/Menu/Logs.svg';
import Coordinator from '../../assets/Menu/coordinator.svg';
import Schedule from '../../assets/Menu/Schedule.svg';
import Events from '../../assets/Menu/Events.svg';
import Calender from '../../assets/Menu/Calender.svg';
import {Switch} from 'react-native-switch';
import Graph from '../../assets/Menu/Graph.svg';

const Menupage = ({navigation}) => {
  // const [isCoordinator, setIsCoordinator] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleMenuPress = menuItem => {
    console.log(`${menuItem} pressed`);

    switch (menuItem) {
      case 'Profile':
        navigation.navigate('Schools');
        break;
      case 'Logout':
        setShowLogoutModal(true);
        break;
      case 'Mentor':
        navigation.navigate('Mentor');
        break;
      case 'Student':
        navigation.navigate('Student');
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
      case 'Coordinator':
        navigation.navigate('Coordinator');
        break;
      case 'Pictorial graph':
        navigation.navigate('PictorialGraph');
        break;
      default:
        console.log('No navigation defined for', menuItem);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigation.navigate('Login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSwitch = () => {
    setIsCoordinator(prevState => !prevState);
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
                  // value={selectedRole === role}
                  // onValueChange={(asdfg) => handleRoleSelect(asdfg)}
            
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
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Student')}>
            <Student width={50} height={50} />
            <Text style={styles.menuText}>Student</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
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
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Logs')}>
            <Logs width={50} height={50} />
            <Text style={styles.menuText}>Logs</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
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
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Coordinator')}>
            <Coordinator width={70} height={70} />
            <Text style={styles.menuText}>Coordinator</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
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
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Events')}>
            <Events width={60} height={60} />
            <Text style={styles.menuText}>Events</Text>
          </Pressable>

        <Pressable
            style={({pressed}) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => handleMenuPress('Pictorial graph')}>
            <Graph width={60} height={60} />
            <Text style={styles.menuText}>Pictorial graph</Text>
          </Pressable>
          
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

export default Menupage;
