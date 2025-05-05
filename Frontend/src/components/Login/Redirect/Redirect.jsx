import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, ToastAndroid } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native-switch';
import { API_URL } from '@env';
 
const Redirect = ({ route }) => {
  const navigation = useNavigation();
  const [roles, setRoles] = useState([]); 
  const [selectedRole, setSelectedRole] = useState(null); 
  const [user, setUser] = useState(null); 
  const [exitApp, setExitApp] = useState(false); 
 
  const routeParams = route.params;
  const [phoneNumber, setPhone]=useState(routeParams?.phoneNumber)

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

          // Auto navigate if only one role
          if (parsedRoles.length === 1) {
            handleRoleSelect(parsedRoles[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    const fetchPhone = async () => {  
      try {
        const storedPhone = await AsyncStorage.getItem('userPhone');
        if (storedPhone) {
          const parsedPhone = JSON.parse(storedPhone);
          setPhone(parsedPhone);
        }
      } catch (error) {
        console.error('Error fetching phone:', error);
      }
    };

    fetchRoles();
    fetchPhone();
  }, []); 
 
  const fetchStudentData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/getStudentData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      console.log('Student Data API Response:', data);

      if (data.success && data.student) {    
        await AsyncStorage.setItem('studentData', JSON.stringify(data.student));
        navigation.navigate('ParentRoute', { studentData: data.student });
        // , { studentData: data.student }  
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
      console.log('Coordinator Data API Response:', data);

      if (data.success && data.coordinatorData) {
        await AsyncStorage.setItem('coordinatorData', JSON.stringify(data.coordinatorData));
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
      console.log('Mentor Data API Response:', data);

      if (data.success && data.mentorData) {
        await AsyncStorage.setItem('mentorData', JSON.stringify(data.mentorData));
        navigation.navigate('MentorMain', { mentorData: data.mentorData });
      } else {
        Alert.alert('No Mentor Found', 'No Mentor is associated with this number');
      }
    } catch (error) {
      console.error('Error fetching coordinator data:', error);
      Alert.alert('Error', 'Failed to fetch coordinator data');
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
      console.log('Admin Data API Response:', data);

      if (data.success && data.adminData) {
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
      case 'Admin':
        fetchAdminData();
        break;
      case 'Coordinator':
        fetchCoordinatorData();
        break;
      case 'Mentor':
        fetchMentorData();
        break;
      case 'Student':
        fetchStudentData();
        break;
      default:
        break;
    }
  };

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
            {/* <Switch
              value={selectedRole === role}
              trackColor={{ false: '#ccc', true: 'rgb(190, 226, 226)' }}
              onValueChange={() => handleRoleSelect(role)}
            /> */}
            <Switch
                  value={selectedRole === role}
                  onValueChange={() => handleRoleSelect(role)}
            
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
