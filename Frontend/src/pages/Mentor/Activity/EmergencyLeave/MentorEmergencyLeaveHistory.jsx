import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Linking, Image } from 'react-native';
import styles from './EmergencyLeaveHistorysty';
import Back from '../../../../assets/MentorPage/backarrow.svg';
import SearchIcon from '../../../../assets/MentorPage/search.svg';
import CallParent from '../../../../assets/MentorPage/callparent.svg';
import Clock from '../../../../assets/MentorPage/clock.svg';
import { API_URL } from '../../../../utils/env.js'

const MentorEmergencyLeaveHistory = ({ navigation, route }) => {
    const { mentorData } = route.params;
    const [searchQuery, setSearchQuery] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/mentor/getEmergencyLeaveHistory?mentorId=${mentorData[0].id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setLeaves(data.leaves);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching leave history:', error);
                setLoading(false);
            });
    }, []);

    const handleCallParent = (phone) => {

        // Open phone dialer with the contact's phone number
        Linking.openURL(`tel:${phone}`);

    };

    const getProfileImageSource = (profilePath) => {
        if (profilePath) {
            // 1. Replace backslashes with forward slashes
            const normalizedPath = profilePath.replace(/\\/g, '/');
            // 2. Construct the full URL
            const fullImageUrl = `${API_URL}/${normalizedPath}`;
            return { uri: fullImageUrl };
        } else {
            return Staff;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Back height={30} width={30} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Emergency Leave History</Text>
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

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading leave history...</Text>
                </View>
            ) : (
                <FlatList
                    data={leaves.filter(leave =>
                        leave.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        leave.student_roll.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <View style={styles.leftSection}>
                                    {item.profile_photo ? (
                                        <Image source={getProfileImageSource(item.profile_photo)} style={styles.profilePic} />
                                    ) : (
                                        <View style={styles.profilePic} />
                                    )}
                                    <View>
                                        <Text style={styles.name}>{item.student_name}</Text>
                                        <Text style={styles.studentId}>{item.student_roll}</Text>
                                    </View>
                                </View>
                                <View style={styles.timeContainer}>
                                    <Clock style={styles.clockicon} />
                                    <Text style={styles.timeText}>{item.formatted_time}</Text>
                                </View>
                            </View>

                            <Text style={styles.descriptionLabel}>Description</Text>
                            <View style={styles.descriptionBox}>
                                <View style={styles.redLine} />
                                <Text style={styles.descriptionText}>{item.description}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => handleCallParent(item.father_mob)}
                            >
                                <CallParent style={styles.callIcon} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default MentorEmergencyLeaveHistory;