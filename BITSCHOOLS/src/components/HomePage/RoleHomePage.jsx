import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Switch } from 'react-native-switch';
import styles from "./MenuStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LogoutModal from "../Logout/LogoutModal";

const RoleHomePage = ({ navigation, roleConfig }) => {
  const [isCurrentRole, setIsCurrentRole] = useState(true);
  const [userData, setUserData] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const roleSwitch = () => {
    if (isCurrentRole) {
      setIsCurrentRole(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Redirect', params: { phoneNumber: userData.phone, skipAutoNavigate: true } }],
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleMenuPress = (menuItem) => {
    console.log(`${menuItem.title} pressed`);

    if (menuItem.title === 'Profile') {
      // Handle profile navigation if needed
      console.log('Profile clicked');
      return;
    }

    if (menuItem.title === 'Logout') {
      setShowLogoutModal(true);
      return;
    }

    if (menuItem.screen) {
      navigation.navigate(menuItem.screen, { userData });
    } else {
      console.log('No navigation defined for', menuItem.title);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.backButton}>
            <Text style={styles.title}>Menu</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => handleMenuPress({ title: 'Profile' })}>
              <MaterialCommunityIcons name="account-circle-outline" size={32} color='#334155' />
            </Pressable>
            <Pressable onPress={() => handleMenuPress({ title: 'Logout' })}>
              <MaterialCommunityIcons name="logout" size={28} color='#EF4444' />
            </Pressable>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{roleConfig.roleName}</Text>
          <Switch
            value={isCurrentRole}
            onValueChange={roleSwitch}
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

        <ScrollView style={styles.gridContainer}>
          {roleConfig.menuItems.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  {item.icon}
                  <Text style={styles.menuText}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>

        <LogoutModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleHomePage;
