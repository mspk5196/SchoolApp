import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import styles from "./BufferActivitysty";
import Back from "../../../../assets/MentorPage/backarrow.svg";
import Add from "../../../../assets/MentorPage/plus.svg";
import Home from "../../../../assets/MentorPage/Home2.svg";
import { API_URL } from '../../../../utils/env.js'
import { widthPercentageToDP } from "react-native-responsive-screen";

const MentorBufferActivity = ({ navigation, route }) => {
    const { mentorData } = route.params;
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Format time to "3:00 PM" format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Check and update activity status
    const checkActivityStatus = (activity) => {
        const now = new Date();
        const today = new Date(now.toISOString().split('T')[0]);
        const endTime = new Date(today.toISOString().split('T')[0] + 'T' + activity.to_time);

        // If manually ended, keep the ended_at time
        if (activity.ended_at) {
            return {
                ...activity,
                status: 'Ended',
                timeLeft: `Ended at ${formatTime(activity.ended_at)}`,
                displayTime: formatTime(activity.ended_at)
            };
        }

        // If time passed and not manually ended
        if (now > endTime && activity.status === 'Active') {
            return {
                ...activity,
                status: 'Ended',
                timeLeft: `Ended at ${formatTime(activity.to_time)}`,
                displayTime: formatTime(activity.to_time)
            };
        }
        return activity;
    };

    // Calculate time left for active activities
    const calculateTimeLeft = (activity) => {
        if (activity.status === 'Ended') {
            return activity;
        }

        const now = new Date();
        const today = new Date(now.toISOString().split('T')[0]);
        const start = new Date(today.toISOString().split('T')[0] + 'T' + activity.from_time);
        const end = new Date(today.toISOString().split('T')[0] + 'T' + activity.to_time);

        if (now < start) {
            const minsUntilStart = Math.floor((start - now) / (1000 * 60));
            return { ...activity, timeLeft: `Starts in ${minsUntilStart} min` };
        }

        if (now >= start && now <= end) {
            const minsLeft = Math.floor((end - now) / (1000 * 60));
            return { ...activity, timeLeft: `Ends in ${minsLeft} min` };
        }

        return {
            ...activity,
            status: 'Ended',
            timeLeft: `Ended at ${formatTime(activity.to_time)}`,
            displayTime: formatTime(activity.to_time)
        };
    };

    const fetchActivities = () => {
        setRefreshing(true);
        fetch(`${API_URL}/api/mentor/buffer-activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mentor_id: mentorData[0].id
            })
        })
            .then(response => response.json())
            .then(data => {
                const updatedActivities = data.activities
                    .map(checkActivityStatus)
                    .map(calculateTimeLeft);

                setActivities(updatedActivities);

                // Update database if any activities ended naturally
                updatedActivities.forEach(activity => {
                    if (activity.status === 'Ended' && !activity.ended_at) {
                        updateActivityStatusInDB(activity.id, activity.to_time);
                    }
                });
            })
            .catch(error => {
                console.error("Error fetching activities:", error);
                Alert.alert("Failed to fetch activities");
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    const updateActivityStatusInDB = (activityId, endTime = null) => {
        const endedTime = endTime || new Date().toTimeString().substr(0, 8);

        fetch(`${API_URL}/api/mentor/end-buffer-activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity_id: activityId,
                ended_time: endedTime
            })
        })
            .catch(error => {
                console.error("Error updating activity status:", error);
            });
    };

    // Update activities every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setActivities(prevActivities =>
                prevActivities.map(activity => {
                    const updatedActivity = calculateTimeLeft(activity);

                    if (activity.status === 'Active' && updatedActivity.status === 'Ended') {
                        updateActivityStatusInDB(activity.id, activity.to_time);
                    }

                    return updatedActivity;
                })
            );
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleEndActivity = (activityId) => {
        fetch(`${API_URL}/api/mentor/end-buffer-activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activity_id: activityId,
                ended_time: new Date().toTimeString().substr(0, 8)
            })
        })
            .then(response => response.json())
            .then(() => {
                fetchActivities(); // Refresh the list
            })
            .catch(error => {
                console.error("Error ending activity:", error);
                Alert.alert("Failed to end activity");
            });
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Back height={30} width={30} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Buffer Activity</Text>
            </View>

            <View style={styles.underline} />

            {activities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No buffer activities found</Text>
                </View>
            ) : (
                <FlatList
                    data={activities}
                    refreshing={refreshing}
                    onRefresh={fetchActivities}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.activity}>{item.activity_name}</Text>
                                <View style={styles.statusContainer}>
                                    <View style={[
                                        styles.statusDot,
                                        item.status === 'Active' ? styles.greenDot : styles.redDot
                                    ]} />
                                    <Text style={styles.status}>{item.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.details}>{item.grade_name}</Text>
                            <Text style={styles.details}>Section – {item.sections}</Text>
                            <Text style={[
                                styles.timeLeft,
                                item.status === 'Active' && item.timeLeft.includes('Ends in') && styles.endingSoon,
                                item.status === 'Active' && item.timeLeft.includes('Starts in') && styles.startingSoon,
                                item.status === 'Ended' && styles.endedText
                            ]}>
                                {item.timeLeft}
                            </Text>

                            {/* Only show button for active activities that have started */}
                            {item.status === 'Active' && !item.timeLeft.includes('Starts in') && (
                                <Pressable style={styles.button}>
                                    <TouchableOpacity onPress={() => handleEndActivity(item.id)}>
                                        <Text style={styles.buttonText}>End Activity now</Text>
                                    </TouchableOpacity>
                                </Pressable>
                            )}
                        </View>
                    )}
                />
            )}

            <View style={styles.activityIcons}>
                <View style={styles.AddIcon}>
                    <TouchableOpacity onPress={() => navigation.navigate("MentorBufferActivityRegister", { mentorData })}>
                        <Add width={widthPercentageToDP('8.5%')} height={widthPercentageToDP('8.5%')} />
                    </TouchableOpacity>
                </View>
                <View style={styles.HomeIcon}>
                    <TouchableOpacity onPress={() => navigation.navigate("MentorMain", { mentorData })}>
                        <Home />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default MentorBufferActivity;