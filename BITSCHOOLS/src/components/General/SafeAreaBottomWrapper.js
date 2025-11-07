// SafeAreaBottomWrapper.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaBottomWrapper = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  // Extra padding for Android devices with 3-button navigation
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  return <View style={[styles.container, { paddingBottom: bottomPadding }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaBottomWrapper;
