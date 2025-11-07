import {
    Text,
    View,
    Keyboard,
    Pressable,
    TouchableWithoutFeedback,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ToastAndroid,
} from 'react-native';
import Loginimg from '../../../assets/Login/loginimg.svg';
import styles from './loginsty';
import { TextInput } from 'react-native-paper';
import React, { useState, useRef } from 'react';
import Separator from '../../../assets/Login/separator.svg';
import Googleicon from '../../../assets/Login/google.svg';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_ANDROID_CLIENT_ID } from '../../../config/env';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../utils/ApiService';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
    const navigation = useNavigation();
    const passwordRef = useRef(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async () => {

        if (!checked) {
            Alert.alert("Please accept the Privacy Policy");
            return;
        }

        if (!phoneNumber || !password) {
            Alert.alert("Please enter both phone number and password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await ApiService.login(phoneNumber, password);
            // console.log(response);
            
            if (response.success) {
               await AsyncStorage.setItem('userPhone', response.data.user.phone);
                await AsyncStorage.setItem('userEmail', response.data.user.email || '');
                
                // Navigate to Redirect screen
                navigation.navigate('Redirect', { 
                    phoneNumber: response.data.user.phone
                });
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);

            // Configure Google Signin
            GoogleSignin.configure({
                offlineAccess: true,
                webClientId: GOOGLE_ANDROID_CLIENT_ID,
            });

            // Ensure Google Play Services
            const hasPlayService = await GoogleSignin.hasPlayServices();
            if (!hasPlayService) {
                Alert.alert('Error', 'Google Play Services are not available.');
                return;
            }

            // Optional sign out before login
            try { await GoogleSignin.signOut(); } catch { }

            // Sign in with Google
            const userInfo = await GoogleSignin.signIn();
            const googleEmail = userInfo.data?.user.email || userInfo.user.email;

            if (!googleEmail) throw new Error('No email retrieved from Google.');

            const response = await ApiService.g_login(googleEmail);

            if (response.success && response.data) {
                // console.log(response);
                
                await AsyncStorage.setItem('userPhone', response.data.user.phone);
                await AsyncStorage.setItem('userEmail', response.data.user.email);

                // Navigate to Redirect screen
                navigation.navigate('Redirect', { 
                    phoneNumber: response.data.user.phone
                });
            } else {
                Alert.alert('Login Failed', response.message || 'Google login failed');
            }

        } catch (e) {
            console.error('Google login error:', e);
            Alert.alert('Error', 'Google login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        console.log("Loading...");
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.hi}>Hi!</Text>
                                <Text style={styles.sectoptext}>Login to continue</Text>
                            </View>

                            <View style={styles.imageContainer}>
                                <Loginimg height={200} width={220} style={styles.logimg} />
                            </View>

                            <View style={styles.inputcontainer}>
                                <TextInput
                                    style={styles.input}
                                    label="Mobile"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    mode="outlined"
                                    activeOutlineColor="#3B82F6"
                                    outlineColor="#E2E8F0"
                                    textColor="#1E293B"
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    blurOnSubmit={false}
                                />
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        ref={passwordRef}
                                        style={styles.input}
                                        label="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        mode="outlined"
                                        activeOutlineColor="#3B82F6"
                                        outlineColor="#E2E8F0"
                                        textColor="#1E293B"
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <Pressable
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <MaterialCommunityIcons 
                                            name={showPassword ? "eye" : "eye-off"} 
                                            size={22} 
                                            color="#64748B" 
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable style={styles.checkboxContainer} onPress={() => setChecked(!checked)}>
                                <MaterialCommunityIcons 
                                    name={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
                                    size={24} 
                                    color={checked ? "#3B82F6" : "#CBD5E1"} 
                                />
                                <Text style={styles.checkboxText}>I agree with the Privacy Policy</Text>
                            </Pressable>

                            <TouchableOpacity
                                style={[styles.pressablebtn, isLoading && { opacity: 0.7 }]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <View style={styles.btn}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.btntext}>LOGIN</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separator}>
                                <Separator />
                            </View>

                            <Text style={styles.googletext}>Login with Google</Text>

                            <Pressable
                                style={[styles.googleauthcontainer, isLoading && { opacity: 0.7 }]}
                                onPress={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <Googleicon height={20} width={20} style={styles.googleicon} />
                                <Text style={styles.googleauthtext}>Continue with Google</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default Login;