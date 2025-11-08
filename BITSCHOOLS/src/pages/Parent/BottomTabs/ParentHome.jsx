import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../utils/ApiService';

const Tab = createBottomTabNavigator();

// Dashboard Tab
const DashboardScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {userData?.first_name || 'Parent'}!
        </Text>
        <Text style={styles.subText}>Track your child's progress and activities</Text>
      </View>
    </View>
  );
};

// Children Tab
const ChildrenScreen = () => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Children</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Children list will appear here</Text>
      </View>
    </View>
  );
};

// Attendance Tab
const AttendanceScreen = () => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Attendance records will appear here</Text>
      </View>
    </View>
  );
};

// Messages Tab
const MessagesScreen = () => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Messages will appear here</Text>
      </View>
    </View>
  );
};

// Profile Tab
const ProfileScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#ffffff" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ParentHome = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Children') {
            iconName = 'account-group';
          } else if (route.name === 'Attendance') {
            iconName = 'calendar-check';
          } else if (route.name === 'Messages') {
            iconName = 'message-text';
          } else if (route.name === 'Profile') {
            iconName = 'account-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Children" component={ChildrenScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ParentHome;
