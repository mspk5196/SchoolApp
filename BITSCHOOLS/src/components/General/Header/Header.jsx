import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({ 
  title, 
  navigation, 
  showBackButton = true, 
  onBackPress,
  rightComponent,
  backgroundColor = '#fff',
  titleColor = '#1E293B',
  backButtonColor = '#333'
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={backButtonColor} />
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, { color: titleColor }]}>{title}</Text>
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 4,
    flex: 1,
  },
  backButton: {
    paddingRight: 8,
  },
  rightComponent: {
    marginLeft: 'auto',
  },
});

export default Header;
