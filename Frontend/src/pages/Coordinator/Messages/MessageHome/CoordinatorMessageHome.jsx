import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, FlatList, Pressable, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import styles from "./Messagesty";
import Home from "../../../../assets/MentorPage/entypo_home.svg";
import SearchIcon from "../../../../assets/MentorPage/search.svg";
import { API_URL } from '@env';
import { useFocusEffect } from "@react-navigation/native";
import io from 'socket.io-client';
import { generateAndStoreKeys, getPrivateKey } from "../../../../utils/keyManager";
import { decryptText, getSharedSecretAESKey } from "../../../../utils/messageEncryption";

const Profile = require('../../../../assets/MentorPage/profile.png');

const CoordinatorMessageHome = ({ navigation, route }) => {
    const { coordinatorData, coordinatorGrades } = route.params;
    const [selectedTab, setSelectedTab] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coordinator, setCoordinator] = useState(null);
    const socketRef = useRef(null);
    const sharedSecretRef = useRef(null);

    // const setupEncryption = async (currentUser, otherUser) => {
    //     try {
    //         let myPrivateKey = await getPrivateKey();
    //         if (!myPrivateKey) {
    //             const { privateKeyHex, publicKeyHex } = await generateAndStoreKeys();
    //             myPrivateKey = privateKeyHex;
    //             await fetch(`${API_URL}/api/messages/keys/upload`, {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({
    //                     user_id: currentUser.id,
    //                     user_type: 'coordinator',
    //                     public_key: publicKeyHex,
    //                 }),
    //             });
    //         }
    //         const res = await fetch(`${API_URL}/api/keys/${otherUser.receiver_type}/${otherUser.receiver_id}`);
    //         if (!res.ok) {
    //             Alert.alert('Encryption Error', "Could not get recipient's key.");
    //             return false;
    //         }
    //         const theirKeyData = await res.json();
    //         sharedSecretRef.current = getSharedSecretAESKey(myPrivateKey, theirKeyData.public_key);
    //         return true;
    //     } catch (error) {
    //         Alert.alert('Error', 'Could not establish a secure connection.');
    //         return false;
    //     }
    // };


    function isEncryptedMessage(text) {
        if (!text) return false;
        try {
            const obj = JSON.parse(text);
            return obj && obj.iv && obj.encrypted;
        } catch {
            return false;
        }
    }

    const decryptMessages = async (messageList) => {
        if (!sharedSecretRef.current) return messageList;
        return messageList.map(msg => {
            if (msg.message_text && isEncryptedMessage(msg.message_text)) {
                return { ...msg, message_text: decryptText(msg.message_text, sharedSecretRef.current) };
            }
            return msg;
        });
    };

    const fetchInbox = async (currentCoordinator) => {
        if (!currentCoordinator) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/coordinator-inbox`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinator_id: currentCoordinator.id, coordinatorGrades })
            });
            const data = await res.json();
            if (data.success) {
                console.log("Fetched inbox data:", data.inbox);
                const decrypted = await decryptMessages(data.inbox);
                setInbox(decrypted);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            const currentCoordinator = coordinatorData;
            setCoordinator(currentCoordinator);
            fetchInbox(currentCoordinator);

            if (!socketRef.current) {
                socketRef.current = io(API_URL, { transports: ['websocket'], reconnection: true });
                socketRef.current.emit('join', { userId: currentCoordinator.id });
                socketRef.current.on('receiveMessage', () => {
                    fetchInbox(currentCoordinator);
                });
            }

            return () => {
                if (socketRef.current) {
                    socketRef.current.off('receiveMessage');
                }
            };
        }, [coordinatorData, coordinatorGrades])
    );

    // Disconnect socket on component unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const filteredInbox = inbox.filter(item => {
        if (!coordinator) return false;
        const name = item.contact_name || '';
        const msg = item.message_text || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const hasUnreadReceivedMessages = item.unread_received_count > 0;
        switch (selectedTab) {
            case 1: return true;
            case 2: return hasUnreadReceivedMessages;
            case 3: return !hasUnreadReceivedMessages;
            default: return true;
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Home height={24} width={24} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Message</Text>
            </View>
            <View style={styles.underline} />

            <View style={{ flex: 10 }}>
                <View style={styles.searchView}>
                    <View style={styles.searchBar}>
                        <SearchIcon width={20} height={20} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            placeholderTextColor="#767676"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
                <View style={styles.tabContainer}>
                    {[{ id: 1, title: "All" }, { id: 2, title: "Unread" }, { id: 3, title: "Read" }].map((tab) => (
                        <Pressable
                            key={tab.id}
                            style={[styles.tabItem, selectedTab === tab.id && styles.selectedTab]}
                            onPress={() => setSelectedTab(tab.id)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab.id && styles.selectedTabText]}>
                                {tab.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredInbox}
                        // --- START OF CHANGE ---
                        // Use a more robust key that works for items with and without messages
                        keyExtractor={(item) => item.message_id ? item.message_id.toString() : `${item.contact_type}_${item.contact_id}`}
                        // --- END OF CHANGE ---
                        renderItem={({ item }) => {
                            const hasUnreadReceivedMessages = item.unread_received_count > 0;
                            return (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("CoordinatorMessageBox", {
                                        contact: {
                                            receiver_id: item.contact_id,
                                            receiver_name: item.grade_id ? `${item.contact_name} (Grade ${item.grade_id} - ${item.section_name})` : item.contact_name,
                                            profile: item.contact_profile,
                                            sender_id: coordinator.id,
                                            sender_name: coordinator.name,
                                            receiver_type: item.contact_type,
                                        },
                                        coordinator
                                    })}
                                >
                                    <View style={styles.inboxItem}>
                                        <View style={styles.inboxLeft}>
                                            <Image
                                                source={item.contact_profile ? { uri: `${API_URL}/${item.contact_profile}` } : Profile}
                                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                                            />
                                            <View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View>
                                                        <Text style={{ color: 'green', fontSize: 13.5 }}>{String(item.contact_type).charAt(0).toUpperCase() + String(item.contact_type).slice(1)}</Text>
                                                        <Text style={styles.inboxText}>{item.contact_type === ('coordinator' || 'admin') ? `${item.contact_name}` : `${item.contact_name} (Grade ${item.grade_id} - Section ${item.section_name})`}</Text>
                                                    </View>
                                                    {hasUnreadReceivedMessages && (
                                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4169E1', marginLeft: 5 }} />
                                                    )}
                                                </View>
                                                <Text style={[styles.inboxMsg, hasUnreadReceivedMessages && { fontWeight: 'bold' }]} numberOfLines={1}>
                                                    {item.attachment_type === 'image' ? '📷 Photo' :
                                                        item.attachment_type === 'audio' ? '🎤 Audio' :
                                                            item.attachment_type === 'pdf' ? '📄 PDF' :
                                                                item.attachment_type === 'doc' || item.attachment_type === 'docx' ? '📄 Document' :
                                                                    item.attachment_type === 'xls' || item.attachment_type === 'xlsx' ? '📊 Spreadsheet' :
                                                                        isEncryptedMessage(item.message_text) ? 'Text Message, Click to view..' : (item.message_text || '')}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.inboxTime}>
                                                {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Text>
                                            {hasUnreadReceivedMessages && (
                                                <Text style={{ fontSize: 12, color: '#4169E1' }}>New</Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Text style={{ color: '#888' }}>No messages or contacts found</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    )
};

export default CoordinatorMessageHome;