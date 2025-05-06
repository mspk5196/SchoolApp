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
import Tickbox from '../../../assets/ParentPage/basic-img/tickbox.svg'

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { encryptPassword } from '../../../components/Login/encrypt/encryptPassword';


const Login = () => {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);

    const handleLogin = async () => {
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

                await AsyncStorage.setItem('userRoles', JSON.stringify(data.user.roles));
                await AsyncStorage.setItem('userPhone', JSON.stringify(data.user.phone));
                navigation.navigate('Redirect', { phoneNumber });
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
                            <TextInput
                                style={styles.input}
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                mode="outlined"
                                activeOutlineColor="#2842C4"
                                secureTextEntry
                            />
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
