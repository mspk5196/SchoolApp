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
} from 'react-native';
import Loginimg from '../../../assets/FirstPage/login-page/img/loginimg.svg';
import styles from './loginsty';
import { TextInput } from 'react-native-paper';
import React, { useState } from 'react';
import Separator from '../../../assets/FirstPage/login-page/img/separator.svg';
import Googleicon from '../../../assets/FirstPage/login-page/img/google.svg';
import Tickicon from '../../../assets/ParentPage/basic-img/tick.svg';
import Tickbox from '../../../assets/ParentPage/basic-img/tickbox.svg';
import EyeOn from '../../../assets/FirstPage/login-page/img/eye-svgrepo-com.svg';
import EyeOff from '../../../assets/FirstPage/login-page/img/eye-slash-svgrepo-com.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../utils/env.js';
import { encryptPassword } from '../../../components/Login/encrypt/encryptPassword';
import { generateAndStoreKeys } from '../../../utils/keyManager';
import Config from 'react-native-config';

const Login = () => {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        // console.log("API URL:", Config.API_URL);
        console.log("API URL:", API_URL);
        try {

            if (checked) {
                const encryptedPassword = encryptPassword(password);

                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, password: encryptedPassword }),
                });

                const data = await response.json();

                if (!data.success) {
                    Alert.alert(data.message || 'Invalid credentials');
                    return;
                }
                // const { privateKeyHex, publicKeyHex } = await generateAndStoreKeys();

                await AsyncStorage.setItem('userRoles', JSON.stringify(data.user.roles));
                await AsyncStorage.setItem('userPhone', JSON.stringify(data.user.phone));
                navigation.navigate('Redirect', { phoneNumber, password });
            }
            else {
                Alert.alert("Please accept the Privacy Policy");
            }

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Something went wrong');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View>
                        <Text style={styles.hi}>Hi !</Text>
                        <Text style={styles.sectoptext}>Login to continue</Text>
                        <Loginimg height={267} width={290} style={styles.logimg} />

                        <View style={styles.inputcontainer}>
                            <TextInput
                                style={styles.input}
                                label="Mobile"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                mode="outlined"
                                activeOutlineColor="#2842C4"
                                keyboardType="phone-pad"
                            />
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    style={styles.input}
                                    label="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    mode="outlined"
                                    activeOutlineColor="#2842C4"
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        top: 22,
                                    }}
                                >
                                    {showPassword ? <EyeOn width={24} height={24} /> : <EyeOff width={24} height={24} />}
                                </Pressable>
                            </View> 
                        </View>

                        <Pressable style={styles.checkboxContainer} onPress={() => setChecked(!checked)}>
                            {checked ? <Tickbox height={18} width={18} /> : <Tickicon height={18} width={18} />}
                            <Text style={styles.checkboxText}>I agree with the Privacy Policy</Text>
                        </Pressable>

                        <TouchableOpacity style={styles.pressablebtn} onPress={handleLogin}>
                            <View style={styles.btn}>
                                <Text style={styles.btntext}>LOGIN</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.separator}>
                            <Separator />
                        </View>
                        <Text style={styles.googletext}>Login with Google</Text>

                        <Pressable style={styles.googleauthcontainer}>
                            <Googleicon height={18} width={18} style={styles.googleicon} />
                            <Text style={styles.googleauthtext}>Continue with Google</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default Login;