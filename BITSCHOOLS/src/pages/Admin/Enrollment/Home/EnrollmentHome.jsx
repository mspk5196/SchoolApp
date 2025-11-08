import React from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './homeSty.jsx';
import Header from '../../../../components/General/Header/Header.jsx';

const menuItems = [
  {
    id: '1',
    title: 'Faculty Enrollment',
    iconName: 'account-plus',
    iconType: 'MaterialCommunityIcons',
    color: '#7C3AED',
    bgColor: '#E9D5FF',
    route: 'AdminFacultyEnrollment',
  },
  {
    id: '2',
    title: 'Coordinator Grade Management',
    iconName: 'calendar-check',
    iconType: 'MaterialCommunityIcons',
    color: '#059669',
    bgColor: '#A7F3D0',
    route: 'AdminCoordinatorGradeManagement',
  }
];

const MenuItem = ({ item, onPress }) => {
  const IconComponent = item.iconType === 'MaterialCommunityIcons' 
    ? MaterialCommunityIcons 
    : Ionicons;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: item.bgColor }]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <IconComponent name={item.iconName} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
};

const EnrollmentHome = ({ navigation }) => {
  const handleMenuPress = (route) => {
    navigation.navigate(route);
  };         

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header
        title="Enrollment Home" 
        navigation={navigation}
      />
      
      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MenuItem item={item} onPress={() => handleMenuPress(item.route)} />
        )}
      />

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('AdminHome')}
        activeOpacity={0.8}
      >
        <Ionicons name="home" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EnrollmentHome;