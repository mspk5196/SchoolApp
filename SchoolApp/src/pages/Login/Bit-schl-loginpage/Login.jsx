import {
    SafeAreaView,
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
    ToastAndroid, // Added missing import
} from 'react-native';
import Loginimg from '../../../assets/FirstPage/login-page/img/loginimg.svg';
import styles from './loginsty';
import { TextInput } from 'react-native-paper';
import React, { useState, useRef } from 'react'; // Added useRef import
import Separator from '../../../assets/FirstPage/login-page/img/separator.svg';
import Googleicon from '../../../assets/FirstPage/login-page/img/google.svg';
import Tickicon from '../../../assets/ParentPage/basic-img/tick.svg';
import Tickbox from '../../../assets/ParentPage/basic-img/tickbox.svg';
import EyeOn from '../../../assets/FirstPage/login-page/img/eye-svgrepo-com.svg';
import EyeOff from '../../../assets/FirstPage/login-page/img/eye-slash-svgrepo-com.svg';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../utils/env.js';
import { encryptPassword } from '../../../components/Login/encrypt/encryptPassword';
import Config from 'react-native-config';
import { set } from 'date-fns';
import { apiFetch } from '../../../utils/apiClient.js';

const Login = () => {
    const navigation = useNavigation();
    const passwordRef = useRef(null); // Added passwordRef

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        console.log("API URL:", API_URL);

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
            const encryptedPassword = encryptPassword(password);

            const response = await apiFetch(`/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, password: encryptedPassword }),
            });

            if (!response.success && !response.token) {
                Alert.alert(response.message || 'Invalid credentials');
                return;
            }

            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('userRoles', JSON.stringify(response.user.roles));
            await AsyncStorage.setItem('userPhone', JSON.stringify(response.user.phone));
            navigation.navigate('Redirect', { phoneNumber, password });

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Something went wrong');
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
                webClientId: Config.GOOGLE_ANDROID_CLIENT_ID,
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

            // Call backend
            const data = await apiFetch(`/auth/google-login`, {
                method: 'POST',
                body: JSON.stringify({ email: googleEmail }),
            });

            if (data.success && data.token) {
                // Store token as string!
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('userRoles', JSON.stringify(data.user.roles));
                await AsyncStorage.setItem('userPhone', data.user.phone);

                const storedToken = await AsyncStorage.getItem('token');
                console.log('Stored JWT token:', storedToken); // Should be your JWT string

                // Navigate to app
                navigation.navigate('Redirect', { phoneNumber: data.user.phone, password: '' });
            } else {
                Alert.alert(data.message || 'Google login failed');
            }

        } catch (e) {
            console.error('Google login error:', e);
            ToastAndroid.show('Google login failed', ToastAndroid.SHORT);
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
            <SafeAreaView style={styles.container}>
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
                                <Text style={styles.hi}>Hi !</Text>
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
                                    activeOutlineColor="#2842C4"
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
                                        activeOutlineColor="#2842C4"
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <Pressable
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        {showPassword ? <EyeOn width={24} height={24} /> : <EyeOff width={24} height={24} />}
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable style={styles.checkboxContainer} onPress={() => setChecked(!checked)}>
                                {checked ? <Tickbox height={18} width={18} /> : <Tickicon height={18} width={18} />}
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
                                <Googleicon height={18} width={18} style={styles.googleicon} />
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