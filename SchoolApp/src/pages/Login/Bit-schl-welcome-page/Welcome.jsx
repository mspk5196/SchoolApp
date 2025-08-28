import { Image, ImageComponent, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import styles from './Welcomesty';
import React from 'react';
import WelcomeImg from '../../../assets/FirstPage/welcome-page/img/WelcomeImg.svg';
// import WelcomeImg from '../../../assets/FirstPage/welcome-page/img/WelcomeImg.png'

const Welcome = () => { 
  const navigation = useNavigation(); 

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>BIT SCHOOLS</Text>
          {/* <Image source={WelcomeImg} style={styles.image} /> */}
          <WelcomeImg height={267} width={290} style={styles.logimg} />
          <Text style={styles.mainText}>Hello !</Text>
          <Text style={styles.text2}>
            Welcome back! Please log {"\n"}in to continue
          </Text>
          <TouchableOpacity 
            style={styles.pressablebtn} 
            onPress={() => navigation.navigate('Login')} 
          >
            <View style={styles.btn}>
              <Text style={styles.btntext}>LOGIN</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    
  );
};

export default Welcome;
