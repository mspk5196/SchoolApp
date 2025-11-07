import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { Component, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LogoutModal = ({ visible, onClose, navigation }) => {
    const handleLogout = async () => {
        try {
            try {
                await GoogleSignin.signOut();
            } catch (googleError) {
                console.log('Google sign out error (non-critical):', googleError?.message);
            }
            await AsyncStorage.clear();

            onClose && onClose();
            
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'There was an issue logging out. Please try again.');
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        Are you sure want to log out from this device?
                    </Text>
                    <View style={styles.modalButtonsContainer}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.confirmButton} onPress={handleLogout}>
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '500',
        // textAlign: 'center',
        lineHeight: 28,
        marginBottom: 5,
        color: '#000',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#0055FF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
})

export default LogoutModal;