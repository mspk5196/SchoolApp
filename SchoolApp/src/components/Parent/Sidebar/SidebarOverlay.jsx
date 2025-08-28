import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  FlatList,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileIcon from '../../../assets/ParentPage/SidebarSvg/profile.svg';
import CalanderIcon from '../../../assets/ParentPage/SidebarSvg/calander.svg';
import EventsIcon from '../../../assets/ParentPage/SidebarSvg/events.svg';
import LeaveIcon from '../../../assets/ParentPage/SidebarSvg/leave.svg';
import PhonebookIcon from '../../../assets/ParentPage/SidebarSvg/phonebook.svg';
import RequestIcon from '../../../assets/ParentPage/SidebarSvg/requests.svg';
import SettingIcon from '../../../assets/ParentPage/SidebarSvg/setting.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native-switch';

import EventBus from "../../../utils/EventBus";

const { width } = Dimensions.get('window');
const sidebarWidth = width * 0.6;

const MenuItem = ({ Icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon width={24} height={24} style={styles.menuIcon} />
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

const UserToggle = ({ name, isActive, onToggle }) => (
  <View style={styles.userToggleItem}>
    <Text style={styles.userName}>{name}</Text>

    <Switch
      value={isActive}
      onValueChange={onToggle}

      // Track Colors
      backgroundActive="#2962ff"
      backgroundInactive="#dcdcdc"

      // Thumb (circle)
      circleActiveColor="#ffffff"
      circleInActiveColor="#ffffff"

      // Sizes
      barHeight={28}
      circleSize={22}
      switchWidthMultiplier={2.4}

      // Style tweaks
      renderActiveText={false}
      renderInActiveText={false}
      changeValueImmediately={true}
      innerCircleStyle={{ elevation: 4, borderColor: 'white' }}
    />

  </View>
);

const SidebarOverlay = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(sidebarWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const [activeUser, setActiveUser] = useState(null);

  const [studentData, setStudent] = useState([]);
  const [activeUsers, setActiveUsers] = useState({});

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: sidebarWidth,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setShouldRender(false));
    }
  }, [visible, slideAnim, fadeAnim]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem("studentData");
        if (storedStudents) {
          const parsedStudents = JSON.parse(storedStudents);

          // Check if activeUser exists in storage
          let storedActiveUser = await AsyncStorage.getItem("activeUser");
          if (!storedActiveUser && parsedStudents.length > 0) {
            // Set first student as active by default
            storedActiveUser = parsedStudents[0].name;
            await AsyncStorage.setItem("activeUser", storedActiveUser);
          }

          setStudent(parsedStudents);

          // Initialize active users state
          const initialActiveUsers = {};
          parsedStudents.forEach(student => {
            initialActiveUsers[student.name] = student.name === storedActiveUser;
          });

          setActiveUsers(initialActiveUsers);
          setActiveUser(storedActiveUser);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleMenuItemPress = (menuItem) => {
    // Navigate to the corresponding screen based on the menu item
    switch (menuItem) {
      case 'Profile':
        navigation.navigate('StudentPageProfile');
        break;
      case 'Calendar':
        navigation.navigate('StudentPageCalendar');
        break;
      case 'Events':
        navigation.navigate('StudentPageEvents');
        break;
      case 'Leave Apply':
        navigation.navigate('StudentPageLeaveDetails');
        break;
      case 'Phonebook':
        navigation.navigate('StudentPagePhonebook');
        break;
      case 'Request':
        navigation.navigate('StudentPageRequest');
        break;
      case 'Settings':
        navigation.navigate('StudentPageSettings');
        break;
      default:
        break;
    }

    // Close the sidebar after navigation
    onClose();
  };

  const toggleUser = async (userName) => {
    if (activeUser === userName) {
      // If the active user is toggled OFF, go to Redirect page
      await AsyncStorage.removeItem("activeUser");
      setActiveUser(null);
      onClose();
      navigation.navigate('Redirect', { skipAutoNavigate: true });
      EventBus.emit("noActiveUser");
      return;
    }

    // Set only the selected user as active, others as inactive
    const updatedActiveUsers = {};
    studentData.forEach(student => {
      updatedActiveUsers[student.name] = student.name === userName;
    });
    setActiveUsers(updatedActiveUsers);
    setActiveUser(userName);
    await AsyncStorage.setItem("activeUser", userName);

    // Fetch and update studentData for the selected student
    const selectedStudent = studentData.find(student => student.name === userName);
    if (selectedStudent) {
      // Optionally, fetch fresh data from API here if needed
      // Example:
      // const response = await fetch(`${API_URL}/api/getStudentData`, { ... });
      // const data = await response.json();
      // await AsyncStorage.setItem("studentData", JSON.stringify(data.student));

      // For now, just store the selected student as an array (to match your usage)
      await AsyncStorage.setItem("studentData", JSON.stringify([selectedStudent]));
    }

    EventBus.emit("userToggled");
  };

  if (!shouldRender) return null;

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuContainer}>
          <View>
            <MenuItem Icon={ProfileIcon} title="Profile" onPress={() => handleMenuItemPress('Profile')} />
            <MenuItem Icon={CalanderIcon} title="Calendar" onPress={() => handleMenuItemPress('Calendar')} />
            <MenuItem Icon={EventsIcon} title="Events" onPress={() => handleMenuItemPress('Events')} />
            <MenuItem Icon={LeaveIcon} title="Leave Apply" onPress={() => handleMenuItemPress('Leave Apply')} />
            <MenuItem Icon={PhonebookIcon} title="Phonebook" onPress={() => handleMenuItemPress('Phonebook')} />
            <MenuItem Icon={RequestIcon} title="Request" onPress={() => handleMenuItemPress('Request')} />
            <MenuItem Icon={SettingIcon} title="Settings" onPress={() => handleMenuItemPress('Settings')} />
          </View>
          <View style={styles.userSection}>
            <Text style={styles.userSectionTitle}>User</Text>
            <FlatList
              vertical
              data={studentData}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <UserToggle
                  name={item.name}
                  isActive={activeUsers[item.name] || false}
                  onToggle={() => toggleUser(item.name)}
                />
              )}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  backdropTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: sidebarWidth,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 15,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    justifyContent: 'space-between',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  userSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  userSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  userToggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userName: {
    fontSize: 16,
    width: 100,
    color: '#000',
  },
});

export default SidebarOverlay;