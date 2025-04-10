import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { encryptPassword } from '../../components/encrypt/encryptPassword';

const Login = () => {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log("API URL:", API_URL);
        try {
            
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
            
            navigation.navigate('Redirect', { phoneNumber });

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Something went wrong');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                style={styles.input}
                value={phoneNumber}
                placeholderTextColor={'#999'}
                onChangeText={setPhoneNumber}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                placeholderTextColor={'#999'}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F9FAFB' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#333' },
    button: { backgroundColor: '#4F46E5', padding: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Login;
