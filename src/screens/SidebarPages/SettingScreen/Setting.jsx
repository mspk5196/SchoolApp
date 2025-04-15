import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// previous button
import PreviousIcon from '../../../assets/SettingsIcon/PrevBtn.svg';
import styles from './SettingStyles';
//profile icon
import ProfileIcon from '../../../assets/SettingsIcon/settingprofile.svg';
import SecurityIcon from '../../../assets/SettingsIcon/security.svg';
import NotificationIcon from '../../../assets/SettingsIcon/notification.svg';
import PrivacyIcon from '../../../assets/SettingsIcon/privacy.svg';
import HelpIcon from '../../../assets/SettingsIcon/help.svg';
import TermsIcon from '../../../assets/SettingsIcon/terms.svg';
import ReportIcon from '../../../assets/SettingsIcon/report.svg';
import Add_AccountIcon from '../../../assets/SettingsIcon/add_account.svg';
import LogoutIcon from '../../../assets/SettingsIcon/logout.svg';

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
            onPress={() => {
              // Add logout functionality here
            }}
          />
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};


export default Setting;