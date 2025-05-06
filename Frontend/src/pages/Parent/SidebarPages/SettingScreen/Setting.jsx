import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
// previous button
import PreviousIcon from '../../../../assets/ParentPage/SettingsIcon/PrevBtn.svg';
import styles from './SettingStyles';
//profile icon
import ProfileIcon from      '../../../../assets/ParentPage/SettingsIcon/settingprofile.svg';
import SecurityIcon from     '../../../../assets/ParentPage/SettingsIcon/security.svg';
import NotificationIcon from '../../../../assets/ParentPage/SettingsIcon/notification.svg';
import PrivacyIcon from      '../../../../assets/ParentPage/SettingsIcon/privacy.svg';
import HelpIcon from         '../../../../assets/ParentPage/SettingsIcon/help.svg';
import TermsIcon from        '../../../../assets/ParentPage/SettingsIcon/terms.svg';
import ReportIcon from       '../../../../assets/ParentPage/SettingsIcon/report.svg';
import Add_AccountIcon from  '../../../../assets/ParentPage/SettingsIcon/add_account.svg';
import LogoutIcon from       '../../../../assets/ParentPage/SettingsIcon/logout.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingItem = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.settingText}>{title}</Text>
    </TouchableOpacity>
  );
};

const Setting = ({ navigation }) => {
  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      // Remove the user data from AsyncStorage
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('userRoles');
      
      // You can clear any other data if needed, like admin or coordinator data
      await AsyncStorage.removeItem('adminData');
      await AsyncStorage.removeItem('coordinatorData');
      await AsyncStorage.removeItem('studentData');
      await AsyncStorage.removeItem('mentorData');
  
      // Show a logout confirmation (optional)
      Alert.alert('Logged Out', 'You have successfully logged out.');
  
      // Redirect to the Welcome or Login screen
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],  // Navigate to the Welcome screen after logout
      });
  
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'There was an issue logging out. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNavigateBack} style={styles.backButton}>
          <PreviousIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      {/* Settings List */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.settingsContainer}>
          <SettingItem 
            icon={<ProfileIcon width={24} height={24} />} 
            title="Edit profile" 
            onPress={() => navigation.navigate('EditProfile')}
          />
          
          <SettingItem 
            icon={<SecurityIcon width={24} height={24} />} 
            title="Security" 
            onPress={() => navigation.navigate('Security')}
          />
          
          <SettingItem 
            icon={<NotificationIcon width={24} height={24} />} 
            title="Notifications" 
            onPress={() => navigation.navigate('Notifications')}
          />
          
          <SettingItem 
            icon={<PrivacyIcon width={24} height={24} />} 
            title="Privacy" 
            onPress={() => navigation.navigate('Privacy')}
          />
          
          <SettingItem 
            icon={<HelpIcon width={24} height={24} />} 
            title="Help & Support" 
            onPress={() => navigation.navigate('Help')}
          />
          
          <SettingItem 
            icon={<TermsIcon width={24} height={24} />} 
            title="Terms and Policies" 
            onPress={() => navigation.navigate('Terms')}
          />
          
          <SettingItem 
            icon={<ReportIcon width={24} height={24} />} 
            title="Report a problem" 
            onPress={() => navigation.navigate('Report')}
          />
          
          <SettingItem 
            icon={<Add_AccountIcon width={24} height={24} />} 
            title="Add account" 
            onPress={() => navigation.navigate('AddAccount')}
          />
          
          <SettingItem 
            icon={<LogoutIcon width={24} height={24} />} 
            title="Log out" 
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};


export default Setting;