import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Header } from '../../../components';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../utils/ApiService';
import Nodata from '../../../components/General/Nodata';
import { StyleSheet } from 'react-native';

const MentorDashHome = ({ navigation, route }) => {
    const { userData } = route.params;
    // console.log(userData);  //To see user data passed from previous screen
    
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    // Function to parse date in dd/mm/yy format to a Date object
    const parseDate = (dateString) => {
        const [day, month, yearShort] = dateString.split('/');
        const year = '20' + yearShort;
        return new Date(year, month - 1, day);
    };

    // Function to format Date object to dd/mm/yy
    const formatDisplayDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2);
        return `${day}/${month}/${year}`;
    };

    // Function to format Date object to yyyy-mm-dd
    const formatISODate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Function to check if selected date is today
    const isToday = () => {
        const today = new Date();
        const todayISO = formatISODate(today);
        return formattedDate === todayISO;
    };

    // Function to get day label
    const getDayLabel = () => {
        if (isToday()) {
            return 'Today';
        }

        const selectedDateObj = new Date(formattedDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (formatISODate(selectedDateObj) === formatISODate(yesterday)) {
            return 'Yesterday';
        } else if (formatISODate(selectedDateObj) === formatISODate(tomorrow)) {
            return 'Tomorrow';
        } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return dayNames[selectedDateObj.getDay()];
        }
    };

    const today = new Date();
    const defaultDisplayDate = formatDisplayDate(today);
    const defaultISODate = formatISODate(today);

    const [selectedDate, setSelectedDate] = useState(defaultDisplayDate);
    const [formattedDate, setFormattedDate] = useState(defaultISODate);

    // Function to navigate to previous day
    const goToPreviousDay = () => {
        const currentDate = parseDate(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);

        setSelectedDate(formatDisplayDate(currentDate));
        setFormattedDate(formatISODate(currentDate));
    };

    // Function to navigate to next day
    const goToNextDay = () => {
        const currentDate = parseDate(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);

        setSelectedDate(formatDisplayDate(currentDate));
        setFormattedDate(formatISODate(currentDate));
    };

    // Fetch schedule for selected date
    const fetchSchedule = async (date) => {
        try {
            setLoading(true);
            const data = await ApiService.post('/mentor/getMentorSchedule', {
                date: date,
                facultyId: userData.id
            });

            if (data.success) {
                setSchedule(data.schedule);
            } else {
                setSchedule([]);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            Alert.alert('Error', 'Failed to fetch schedule');
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule(formattedDate);
    }, [formattedDate]);

    // Handle date selection from calendar
    const handleDateSelect = (date) => {
        const dateParts = date.dateString.split('-');
        const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;

        setSelectedDate(displayDate);
        setFormattedDate(date.dateString);
        setShowCalendarModal(false);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#10B981';
            case 'running':
                return '#F59E0B';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'completed':
                return '#D1FAE5';
            case 'running':
                return '#FEF3C7';
            case 'cancelled':
                return '#FEE2E2';
            default:
                return '#F3F4F6';
        }
    };

    const handleSessionClick = (session) => {
        navigation.navigate('MentorDashboardDetails', {
            facultyCalendarId: session.id,
            sessionData: session
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <Header title="My Schedule" navigation={navigation} />

            <View style={styles.scheduleSection}>
                <View style={styles.dateNavigation}>
                    <View style={styles.todayIndicator} />
                    <Text style={styles.todayText}>{getDayLabel()}</Text>
                    <View style={styles.dateNavigationControls}>
                        <TouchableOpacity onPress={goToPreviousDay}>
                            <Text style={styles.dateNavArrow}>{"<"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowCalendarModal(true)}
                        >
                            <Text style={styles.dateText}>{selectedDate}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={goToNextDay}>
                            <Text style={styles.dateNavArrow}>{">"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scheduleContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Loading schedule...</Text>
                    </View>
                ) : schedule.length > 0 ? (
                    schedule.map((session, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.sessionCard}
                            onPress={() => handleSessionClick(session)}
                        >
                            <View style={styles.sessionHeader}>
                                <View style={styles.sessionMainInfo}>
                                    <Text style={styles.subjectText}>{session.subject_name || 'N/A'}</Text>
                                    <Text style={styles.gradeText}>
                                        {session.grade_name} - Section {session.section_name}
                                    </Text>
                                </View>
                                <View style={styles.timeContainer}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
                                    <Text style={styles.timeText}>
                                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.sessionDetails}>
                                {session.session_type && (
                                    <View style={styles.sessionBadge}>
                                        <Text style={styles.sessionBadgeText}>{session.session_type}</Text>
                                    </View>
                                )}
                                {session.venue_name && (
                                    <View style={styles.venueBadge}>
                                        <MaterialCommunityIcons name="map-marker" size={14} color="#059669" />
                                        <Text style={styles.venueBadgeText}>{session.venue_name}</Text>
                                    </View>
                                )}
                            </View>

                            {session.topic_name && (
                                <View style={styles.topicRow}>
                                    <MaterialCommunityIcons name="book-open-variant" size={14} color="#64748B" />
                                    <Text style={styles.topicText}>{session.topic_name}</Text>
                                </View>
                            )}

                            {session.activity_name && (
                                <View style={styles.activityRow}>
                                    <MaterialCommunityIcons name="clipboard-text" size={14} color="#64748B" />
                                    <Text style={styles.activityText}>{session.activity_name}</Text>
                                </View>
                            )}

                            {session.batch_names && (
                                <View style={styles.batchRow}>
                                    <MaterialCommunityIcons name="account-group" size={14} color="#64748B" />
                                    <Text style={styles.batchText}>{session.batch_names}</Text>
                                </View>
                            )}

                            {session.evaluation_mode_name && (
                                <View style={styles.evaluationRow}>
                                    <MaterialCommunityIcons name="clipboard-check" size={14} color="#64748B" />
                                    <Text style={styles.evaluationText}>
                                        Evaluation: {session.evaluation_mode_name}
                                    </Text>
                                </View>
                            )}

                            {session.session_status && (
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusBgColor(session.session_status) }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(session.session_status) }
                                        ]}
                                    >
                                        {session.session_status.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Nodata />
                )}
            </ScrollView>

            {/* Calendar Modal */}
            <Modal
                visible={showCalendarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarModalContent}>
                        <Text style={styles.modalTitle}>Select Date</Text>
                        <Calendar
                            current={formattedDate}
                            markedDates={{
                                [formattedDate]: { selected: true, selectedColor: '#3B82F6' }
                            }}
                            onDayPress={handleDateSelect}
                            theme={{
                                selectedDayBackgroundColor: '#3B82F6',
                                todayTextColor: '#3B82F6',
                                arrowColor: '#3B82F6',
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scheduleSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    dateNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    todayIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        marginRight: 8,
    },
    todayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    dateNavigationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateNavArrow: {
        fontSize: 20,
        color: '#3B82F6',
        fontWeight: 'bold',
        paddingHorizontal: 8,
    },
    dateButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
    },
    dateText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    scheduleContainer: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },
    sessionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sessionHeader: {
        marginBottom: 12,
    },
    sessionMainInfo: {
        marginBottom: 8,
    },
    subjectText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    gradeText: {
        fontSize: 14,
        color: '#64748B',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    sessionDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    sessionBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sessionBadgeText: {
        fontSize: 12,
        color: '#1E40AF',
        fontWeight: '500',
    },
    venueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    venueBadgeText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '500',
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    topicText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    activityText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    batchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    batchText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    evaluationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    evaluationText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default MentorDashHome;
