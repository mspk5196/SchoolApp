import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, ToastAndroid } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native-switch';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ApiService from '../../utils/ApiService';

const Redirect = ({ route }) => {
  const navigation = useNavigation();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [exitApp, setExitApp] = useState(false);

  const { phoneNumber } = route.params;
  const [skipAutoNavigate, setSkipAutoNavigate] = useState(!!route.params?.skipAutoNavigate);

  useEffect(() => {
    const backAction = () => {
      if (navigation.isFocused()) {
        if (exitApp) {
          BackHandler.exitApp();
        } else {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          setExitApp(true);
          setTimeout(() => setExitApp(false), 2000);
          return true;
        }
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [exitApp, navigation]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await ApiService.makeRequest(`/general/getUserRoles`, {
          method: 'POST',
          body: JSON.stringify({ phoneNumber }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          const parsedRoles = data.data;
          
          setRoles(parsedRoles);

          if (parsedRoles.length === 1 && !skipAutoNavigate) {
            handleRoleSelect(parsedRoles[0]);
          }
        } else {
          console.error('Failed to fetch roles:', data.message);
          Alert.alert('Error', data.message || 'Failed to fetch user roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        Alert.alert('Error', 'Failed to fetch user roles. Please try again.');
      }
    };
    fetchRoles();
  }, [skipAutoNavigate]);

  const fetchUserData = async (phoneNumber, selectedRole) => {
    try {
      const response = await ApiService.makeRequest(`/general/getUserGeneralData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, selectedRole }),
      });
      
      const data = await response.json();

      if (data.success && data.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.data));
        await AsyncStorage.setItem('userRole', selectedRole);
        
        // Navigate to role-specific routes
        switch (selectedRole) {
          case 'Admin':
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminRoutes' }],
            });
            break;
          case 'Coordinator':
            navigation.reset({
              index: 0,
              routes: [{ name: 'CoordinatorRoutes' }],
            });
            break;
          case 'Mentor':
            navigation.reset({
              index: 0,
              routes: [{ name: 'MentorRoutes' }],
            });
            break;
          case 'Parent':
            navigation.reset({
              index: 0,
              routes: [{ name: 'ParentRoutes' }],
            });
            break;
          default:
            Alert.alert('Error', 'Unknown role');
        }
      } else {
        Alert.alert('No User Found', data.message || 'No User is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    switch (role) {
      case 'Admin': 
        fetchUserData(phoneNumber, role); 
        break;
      case 'Coordinator': 
        fetchUserData(phoneNumber, role); 
        break;
      case 'Mentor': 
        fetchUserData(phoneNumber, role); 
        break;
      case 'Parent': 
        fetchUserData(phoneNumber, role); 
        break;
      default: 
        break;
    }
  };

  const handleLogout = async () => {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.log('Google sign out error (non-critical):', googleError?.message);
      }
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'There was an issue logging out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {roles.map((role) => {
        const displayRole = role;
        return (
          <View key={role} style={styles.roleItem}>
            <Text style={styles.roleText}>{displayRole}</Text>
            <Switch
              value={selectedRole === role}
              onValueChange={() => handleRoleSelect(role)}
              backgroundActive="#2962ff"
              backgroundInactive="#dcdcdc"
              circleActiveColor="#ffffff"
              circleInActiveColor="#ffffff"
              barHeight={30}
              circleSize={24}
              switchWidthMultiplier={2.3}
              renderActiveText={false}
              renderInActiveText={false}
              changeValueImmediately={true}
              innerCircleStyle={{ elevation: 4, borderColor: 'white' }}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E53E3E', padding: 8, borderRadius: 5 },
  logoutText: { color: 'white' },
  roleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  roleText: { fontSize: 16, color: '#111827' },
});

export default Redirect;