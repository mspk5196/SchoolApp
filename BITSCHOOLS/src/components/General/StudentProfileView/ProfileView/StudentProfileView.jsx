import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './StudentProfileViewStyle';
import { API_URL } from "../../../../utils/env.js";
import PerformanceGraph from '../../../Admin/performancegraph/Performancegraph.jsx';
import MentorSelectModal from './MentorSelectModal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Staff from '../../../../assets/Genreal/staff.png';

/**
 * Reusable Student Profile View Component
 * 
 * @param {Object} props
 * @param {Object} props.student - Student object with id, roll, section_id
 * @param {boolean} props.showMentorEdit - Whether to show mentor edit button (default: true)
 * @param {boolean} props.showPerformanceGraph - Whether to show performance graph (default: true)
 * @param {Function} props.onRefresh - Callback when data is refreshed
 * @param {Object} props.containerStyle - Additional container styles
 */
const StudentProfileView = ({
    student,
    showMentorEdit = true,
    showPerformanceGraph = true,
    onRefresh,
    containerStyle = {},
}) => {
    const [studentDetails, setStudentDetails] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [issueLogData, setIssueLogData] = useState(null);
    const [homeworkIssue, setHomeworkIssue] = useState(null);
    const [mentorsData, setMentorsData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const authTokenRef = useRef(null);

    useEffect(() => {
        // Load token once (used for protected images if needed)
        AsyncStorage.getItem('token').then(t => {
            authTokenRef.current = t;
        });
    }, []);
    console.log(student);

    useEffect(() => {
        if (student && student.id) {
            fetchAllDetails();
        }
    }, [student]);

    const fetchAllDetails = async () => {
        console.log(student.id);

        setLoading(true);
        try {
            await Promise.all([
                fetchStudentDetails(student.id),
                fetchAttendance(student.roll),
                // fetchIssueLog(student.roll),
                fetchSubjectMentors(student.section_id),
            ]);

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error fetching all details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            const response = await apiFetch(`/admin/students/${studentId}`);
            if (response.success) {
                setStudentDetails(response.student);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const fetchAttendance = async (roll) => {
        try {
            const response = await apiFetch(`/admin/students/${roll}/attendance`);
            if (response.success) {
                setAttendanceData(response.studentAttendance);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const fetchIssueLog = async (roll) => {
        try {
            const response = await apiFetch(`/admin/students/getStudentIssueLogs/${roll}`);
            if (response.studentIssueCount !== undefined || response.studentRedoCount !== undefined) {
                setIssueLogData(response.studentIssueCount || 0);
                setHomeworkIssue(response.studentRedoCount || 0);
            }
        } catch (error) {
            console.error('Error fetching issue log:', error);
        }
    };

    const fetchSubjectMentors = async () => {
        try {
            const response = await apiFetch(`/admin/students/getSubjectMentors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionID: student.section_id }),
            });

            const data = response
            console.log('Subjects mentors Data API Response:', data);

            if (data.success) {
                const initializedSubjects = data.subjectMentors.map(subject => ({
                    subject_id: subject.subject_id,
                    subject_name: subject.subject_name,
                    facultyName: subject.sectionMentorName || 'No faculty alloted',
                    facultyId: subject.sectionMentorRoll || '-',
                    sectionMentorPhoto: subject.sectionMentorPhoto,
                    selectedStaff: null
                }));
                setMentorsData(initializedSubjects);
            } else {
                Alert.alert('No Subject Found', 'No subject is associated with this section');
            }
        } catch (error) {
            console.error('Error fetching subjects data:', error);
            Alert.alert('Error', 'Failed to fetch subject data');
        }
    };

    const getProfileImageSource = (profilePath) => {
        if (profilePath) {
            const normalizedPath = profilePath.replace(/\\/g, '/');
            const uri = `${API_URL}/${normalizedPath}`;

            if (authTokenRef.current) {
                return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
            }
            return { uri };
        } else {
            return Staff;
        }
    };

    if (loading || !studentDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color='#0C36FF' size='large' />
                <Text style={styles.loadingText}>Loading student details...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Enhanced Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileInfo}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={getProfileImageSource(studentDetails?.profile_photo)}
                                    style={styles.profileImage}
                                />
                                <View style={styles.statusDot} />
                            </View>
                            <View style={styles.nameSection}>
                                <Text style={styles.name}>{studentDetails.name}</Text>
                                <Text style={styles.id}>ID: {studentDetails.roll}</Text>
                                <View style={styles.badge}>
                                    <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                                    <Text style={styles.badgeText}>Active Student</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailCard}>
                            <View style={styles.detailIconContainer}>
                                <MaterialCommunityIcons name="account-tie" size={20} color="#0C36FF" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Mentor</Text>
                                <Text style={styles.detailValue}>
                                    {studentDetails.mentor_name || 'Not assigned'}
                                </Text>
                            </View>
                            {showMentorEdit && (
                                <TouchableOpacity
                                    style={styles.editIconButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={18} color="#0C36FF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.detailCard}>
                            <View style={styles.detailIconContainer}>
                                <MaterialCommunityIcons name="school" size={20} color="#0C36FF" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Class</Text>
                                <Text style={styles.detailValue}>
                                    {studentDetails.grade_name} - {studentDetails.section_name}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Performance Graph */}
                {showPerformanceGraph && <PerformanceGraph student={studentDetails} />}

                {/* Enhanced Attendance Card */}
                {attendanceData && attendanceData.length > 0 && (
                    <View style={styles.attendanceCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="calendar-check" size={24} color="#0C36FF" />
                            <Text style={styles.cardTitle}>Attendance Overview</Text>
                        </View>

                        <View style={styles.attendanceCircleContainer}>
                            <View style={styles.attendanceCircle}>
                                <Text style={styles.attendancePercentage}>
                                    {Math.round(attendanceData[0].attendance_percentage)}%
                                </Text>
                                <Text style={styles.attendanceLabel}>Overall</Text>
                            </View>
                        </View>

                        <View style={styles.attendanceStats}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                                    <MaterialCommunityIcons name="check-circle" size={32} color="#27AE60" />
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(attendanceData[0].present_days)}
                                </Text>
                                <Text style={styles.statLabel}>Present Days</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                    <MaterialCommunityIcons name="calendar-clock" size={32} color="#FF9800" />
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(attendanceData[0].total_days)}
                                </Text>
                                <Text style={styles.statLabel}>Total Days</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
                                    <MaterialCommunityIcons name="close-circle" size={32} color="#EB4B42" />
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(attendanceData[0].leave_days)}
                                </Text>
                                <Text style={styles.statLabel}>Leave Days</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Enhanced Issue Log Card */}
                <View style={styles.issueCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="alert-circle" size={24} color="#FF9800" />
                        <Text style={styles.cardTitle}>Issue Log Summary</Text>
                    </View>

                    <View style={styles.issueStatsContainer}>
                        <View style={styles.issueStatItem}>
                            <View style={styles.issueStatLeft}>
                                <View style={[styles.issueIcon, { backgroundColor: '#FFF3E0' }]}>
                                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FF9800" />
                                </View>
                                <View>
                                    <Text style={styles.issueStatLabel}>Homework Issues</Text>
                                    <Text style={styles.issueStatValue}>{homeworkIssue || 0} issues</Text>
                                </View>
                            </View>
                            <View style={[
                                styles.issueBadge,
                                { backgroundColor: homeworkIssue > 0 ? '#FFEBEE' : '#E8F5E9' }
                            ]}>
                                <Text style={[
                                    styles.issueBadgeText,
                                    { color: homeworkIssue > 0 ? '#EB4B42' : '#27AE60' }
                                ]}>
                                    {homeworkIssue > 0 ? 'Action Needed' : 'Good'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.issueStatItem}>
                            <View style={styles.issueStatLeft}>
                                <View style={[styles.issueIcon, { backgroundColor: '#FFEBEE' }]}>
                                    <MaterialCommunityIcons name="shield-alert" size={24} color="#EB4B42" />
                                </View>
                                <View>
                                    <Text style={styles.issueStatLabel}>Discipline Issues</Text>
                                    <Text style={styles.issueStatValue}>{issueLogData || 0} issues</Text>
                                </View>
                            </View>
                            <View style={[
                                styles.issueBadge,
                                { backgroundColor: issueLogData > 0 ? '#FFEBEE' : '#E8F5E9' }
                            ]}>
                                <Text style={[
                                    styles.issueBadgeText,
                                    { color: issueLogData > 0 ? '#EB4B42' : '#27AE60' }
                                ]}>
                                    {issueLogData > 0 ? 'Monitor' : 'Clear'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Enhanced Subject Mentors List */}
                {mentorsData.length > 0 && (
                    <View style={styles.mentorsCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="account-group" size={24} color="#0C36FF" />
                            <Text style={styles.cardTitle}>Subject Mentors</Text>
                        </View>

                        {mentorsData.map((mentor, index) => (
                            <View key={index} style={styles.mentorCardItem}>
                                <View style={styles.mentorCardLeft}>
                                    <View style={styles.mentorImageWrapper}>
                                        <Image
                                            source={getProfileImageSource(mentor.sectionMentorPhoto)}
                                            style={styles.mentorImage}
                                        />
                                    </View>
                                    <View style={styles.mentorDetails}>
                                        <Text style={styles.mentorSubject}>{mentor.subject_name}</Text>
                                        <Text style={styles.mentorName}>{mentor.facultyName}</Text>
                                        <Text style={styles.mentorId}>ID: {mentor.facultyId}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                            </View>
                        ))}

                    </View>

                )}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Mentor Edit Modal */}
            {showMentorEdit && (
                <MentorSelectModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSelect={() => {
                        setModalVisible(false);
                        fetchAllDetails();
                    }}
                    gradeId={studentDetails.grade_id}
                    studentId={studentDetails.id}
                />
            )}
        </View>
    );
};

export default StudentProfileView;
