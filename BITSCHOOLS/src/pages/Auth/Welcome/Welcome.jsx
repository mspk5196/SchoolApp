import { Image, ImageComponent, Pressable, ScrollView, Text, TouchableOpacity, View, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import styles from './Welcomesty';
import React, { useEffect, useRef } from 'react';
import WelcomeImg from '../../../assets/Welcome/WelcomeImg.svg';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Welcome = () => { 
  const navigation = useNavigation(); 
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
     
  useEffect(() => {
    // Staggered entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={['#E3F2FD', '#FFFFFF', '#F3E5F5']}
      style={styles.gradientContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Title with decorative elements */}
          <View style={styles.titleContainer}>
            <View style={styles.decorativeLine} />
            <Text style={styles.title}>BIT SCHOOLS</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Image with scale animation */}
          <Animated.View 
            style={[
              styles.imageContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.imageShadow}>
              <WelcomeImg height={267} width={290} />
            </View>
          </Animated.View>

          {/* Welcome text section */}
          <View style={styles.textSection}>
            <View style={styles.greetingContainer}>
              <MaterialCommunityIcons name="hand-wave" size={32} color="#FF9800" />
              <Text style={styles.mainText}>Hello !</Text>
            </View>
            
            <Text style={styles.text2}>
              Welcome back! Please log {"\n"}in to continue
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>Secure & Safe</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#2196F3" />
                <Text style={styles.featureText}>Fast Access</Text>
              </View>
            </View>
          </View>

          {/* Animated Login Button */}
          <Animated.View 
            style={[
              styles.pressablebtn,
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient
                colors={['#2842C4', '#1976D2', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <View style={styles.btnContent}>
                  <Text style={styles.btntext}>LOGIN</Text>
                  <MaterialCommunityIcons name="arrow-right-circle" size={22} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Decorative footer */}
          <View style={styles.footer}>
            <View style={styles.dotIndicator}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Welcome;
