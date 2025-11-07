import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AuthLoader = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const phone = await AsyncStorage.getItem('userPhone');

        if (phone) {
          navigation.navigate('Redirect', { phoneNumber: phone, skipAutoNavigate: false });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#2842C4" />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default AuthLoader;
