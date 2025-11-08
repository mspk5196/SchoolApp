import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const HomePageList = ({ menuItems, navigation, homeRoute = 'Home', data }) => {
  const MenuItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: item.bgColor || '#FFFFFF' }]}
      onPress={() => navigation.navigate(item.route, { data })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color || '#E2E8F0' }]}>
        <Icon 
          name={item.iconName} 
          size={24} 
          color="#FFFFFF" 
          type={item.iconType || 'material-community'}
        />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Icon name="chevron-right" size={24} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={({ item }) => <MenuItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => navigation.navigate(homeRoute)}
        activeOpacity={0.8}
      >
        <Icon name="home" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default HomePageList;
