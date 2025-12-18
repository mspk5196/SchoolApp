import React, { use, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './IssueLogStyles';
import ApiService from '../../../../utils/ApiService';
import Nodata from '../../../../components/General/Nodata';
import { Header } from '../../../../components';

const CoordinatorMentorIssueLog = ({ route, navigation }) => {
    // console.log(route.params);
    
    const params = route.params && route.params.data ? route.params.data : (route.params || {});
    const { userData, selectedGrade: activeGrade } = params;

    //   console.log(userData);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [showFacultyPicker, setShowFacultyPicker] = useState(false);
    const [mentorsList, setMentorsList] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [complaint, setComplaint] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, []);

    useEffect(() => {
        fetchGradeMentors();
    }, [userData, activeGrade]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const data = await ApiService.post('/coordinator/mentor/getFacultyIssues', {
                registeredBy: userData.id,
                gradeId: activeGrade.grade_id
            });

            if (data.success) {
                setIssues(data.issues);
            }
        } catch (error) {
            console.error('Error fetching issues:', error);
            Alert.alert('Error', 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const fetchGradeMentors = async () => {
        try {
            setLoading(true);
            const response = await ApiService.post(`/coordinator/mentor/getGradeMentors`, {
                gradeID: activeGrade.grade_id
            });

            console.log('Grade mentors Data API Response:', response);

            if (response.success) {
                setMentorsList(response.gradeMentors.map(mentor => ({
                    faculty_id: mentor.faculty_id,
                    faculty_name: mentor.name,
                    faculty_roll: mentor.faculty_roll,
                    sections: mentor.sections,
                    specification: mentor.specification
                })));
            } else {
                Alert.alert('No Mentors Found', 'No mentors are associated with this grade');
            }
        } catch (error) {
            console.error('Error fetching mentors data:', error);
            Alert.alert('Error', 'Failed to fetch mentor data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddIssue = async () => {
        if (!complaint.trim()) {
            Alert.alert('Error', 'Please enter a complaint');
            return;
        }

        try {
            setSubmitting(true);
            const data = await ApiService.post('/coordinator/mentor/createFacultyIssue', {
                facultyId: selectedFaculty.faculty_id,
                complaint: complaint.trim(),
                registeredBy: userData.id
            });

            if (data.success) {
                Alert.alert('Success', 'Issue registered successfully');
                setShowAddModal(false);
                setComplaint('');
                fetchIssues();
            }
        } catch (error) {
            console.error('Error creating issue:', error);
            Alert.alert('Error', 'Failed to register issue');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const renderIssueItem = ({ item }) => (
        <View style={styles.issueCard}>
            <View style={styles.issueHeader}>
                <View style={styles.issueIdBadge}>
                    <Text style={styles.issueIdText}>#{item.id}</Text>
                </View>
                <View style={styles.dateContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                    <Text style={styles.dateText}>{formatDate(item.registered_at)}</Text>
                </View>
            </View>

            <View style={styles.facultyInfoRow}>
                <MaterialCommunityIcons name="account" size={16} color="#3B82F6" />
                <Text style={styles.facultyInfoText}>
                    {item.faculty_name} ({item.faculty_roll}) - {item.specification}
                </Text>
                <TouchableOpacity style={styles.callIcon}>
                    <Icon
                        name="call"
                        size={18}
                        color="#10B981"
                        onPress={() => {
                            if (item.phone) {
                                Linking.openURL(`tel:${item.phone}`);
                            } else {
                                Alert.alert('Info', 'Phone number not available');
                            }
                        }}
                    />
                </TouchableOpacity>
            </View>

            <Text style={styles.complaintText}>{item.complaint}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title={'Issue Log'} navigation={navigation}/>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading issues...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <Header title={'Issue Log'} navigation={navigation}/>

            <View style={styles.mentorInfoCard}>
                <MaterialCommunityIcons name="account-circle" size={40} color="#3B82F6" />
                <View style={styles.mentorInfoText}>
                    <Text style={styles.mentorName}>Grade {activeGrade.grade_id} - Issue Log</Text>
                    <Text style={styles.mentorRoll}>Registered by: {userData?.name}</Text>
                </View>
                <View style={styles.issueCountBadge}>
                    <Text style={styles.issueCountText}>{issues.length}</Text>
                    <Text style={styles.issueCountLabel}>Issues</Text>
                </View>
            </View>

            <FlatList
                data={issues}
                renderItem={renderIssueItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Nodata />}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add Issue Modal */}
            <Modal
                visible={showAddModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Register New Issue</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Icon name="close" size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Select Faculty/Mentor</Text>
                        <TouchableOpacity
                            style={styles.facultySelector}
                            onPress={() => setShowFacultyPicker(true)}
                        >
                            <Text style={selectedFaculty ? styles.selectedFacultyText : styles.placeholderText}>
                                {selectedFaculty ? `${selectedFaculty.faculty_name} (${selectedFaculty.faculty_roll}) - ${selectedFaculty.section_name}` : 'Select a faculty member'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Complaint</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe the issue..."
                            value={complaint}
                            onChangeText={setComplaint}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowAddModal(false);
                                    setComplaint('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={handleAddIssue}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Faculty Picker Modal */}
            <Modal
                visible={showFacultyPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFacultyPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Faculty</Text>
                            <TouchableOpacity onPress={() => setShowFacultyPicker(false)}>
                                <Icon name="close" size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={mentorsList}
                            keyExtractor={item => item.faculty_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.facultyItem,
                                        selectedFaculty?.faculty_id === item.faculty_id && styles.selectedFacultyItem
                                    ]}
                                    onPress={() => {
                                        setSelectedFaculty(item);
                                        setShowFacultyPicker(false);
                                    }}
                                >
                                    <View style={styles.facultyItemContent}>
                                        <Text style={styles.facultyItemName}>{item.faculty_name}</Text>
                                        <Text style={styles.facultyItemDetails}>
                                            {item.faculty_roll} • {item.specification} • Section {item.sections}
                                        </Text>
                                    </View>
                                    {selectedFaculty?.faculty_id === item.faculty_id && (
                                        <MaterialCommunityIcons name="check-circle" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CoordinatorMentorIssueLog;
