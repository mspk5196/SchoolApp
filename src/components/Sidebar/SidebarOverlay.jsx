import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Switch,
  Animated,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileIcon from '../../assets/SidebarSvg/profile.svg';
import CalanderIcon from '../../assets/SidebarSvg/calander.svg';
import EventsIcon from '../../assets/SidebarSvg/events.svg';
import LeaveIcon from '../../assets/SidebarSvg/leave.svg';
import PhonebookIcon from '../../assets/SidebarSvg/phonebook.svg';
import RequestIcon from '../../assets/SidebarSvg/requests.svg';
import SettingIcon from '../../assets/SidebarSvg/setting.svg';

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
      trackColor={{ false: '#f4f3f4', true: '#4169E1' }}
      thumbColor={isActive ? '#ffffff' : '#f4f3f4'}
    />
  </View>
);

const SidebarOverlay = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(sidebarWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const [activeUser, setActiveUser] = useState('Vishal');

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

  const handleMenuItemPress = (menuItem) => {
    // console.log(`${menuItem} pressed`);
    
    // Navigate to the corresponding screen based on the menu item
    switch(menuItem) {
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Calendar':
        navigation.navigate('Calendar');
        break;
      case 'Events':
        navigation.navigate('Events');
        break;
      case 'Leave Apply':
        navigation.navigate('LeaveApply');
        break;
      case 'Phonebook':
        navigation.navigate('Phonebook');
        break;
      case 'Request':
        navigation.navigate('Request');
        break;
      case 'Settings':
        navigation.navigate('Settings');
        break;
      default:
        // Default case if needed
        break;
    }
    
    // Close the sidebar after navigation
    onClose();
  };

  const toggleUser = (user) => {
    setActiveUser(user); 
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
            <UserToggle name="Vishal" isActive={activeUser === 'Vishal'} onToggle={() => toggleUser('Vishal')} />
            <UserToggle name="Mahesh" isActive={activeUser === 'Mahesh'} onToggle={() => toggleUser('Mahesh')} />
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
    color: '#000',
  },
});

export default SidebarOverlay;