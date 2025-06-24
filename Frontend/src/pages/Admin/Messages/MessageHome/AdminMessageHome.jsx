import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Pressable, TextInput, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "./Messagesty";
import Home from "../../../../assets/MentorPage/entypo_home.svg";
import SearchIcon from "../../../../assets/MentorPage/search.svg";
import Add from "../../../../assets/MentorPage/Add.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { API_URL } from '../../../../utils/env.js';
import io from 'socket.io-client';

const Profile = require('../../../../assets/MentorPage/profile.png');

// const AdminMessageHome = ({ navigation, route }) => {
//     const { adminData } = route.params;

//     const [selectedTab, setSelectedTab] = useState(1);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [inbox, setInbox] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [admin, setAdmin] = useState(null);

//     const socketRef = useRef(null);

//     const fetchInbox = async (adminObj) => {
//         setLoading(true);
//         try {
//             const res = await fetch(`${API_URL}/api/admin-inbox`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ admin_id: adminObj.id })
//             });
//             const data = await res.json();
//             if (data.success) {
//                 setInbox(data.inbox);
//             }
//         } catch (e) {
//             console.error(e);
//         }
//         setLoading(false);
//     };


//     useFocusEffect(
//         useCallback(() => {
//             const parsedAdmin = typeof adminData === 'string' ? JSON.parse(adminData) : adminData;
//             setAdmin(parsedAdmin);

//             fetchInbox(parsedAdmin);

//             // Setup socket
//             if (!socketRef.current) {
//                 socketRef.current = io(API_URL, {
//                     transports: ['websocket'],
//                     reconnection: true,
//                 });

//                 socketRef.current.emit('join', { userId: parsedAdmin.id });

//                 socketRef.current.on('receiveMessage', (data) => {
//                     console.log('📨 Inbox update triggered by socket:', data.message);
//                     fetchInbox(parsedAdmin); // Refetch inbox when new message arrives
//                 });
//             }

//             return () => {
//                 if (socketRef.current) {
//                     socketRef.current.disconnect();
//                     socketRef.current = null;
//                 }
//             };
//         }, [adminData])
//     );


//     const filteredInbox = inbox.filter(item => {
//         if (!admin) return false;

//         const name = item.contact_name || '';
//         const msg = item.message_text || '';
//         const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             msg.toLowerCase().includes(searchQuery.toLowerCase());

//         if (!matchesSearch) {
//             return false;
//         }

//         // --- START OF CHANGES ---
//         // A conversation is "unread" if it has one or more unread messages received by the admin.
//         const hasUnreadReceivedMessages = item.unread_received_count > 0;

//         // Tab filtering logic based on the new, accurate unread status
//         switch (selectedTab) {
//             case 1: // All
//                 return true;
//             case 2: // Unread
//                 return hasUnreadReceivedMessages;
//             case 3: // Read
//                 return !hasUnreadReceivedMessages;
//             default:
//                 return true;
//         }
//         // --- END OF CHANGES ---
//     });

//     return (
//         <View style={styles.container}>
//             <View style={styles.activityHeader}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Home height={24} width={24} style={styles.homeIcon} />
//                 </TouchableOpacity>
//                 <Text style={styles.activityText}>Message</Text>
//             </View>
//             <View style={styles.underline} />
//             <View style={styles.searchView}>
//                 <View style={styles.searchBar}>
//                     <SearchIcon width={20} height={20} style={styles.searchIcon} />
//                     <TextInput
//                         style={styles.searchInput}
//                         placeholder="Search..."
//                         placeholderTextColor="#767676"
//                         value={searchQuery}
//                         onChangeText={setSearchQuery}
//                     />
//                 </View>
//             </View>
//             <View style={styles.tabContainer}>
//                 {[
//                     { id: 1, title: "All" },
//                     { id: 2, title: "Unread" },
//                     { id: 3, title: "Read" }
//                 ].map((item) => (
//                     <Pressable
//                         key={item.id}
//                         style={[styles.tabItem, selectedTab === item.id && styles.selectedTab]}
//                         onPress={() => setSelectedTab(item.id)}
//                     >
//                         <Text style={[styles.tabText, selectedTab === item.id && styles.selectedTabText]}>
//                             {item.title}
//                         </Text>
//                     </Pressable>
//                 ))}
//             </View>
//             {loading ? (
//                 <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 40 }} />
//             ) : (
//                 <FlatList
//                     data={filteredInbox}
//                     keyExtractor={(item) => item.message_id}
//                     renderItem={({ item }) => {
//                         // --- START OF CHANGES ---
//                         // This flag is now our single source of truth for showing unread indicators.
//                         const hasUnreadReceivedMessages = item.unread_received_count > 0;
//                         // --- END OF CHANGES ---

//                         return (
//                             <TouchableOpacity
//                                 onPress={() => navigation.navigate("AdminMessageBox", {
//                                     contact: {
//                                         receiver_id: item.contact_id,
//                                         receiver_name: item.contact_name,
//                                         receiver_type: item.contact_type,
//                                         profile: item.contact_profile || Profile,
//                                         sender_id: admin.id,
//                                         sender_name: admin.name,
//                                     }
//                                 })}
//                             >
//                                 <View style={styles.inboxItem}>
//                                     <View style={styles.inboxLeft}>
//                                         <Image
//                                             source={item.contact_profile ? { uri: `${API_URL}/${item.contact_profile}` } : Profile}
//                                             style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
//                                         />
//                                         <View>
//                                             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                                                 <View>
//                                                     <Text style={{ color: 'green', fontSize: 13.5 }}>{String(item.contact_type).charAt(0).toUpperCase() + String(item.contact_type).slice(1)}</Text>
//                                                     <Text style={styles.inboxText}>{item.contact_type === ('coordinator' || 'admin') ? `${item.contact_name}` : `${item.contact_name} (Grade ${item.grade_id} - Section ${item.section_name})`}</Text>
//                                                 </View>
//                                                 {/* Show unread indicator only if there are unread messages from this contact */}
//                                                 {hasUnreadReceivedMessages && (
//                                                     <View style={{
//                                                         width: 8, height: 8, borderRadius: 4,
//                                                         backgroundColor: '#4169E1', marginLeft: 5
//                                                     }} />
//                                                 )}
//                                             </View>
//                                             <Text style={[
//                                                 styles.inboxMsg,
//                                                 // Style as bold if there are unread messages
//                                                 hasUnreadReceivedMessages && { fontWeight: 'bold' }
//                                             ]} numberOfLines={1}>
//                                                 {item.attachment_type === 'image' ? '📷 Photo' :
//                                                     item.attachment_type === 'audio' ? '🎤 Audio' :
//                                                         item.attachment_type === 'pdf' ? '📄 PDF' :
//                                                             item.attachment_type === 'doc' || item.attachment_type === 'docx' ? '📄 Document' :
//                                                                 item.attachment_type === 'xls' || item.attachment_type === 'xlsx' ? '📊 Spreadsheet' :
//                                                                     item.message_text || ''}
//                                             </Text>
//                                         </View>
//                                     </View>
//                                     <View style={{ alignItems: 'flex-end' }}>
//                                         <Text style={styles.inboxTime}>
//                                             {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//                                         </Text>
//                                         {/* Show "New" only if there are unread messages */}
//                                         {hasUnreadReceivedMessages && (
//                                             <Text style={{ fontSize: 12, color: '#4169E1' }}>New</Text>
//                                         )}
//                                     </View>
//                                 </View>
//                             </TouchableOpacity>
//                         );
//                     }}
//                     ListEmptyComponent={
//                         <View style={{ alignItems: 'center', marginTop: 40 }}>
//                             <Text style={{ color: '#888' }}>No messages found</Text>
//                         </View>
//                     }
//                 />
//             )}
//             {/* I've commented out the Add icon as it navigates to "MentorSendMessage", which might be incorrect for an Admin. You can adjust this as needed. */}
//             {/* <View>
//                 <TouchableOpacity style={styles.addIcon} onPress={() => navigation.navigate("AdminNewMessage")}>
//                     <Add />
//                 </TouchableOpacity>
//             </View> */}
//         </View>
//     )
// };

const AdminMessageHome = ({ navigation, route }) => {
    const { adminData } = route.params;
    const [selectedTab, setSelectedTab] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);
    const socketRef = useRef(null);

    const fetchInbox = async (adminObj) => {
        if (!adminObj) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin-inbox`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminObj.id })
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
            const parsedAdmin = typeof adminData === 'string' ? JSON.parse(adminData) : adminData;
            setAdmin(parsedAdmin);
            fetchInbox(parsedAdmin);

            if (!socketRef.current) {
                socketRef.current = io(API_URL, { transports: ['websocket'] });
                socketRef.current.emit('join', { userId: parsedAdmin.id });
                socketRef.current.on('receiveMessage', () => fetchInbox(parsedAdmin));
            }

            return () => socketRef.current?.off('receiveMessage');
        }, [adminData])
    );

    useEffect(() => {
        return () => socketRef.current?.disconnect();
    }, []);

    const filteredInbox = inbox.filter(item => {
        const name = item.contact_name || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
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
                <TouchableOpacity onPress={() => navigation.goBack()}><Home height={24} width={24} /></TouchableOpacity>
                <Text style={styles.activityText}>Message</Text>
            </View>
            <View style={styles.underline} />
            <View style={styles.searchView}>
                <View style={styles.searchBar}>
                    <SearchIcon width={20} height={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
            <View style={styles.tabContainer}>
                {[{ id: 1, title: "All" }, { id: 2, title: "Unread" }, { id: 3, title: "Read" }].map((item) => (
                    <Pressable
                        key={item.id}
                        style={[styles.tabItem, selectedTab === item.id && styles.selectedTab]}
                        onPress={() => setSelectedTab(item.id)}
                    >
                        <Text style={[styles.tabText, selectedTab === item.id && styles.selectedTabText]}>{item.title}</Text>
                    </Pressable>
                ))}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredInbox}
                    keyExtractor={(item) => item.message_id ? item.message_id.toString() : `${item.contact_type}_${item.contact_id}`}
                    renderItem={({ item }) => {
                        const hasUnreadReceivedMessages = item.unread_received_count > 0;
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("AdminMessageBox", {
                                    contact: {
                                        receiver_id: item.contact_id,
                                        receiver_name: item.contact_name,
                                        receiver_type: item.contact_type,
                                        profile: item.contact_profile || Profile,
                                    }
                                })}
                            >
                                <View style={styles.inboxItem}>
                                    <Image
                                        source={item.contact_profile ? { uri: `${API_URL}/${item.contact_profile}` } : Profile}
                                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.inboxText}>{item.contact_name}</Text>
                                            {hasUnreadReceivedMessages && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4169E1', marginLeft: 5 }} />}
                                        </View>
                                        <Text style={[styles.inboxMsg, hasUnreadReceivedMessages && { fontWeight: 'bold' }]} numberOfLines={1}>
                                            {item.attachment_path ? (item.attachment_type === 'image' ? '📷 Photo' : '📎 Attachment') :
                                                (item.message_text ? 'Encrypted Message' : 'Start a conversation...')}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.inboxTime}>
                                            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </Text>
                                        {hasUnreadReceivedMessages && <Text style={{ fontSize: 12, color: '#4169E1' }}>New</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: '#888' }}>No messages found</Text></View>}
                />
            )}
        </View>
    );
};

export default AdminMessageHome;