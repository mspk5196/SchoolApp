import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Image,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    RefreshControl,
    ToastAndroid,
    TextInput,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import Done from '../../../assets/MentorPage/done.svg';
import Redo from '../../../assets/MentorPage/redo.svg';
import Clock from '../../../assets/MentorPage/clock.svg';
import PreviousIcon from '../../../assets/MentorPage/PrevBtn.svg';
import Checked from '../../../assets/MentorPage/checked.svg';
import Unchecked from '../../../assets/MentorPage/unchecked.svg';
const Staff = '../../../assets/MentorPage/staff.png';
import { API_URL } from '../../../utils/env.js';

const MentorHomeWorkDetail = ({ navigation, route }) => {

    const { homeworkId } = route.params;
    const [homework, setHomework] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showRedoReasonModal, setShowRedoReasonModal] = useState(false);
    const [showSingleRedoModal, setShowSingleRedoModal] = useState(false);
    const [redoReason, setRedoReason] = useState('');
    const [singleRedoReason, setSingleRedoReason] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [currentStudentId, setCurrentStudentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const convertToISTDate = (isoString) => {
        const date = new Date(isoString);

        // Convert to IST by adding 5.5 hours (19800000 ms)
        const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

        // Format as "YYYY-MM-DD"
        const year = istDate.getFullYear();
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const day = String(istDate.getDate()).padStart(2, '0');

        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        fetchHomeworkDetails();
    }, []);

    const fetchHomeworkDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/mentor/getHomeworkDetails?homeworkId=${homeworkId}`);
            const data = await response.json();

            if (data.success) {
                setHomework({
                    subject: data.homework.subject_name,
                    date: data.homework.given_date,
                    topic: data.homework.topic_name,
                    batch: data.homework.batch_name,
                    section: data.homework.section_name,
                    grade: data.homework.grade_name
                });

                const formattedSubmissions = data.homework.submissions.map(sub => ({
                    id: sub.student_roll,
                    name: sub.student_name,
                    date: sub.submission_date || '',
                    done: sub.status === 'Marked_Complete',
                    redo: sub.status === 'Redo' && sub.redo_count > 0,
                    incomplete: sub.status === 'Marked_Incomplete' && (!sub.redo_count || sub.redo_count === 0),
                    notCom: sub.status === 'Assigned' || sub.status === 'Submitted' || sub.status === 'Late_Submitted' || sub.status === 'Missing',
                    status: sub.status,
                    attempts_used: sub.attempts_used || 0,
                    days_late: sub.days_late || 0,
                    redo_count: sub.redo_count || 0,
                    redo_reason: sub.redo_reason || '',
                    marked_date: sub.marked_date,
                    submission_date: sub.submission_date,
                    assigned_date: sub.assigned_date,
                    due_date: sub.due_date,
                    mentor_score: sub.mentor_score,
                    mentor_feedback: sub.mentor_feedback,
                    profilePhoto: sub.profile_photo || Staff
                }));

                setSubmissions(formattedSubmissions);
                console.log(formattedSubmissions);
                
                setRefreshing(false)
            }
        } catch (error) {
            console.error('Error fetching homework details:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmEvaluation = async () => {
        if (!pendingAction || selectedItems.length === 0) {
            Alert.alert('Error', 'Please select at least one submission and an action.');
            return;
        }

        // If redo is selected, show reason modal
        if (pendingAction === 'redo') {
            setShowEvaluationModal(false);
            setShowRedoReasonModal(true);
            return;
        }

        await updateHomeworkStatus();
    };

    const confirmRedo = async () => {
        if (!redoReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for redo.');
            return;
        }

        setShowRedoReasonModal(false);
        await updateHomeworkStatus();
    };

    const updateHomeworkStatus = async () => {
        try {
            let status;
            switch (pendingAction) {
                case 'done':
                    status = 'Marked_Complete';
                    break;
                case 'incomplete':
                    status = 'Marked_Incomplete';
                    break;
                case 'redo':
                    status = 'Redo';
                    break;
                default:
                    Alert.alert('Error', 'Invalid action selected.');
                    return;
            }

            const response = await fetch(`${API_URL}/api/mentor/updateHomeworkStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                    studentRolls: selectedItems,
                    status: status,
                    isRedo: pendingAction === 'redo',
                    redoReason: pendingAction === 'redo' ? redoReason : null,
                    mentorId: 1 // You should get this from route params or context
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Update local state
                setSubmissions(
                    submissions.map(submission =>
                        selectedItems.includes(submission.id)
                            ? {
                                ...submission,
                                done: pendingAction === 'done',
                                redo: pendingAction === 'redo',
                                incomplete: pendingAction === 'incomplete',
                                notCom: false,
                                status: status,
                                marked_date: new Date().toISOString(),
                                redo_reason: pendingAction === 'redo' ? redoReason : submission.redo_reason,
                                redo_count: pendingAction === 'redo' ? (submission.redo_count || 0) + 1 : submission.redo_count
                            }
                            : submission
                    )
                );

                setSelectedItems([]);
                setSelectionMode(false);
                setShowEvaluationModal(false);
                setShowRedoReasonModal(false);
                setPendingAction(null);
                setRedoReason('');
                fetchHomeworkDetails(); // Refresh the homework details
                Alert.alert('Success', 'Homework status updated successfully.');
            } else {
                Alert.alert('Error', data.message || 'Failed to update homework status.');
            }
        } catch (error) {
            console.error('Error updating homework status:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };

    const handleMarkAsDone = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/mentor/updateHomeworkStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                    studentRolls: [id],
                    status: 'Marked_Complete',
                    isRedo: false,
                    mentorId: 1 // You should get this from route params or context
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSubmissions(
                    submissions.map(submission =>
                        submission.id === id
                            ? {
                                ...submission,
                                done: true,
                                redo: false,
                                incomplete: false,
                                notCom: false,
                                status: 'Marked_Complete',
                                marked_date: new Date().toISOString()
                            }
                            : submission
                    )
                );
                fetchHomeworkDetails(); // Refresh the homework details
                Alert.alert('Success', 'Homework marked as done successfully.');
            } else {
                Alert.alert('Error', data.message || 'Failed to update homework status.');
            }
        } catch (error) {
            console.error('Error marking as done:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };

    const handleMarkAsRedo = async (id) => {
        setCurrentStudentId(id);
        setSingleRedoReason('');
        setShowSingleRedoModal(true);
    };

    const confirmSingleRedo = async () => {
        if (!singleRedoReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for redo.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/mentor/updateHomeworkStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                    studentRolls: [currentStudentId],
                    status: 'Redo',
                    isRedo: true,
                    redoReason: singleRedoReason,
                    mentorId: 1
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSubmissions(
                    submissions.map(submission =>
                        submission.id === currentStudentId
                            ? {
                                ...submission,
                                redo: true,
                                done: false,
                                incomplete: false,
                                notCom: false,
                                status: 'Redo',
                                redo_reason: singleRedoReason,
                                marked_date: new Date().toISOString(),
                                redo_count: (submission.redo_count || 0) + 1
                            }
                            : submission
                    )
                );
                setShowSingleRedoModal(false);
                setSingleRedoReason('');
                setCurrentStudentId(null);
                fetchHomeworkDetails(); // Refresh the homework details
                Alert.alert('Success', 'Homework marked for redo successfully.');
            } else {
                Alert.alert('Error', data.message || 'Failed to update homework status.');
            }
        } catch (error) {
            console.error('Error marking as redo:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };

    const handleMarkAsIncomplete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/mentor/updateHomeworkStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                    studentRolls: [id],
                    status: 'Marked_Incomplete',
                    isRedo: false,
                    mentorId: 1
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSubmissions(
                    submissions.map(submission =>
                        submission.id === id
                            ? {
                                ...submission,
                                done: false,
                                redo: false,
                                incomplete: true,
                                notCom: false,
                                status: 'Marked_Incomplete',
                                marked_date: new Date().toISOString()
                            }
                            : submission
                    )
                );
                fetchHomeworkDetails(); // Refresh the homework details
                Alert.alert('Success', 'Homework marked as incomplete successfully.');
            } else {
                Alert.alert('Error', data.message || 'Failed to update homework status.');
            }
        } catch (error) {
            console.error('Error marking as incomplete:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };


    // Function to toggle selection mode
    const toggleSelectionMode = (item) => {
        setSelectionMode(!selectionMode);
        if (selectionMode && !item.done) {
            setSelectedItems([]);
        }
    };

    // Function to toggle selection of an item
    const [it, setIt] = useState([])
    const toggleItemSelection = (id, item) => {
        if (item.done) return; // ✅ Skip if already Done

        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    // Function to select all items
    const selectAllItems = () => {
        const notDoneItems = submissions.filter(item => !item.done).map(item => item.id);
        if (selectedItems.length === notDoneItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(notDoneItems);
        }
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

    // Header component for the screen
    const Header = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <PreviousIcon />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Homework</Text>
            </View>
        );
    };

    // Assignment info component
    const AssignmentInfo = () => {
        if (!homework) return null;

        return (
            <View style={styles.assignmentCard}>
                <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentTitle}>{homework.subject}</Text>
                    <Text style={styles.assignmentDate}>{convertToISTDate(homework.date)}</Text>
                </View>
                <View style={styles.assignmentDetails}>
                    <View style={styles.gradeSection}>
                        <Text style={styles.gradeText}>{homework.grade} - {homework.section}</Text>
                    </View>
                </View>
                <View style={styles.topicBatchInfo}>
                    <View style={styles.topicBadge}>
                        <Text style={styles.topicText}>Topic: {homework.topic || 'No Topic'}</Text>
                    </View>
                    <View style={styles.batchBadge}>
                        <Text style={styles.batchText}>Batch: {homework.batch || 'No Batch'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    function convertUTCtoIST12hr(utcDateStr) {
        const utcDate = new Date(utcDateStr);

        // Convert to IST by adding 5 hours 30 minutes (in milliseconds)
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffsetMs);

        // Format to 12-hour time
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };

        return istDate.toLocaleString('en-IN', options);
    }

    // Submission item component
    const SubmissionItem = ({ item }) => {
        const isSelected = selectedItems.includes(item.id);

        const handleLongPress = () => {
            if (item.done) {
                ToastAndroid.show("This submission is already marked as done", ToastAndroid.SHORT);
                return;
            }

            if (!selectionMode) {
                toggleSelectionMode(item);
                toggleItemSelection(item.id, item);
            }
        };

        const handlePress = () => {
            if (selectionMode && !item.done) {
                toggleItemSelection(item.id, item);
            }
        };

        return (
            <TouchableOpacity
                style={[styles.submissionItem, item.done && styles.disabledItem]}
                onLongPress={handleLongPress}
                onPress={handlePress}
                delayLongPress={500}
                activeOpacity={0.8}
            >
                <View style={styles.userInfo}>
                    {selectionMode && (
                        <View style={styles.checkboxContainer}>
                            {isSelected ? <Checked height={15} width={15} /> : <Unchecked height={15} width={15} />}
                        </View>
                    )}
                    {item.profilePhoto ? (
                        <Image source={getProfileImageSource(item.profilePhoto)} style={styles.avatar} />
                    ) : (
                        <Image source={Staff} style={styles.avatar} />
                    )}
                    <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.submissionDate}>{item.id}</Text>
                        {item.done ? (
                            <Text style={{ color: 'green', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>
                                Marked Complete: {item.marked_date ? convertUTCtoIST12hr(item.marked_date) : 'N/A'}
                            </Text>
                        ) : null}
                        {item.redo ? (
                            <View>
                                <Text style={{ color: 'red', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>
                                    Marked for Redo: {item.marked_date ? convertUTCtoIST12hr(item.marked_date) : 'N/A'}
                                </Text>
                                {item.redo_reason ? (
                                    <Text style={{ color: 'red', fontSize: 10, marginTop: 2, width: 160, flexWrap: 'wrap', fontStyle: 'italic' }}>
                                        Reason: {item.redo_reason}
                                    </Text>
                                ) : null}
                                {item.redo_count > 0 ? (
                                    <Text style={{ color: 'red', fontSize: 10, marginTop: 2, width: 160, flexWrap: 'wrap', fontWeight: 'bold' }}>
                                        Redo Count: {item.redo_count}
                                    </Text>
                                ) : null}
                            </View>
                        ) : null}
                        {item.incomplete ? (
                            <Text style={{ color: 'orange', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>
                                Marked Incomplete: {item.marked_date ? convertUTCtoIST12hr(item.marked_date) : 'N/A'}
                            </Text>
                        ) : null}
                        {item.notCom ? (
                            <Text style={{ color: 'blue', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>
                                Status: {item.status}
                            </Text>
                        ) : null}
                        {item.attempts_used > 0 ? (
                            <Text style={{ color: 'orange', fontSize: 11, marginTop: 2, width: 160, flexWrap: 'wrap' }}>
                                Attempts: {item.attempts_used}
                            </Text>
                        ) : null}
                        {item.days_late > 0 ? (
                            <Text style={{ color: 'red', fontSize: 11, marginTop: 2, width: 160, flexWrap: 'wrap' }}>
                                Days Late: {item.days_late}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {!selectionMode && (
                    <View style={styles.actionButtons}>
                        {item.done ? (
                            <View style={styles.timeInfo}>
                                <Text style={styles.timeText}>
                                    Completed
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.timeInfo}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleMarkAsRedo(item.id)}>
                                    <Redo />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleMarkAsIncomplete(item.id)}>
                                    <Text style={styles.incompleteText}>INC</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleMarkAsDone(item.id)}>
                                    <Done />
                                </TouchableOpacity>
                            </View>

                        )}

                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Selection mode header component
    const SelectionHeader = () => {
        const notDoneItems = submissions.filter(item => !item.done);
        const allSelected = selectedItems.length === notDoneItems.length && notDoneItems.every(item => selectedItems.includes(item.id));

        return (
            <View style={styles.selectionHeader}>
                <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={selectAllItems}
                >
                    {allSelected ? <Checked height={15} width={15} /> : <Unchecked height={15} width={15} />}
                    <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={toggleSelectionMode}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    };


    // Evaluation Modal component
    const EvaluationModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showEvaluationModal}
                onRequestClose={() => setShowEvaluationModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowEvaluationModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Evaluate Selected Submissions</Text>
                        <View style={styles.modalOptionsContainer}>

                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    pendingAction === 'done' && styles.selectedOption
                                ]}
                                onPress={() => setPendingAction('done')}
                            >
                                <Done />
                                <Text style={styles.modalOptionText}>Done</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    pendingAction === 'redo' && styles.selectedOption
                                ]}
                                onPress={() => setPendingAction('redo')}
                            >
                                <Redo />
                                <Text style={styles.modalOptionText}>Redo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    pendingAction === 'incomplete' && styles.selectedOption
                                ]}
                                onPress={() => setPendingAction('incomplete')}
                            >
                                <Text style={styles.incompleteText}>INC</Text>
                                <Text style={styles.modalOptionText}>Incomplete</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                !pendingAction && styles.disabledButton
                            ]}
                            onPress={confirmEvaluation}
                            disabled={!pendingAction}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        );
    };

    // Single Redo Reason Modal component
    const SingleRedoReasonModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSingleRedoModal}
                onRequestClose={() => setShowSingleRedoModal(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Overlay: closes modal only when tapping outside content */}
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => {
                            setShowSingleRedoModal(false);
                            setSingleRedoReason('');
                            setCurrentStudentId(null);
                        }}
                    />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Redo Reason</Text>
                            <Text style={styles.reasonSubtitle}>
                                Please provide a reason for marking as redo:
                            </Text>
                            <TextInput
                                style={styles.reasonInput}
                                placeholder="Enter reason here..."
                                value={singleRedoReason}
                                onChangeText={setSingleRedoReason}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                autoFocus={true}
                            // No need for onBlur/onFocus manipulations!
                            />
                            <View style={styles.reasonModalButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.reasonButton,
                                        styles.cancelReasonButton,
                                    ]}
                                    onPress={() => {
                                        setShowSingleRedoModal(false);
                                        setSingleRedoReason('');
                                        setCurrentStudentId(null);
                                    }}
                                >
                                    <Text style={styles.cancelReasonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.reasonButton,
                                        styles.submitReasonButton,
                                        !singleRedoReason.trim() && styles.disabledButton,
                                    ]}
                                    onPress={confirmSingleRedo}
                                    disabled={!singleRedoReason.trim()}
                                >
                                    <Text style={styles.submitReasonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        );
    };

    // Redo Reason Modal component
    const RedoReasonModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showRedoReasonModal}
                onRequestClose={() => setShowRedoReasonModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowRedoReasonModal(false)}
                >
                    <Pressable
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={styles.modalTitle}>Redo Reason</Text>
                        <Text style={styles.reasonSubtitle}>Please provide a reason for marking as redo:</Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Enter reason here..."
                            value={redoReason}
                            onChangeText={setRedoReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            autoFocus={false}
                        />
                        <View style={styles.reasonModalButtons}>
                            <TouchableOpacity
                                style={[styles.reasonButton, styles.cancelReasonButton]}
                                onPress={() => {
                                    setShowRedoReasonModal(false);
                                    setRedoReason('');
                                    setPendingAction(null);
                                }}
                            >
                                <Text style={styles.cancelReasonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.reasonButton,
                                    styles.submitReasonButton,
                                    !redoReason.trim() && styles.disabledButton
                                ]}
                                onPress={confirmRedo}
                                disabled={!redoReason.trim()}
                            >
                                <Text style={styles.submitReasonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        );
    };

    // Evaluate Button component
    const EvaluateButton = () => {
        return (
            <TouchableOpacity
                style={[
                    styles.evaluateButton,
                    selectedItems.length === 0 && styles.disabledButton
                ]}
                onPress={() => selectedItems.length > 0 && setShowEvaluationModal(true)}
                disabled={selectedItems.length === 0}
            >
                <Text style={styles.evaluateButtonText}>Evaluate ({selectedItems.length})</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <Header />
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#3557FF" />
                        <Text>Loading...</Text>
                    </View>
                ) : (
                    <>
                        <AssignmentInfo />
                        {selectionMode && <SelectionHeader />}
                        <FlatList
                            data={submissions}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={async () => {
                                        setRefreshing(true);
                                        await fetchHomeworkDetails();
                                        setRefreshing(false);
                                    }}
                                    colors={['#3557FF']}
                                    tintColor="#3557FF"
                                />
                            }
                            renderItem={({ item }) => <SubmissionItem item={item} />}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                        {selectionMode && <EvaluateButton />}
                        <EvaluationModal />
                        <RedoReasonModal />
                        <SingleRedoReasonModal />
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    sectionText: {
        color: '#666',
        fontSize: 12,
        marginLeft: 8,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
        paddingTop: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#Fafafa',
        borderColor: '#00000080',
    },
    backButton: {
        paddingRight: 10,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
    },
    selectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    selectAllText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#3557FF',
        fontWeight: '600',
    },
    cancelButton: {
        padding: 8,
    },
    cancelText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#C0C0C0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#3557FF',
    },
    assignmentCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        margin: 16,
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 5,
        // height: 0,
    },
    assignmentInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    assignmentTitle: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    assignmentDate: {
        fontSize: 14,
        color: '#666',
    },
    assignmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gradeSection: {
        flex: 1,
    },
    gradeText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    topicBatchInfo: {
        flexDirection: 'column',
        gap: 6,
    },
    topicBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    topicText: {
        color: '#1976D2',
        fontWeight: '500',
        fontSize: 12,
    },
    batchBadge: {
        backgroundColor: '#F3E5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    batchText: {
        color: '#7B1FA2',
        fontWeight: '500',
        fontSize: 12,
    },
    levelBadge: {
        backgroundColor: '#E3FCEF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        color: '#00B386',
        fontWeight: '500',
        fontSize: 12,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        marginLeft: 4,
        color: '#007AFF',
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 190, // Extra padding to account for the Evaluate button
    },
    disabledItem: {
        opacity: 0.5,
    },
    submissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 4,
    },
    selectedItem: {
        backgroundColor: '#EBEEFF',
        borderWidth: 1,
        borderColor: '#3557FF',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userName: {
        fontWeight: '500',
        fontSize: 14,
        color: '#333',
    },
    submissionDate: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '75%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 20,
    },
    modalOption: {
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
    },
    selectedOption: {
        backgroundColor: '#EBEEFF',
        borderColor: '#3557FF',
    },
    modalOptionText: {
        marginTop: 8,
        fontSize: 14,
        color: '#333',
    },
    confirmButton: {
        backgroundColor: '#3557FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#C0C0C0',
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    evaluateButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#3557FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    evaluateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    incompleteText: {
        color: '#FF6600',
        fontSize: 12,
        fontWeight: 'bold',
    },
    reasonSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 20,
        minHeight: 80,
        backgroundColor: '#F9F9F9',
    },
    reasonModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    reasonButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelReasonButton: {
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#D0D0D0',
    },
    submitReasonButton: {
        backgroundColor: '#3557FF',
    },
    cancelReasonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    submitReasonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default MentorHomeWorkDetail;