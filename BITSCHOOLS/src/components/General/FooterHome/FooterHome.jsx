import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FooterHome = ({
  navigation,
  homeRoute
}) => {
  const handleHomePress = () => {
    navigation.navigate(homeRoute);
  };

  return (
    <TouchableOpacity
      style={styles.homeButton}
      onPress={handleHomePress}
      activeOpacity={0.8}
    >
      <Icon name="home" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3B82F6',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default FooterHome;
