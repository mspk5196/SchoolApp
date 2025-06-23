import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, ToastAndroid } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native-switch';
import { API_URL } from '@env';
import { backupPrivateKey } from '../../../utils/backupPrivateKey';
import { restorePrivateKey } from '../../../utils/restorePrivateKey';
import { generateAndStoreKeys, getPrivateKey } from '../../../utils/keyManager';

const Redirect = ({ route }) => {
  const navigation = useNavigation();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [exitApp, setExitApp] = useState(false);

  const { phoneNumber, password } = route.params;
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
        const storedRoles = await AsyncStorage.getItem('userRoles');
        if (storedRoles) {
          const parsedRoles = JSON.parse(storedRoles);
          setRoles(parsedRoles);

          if (parsedRoles.length === 1 && !skipAutoNavigate) {
            handleRoleSelect(parsedRoles[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const manageKeys = async (userId, userType) => {
    let privateKeyHex = await getPrivateKey();
    if (privateKeyHex) {
      console.log('Private key found locally.');
      return; // Key exists, we are done
    }

    console.log('No local private key. Attempting to restore from server...');
    try {
      const restoredKey = await restorePrivateKey(userId, userType, password);
      if (restoredKey) {
        console.log('Private key successfully restored from server.');
        return; // Key restored and stored in AsyncStorage, we are done
      }
    } catch (error) {
      // This will catch 404s or other fetch errors, which is expected for a new user.
      console.log('Could not restore key (this is normal for a first-time login):', error.message);
    }

    console.log('Generating new key pair as no key was found locally or on the server...');
    const { privateKeyHex: newPrivateKey, publicKeyHex } = await generateAndStoreKeys();

    console.log('Backing up new private key to server...');
    await backupPrivateKey(newPrivateKey, userId, userType, password, publicKeyHex);
    console.log('Key backup complete.');
  };

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/getStudentData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (data.success && data.student) {
        await manageKeys(data.student.id, 'student');
        await AsyncStorage.setItem('studentData', JSON.stringify(data.student));
        navigation.navigate('ParentRoute', { studentData: data.student });
      } else {
        Alert.alert('No Student Found', 'No student is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      Alert.alert('Error', 'Failed to fetch student data');
    }
  };

  const fetchCoordinatorData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/getCoordinatorData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      
      if (data.success && data.coordinatorData) {
        const response2 = await fetch(`${API_URL}/api/coordinator/getCoordinatorGrades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinatorId: data.coordinatorData.id }),
        });
        const data2 = await response2.json();

        await manageKeys(data.coordinatorData.id, 'coordinator');
        await AsyncStorage.setItem('coordinatorData', JSON.stringify(data.coordinatorData));
        await AsyncStorage.setItem('coordinatorGrades', JSON.stringify(data2.coordinatorGrades));
        navigation.navigate('CoordinatorMain', { coordinatorData: data.coordinatorData });
      } else {
        Alert.alert('No Coordinator Found', 'No coordinator is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching coordinator data:', error);
      Alert.alert('Error', 'Failed to fetch coordinator data');
    }
  };

  const fetchMentorData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getMentorData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (data.success && data.mentorData) {
        await manageKeys(data.mentorData[0].id, 'mentor');
        await AsyncStorage.setItem('mentorData', JSON.stringify(data.mentorData));
        navigation.navigate('MentorMain', { mentorData: data.mentorData });
      } else {
        Alert.alert('No Mentor Found', 'No Mentor is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      Alert.alert('Error', 'Failed to fetch mentor data');
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/getAdminData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success && data.adminData) {
        await manageKeys(data.adminData.id, 'admin');
        await AsyncStorage.setItem('adminData', JSON.stringify(data.adminData));
        navigation.navigate('AdminMain', { adminData: data.adminData });
      } else {
        Alert.alert('No Admin Found', 'No Admin is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to fetch admin data');
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    switch (role) {
      case 'Admin': fetchAdminData(); break;
      case 'Coordinator': fetchCoordinatorData(); break;
      case 'Mentor': fetchMentorData(); break;
      case 'Student': fetchStudentData(); break;
      default: break;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userPhone', 'userRoles', 'adminData', 'coordinatorData', 
        'studentData', 'mentorData', 'ecdhPrivateKey' // Clear the private key on logout
      ]);
      Alert.alert('Logged Out', 'You have successfully logged out.');
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
        const displayRole = role === 'Student' ? 'Parent' : role;
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