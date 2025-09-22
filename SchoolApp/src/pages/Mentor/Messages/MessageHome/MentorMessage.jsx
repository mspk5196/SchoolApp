import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, Pressable, TextInput, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "./Messagesty";
import Home from "../../../../assets/MentorPage/entypo_home.svg";
import SearchIcon from "../../../../assets/MentorPage/search.svg";
import Add from "../../../../assets/MentorPage/plus.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../../utils/env.js';
import io from 'socket.io-client';
import { useFocusEffect } from "@react-navigation/native";
import { widthPercentageToDP } from "react-native-responsive-screen";

const Profile = require('../../../../assets/MentorPage/profile.png');

const MentorMessage = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);

    const [mentor, setMentor] = useState(null);

    const socketRef = useRef(null);

    const fetchInbox = async (mentor) => {
        if (!mentor) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/mentor-inbox`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mentor_id: mentor.id })
            });
            const data = await res.json();
            if (data.success) {
                setInbox(data.inbox);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const setupInbox = async () => {
                try {
                    const mentorData = await AsyncStorage.getItem('mentorData');
                    const parsed = mentorData ? JSON.parse(mentorData)[0] : null;
                    if (parsed && isActive) {
                        setMentor(parsed);
                        fetchInbox(parsed);

                        if (!socketRef.current) {
                            socketRef.current = io(API_URL, {
                                transports: ['websocket'],
                                reconnection: true,
                            });

                            socketRef.current.emit('join', { userId: parsed.id });

                            socketRef.current.on('receiveMessage', () => {
                                fetchInbox(parsed);
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error loading mentor inbox:', err);
                }
            };

            setupInbox();

            return () => {
                isActive = false;
                if (socketRef.current) {
                    socketRef.current.off('receiveMessage');
                    // Optional: disconnect if needed
                    // socketRef.current.disconnect();
                }
            };
        }, [])
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
        if (!mentor) return false;
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

    function isEncryptedMessage(text) {
        if (!text) return false;
        try {
            const obj = JSON.parse(text);
            return obj && obj.iv && obj.encrypted;
        } catch {
            return false;
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Home height={24} width={24} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Message</Text>
            </View>
            <View style={styles.underline} />
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
                // console.log(filteredInbox),

                (<FlatList
                    data={filteredInbox}
                    // --- START OF CHANGE ---
                    // Use a more robust key that works for items with and without messages
                    keyExtractor={(item) => item.message_id ? item.message_id.toString() : `${item.contact_type}_${item.contact_id}`}
                    // --- END OF CHANGE ---
                    renderItem={({ item }) => {
                        console.log(item);

                        const hasUnreadReceivedMessages = item.unread_received_count > 0;
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("MentorMessageBox", {
                                    contact: {
                                        receiver_id: item.contact_id,  //receiver_id
                                        receiver_name: item.contact_name,
                                        receiver_type: item.contact_type,
                                        subject: item.subject || '',
                                        profile: item.contact_profile,
                                        sender_id: mentor.id, // <-- pass mentor id  //sender_id
                                        sender_name: mentor.name, // optional, for header
                                    }
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
                    }
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: '#888' }}>No messages found</Text>
                        </View>
                    }
                />)
            )}
            <View>
                <TouchableOpacity style={styles.addIcon} onPress={() => navigation.navigate("MentorSendMessage")}>
                    <Add width={widthPercentageToDP('8.5%')} height={widthPercentageToDP('8.5%')} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MentorMessage;