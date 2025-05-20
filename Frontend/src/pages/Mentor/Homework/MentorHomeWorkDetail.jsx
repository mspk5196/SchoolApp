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
    ToastAndroid
} from 'react-native';
import Done from '../../../assets/MentorPage/done.svg';
import Redo from '../../../assets/MentorPage/redo.svg';
import Clock from '../../../assets/MentorPage/clock.svg';
import PreviousIcon from '../../../assets/MentorPage/PrevBtn.svg';
import Checked from '../../../assets/MentorPage/checked.svg';
import Unchecked from '../../../assets/MentorPage/unchecked.svg';
const Staff = '../../../assets/MentorPage/staff.png';
import { API_URL } from '@env';

const MentorHomeWorkDetail = ({ navigation, route }) => {

    const { homeworkId } = route.params;
    const [homework, setHomework] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
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
                    date: data.homework.date,
                    level: `Level ${data.homework.level}`,
                    section: data.homework.section_name
                });

                const formattedSubmissions = data.homework.submissions.map(sub => ({
                    id: sub.student_roll,
                    name: sub.student_name,
                    date: sub.completed_date || '',
                    done: sub.status === 'Done',
                    redo: sub.status === 'Redo',
                    redo_count: sub.redo_count || 0,
                    lastChecked: sub.checked_date,
                    notCom: sub.status === 'Not completed',
                    profilePhoto: sub.profile_photo || Staff
                }));

                setSubmissions(formattedSubmissions);
                setRefreshing(false)
            }
        } catch (error) {
            console.error('Error fetching homework details:', error);
        } finally {
            setLoading(false);
        }
    };

    // const handleMarkSelectedAsDone = () => {
    //     setPendingAction('Done');
    //     setShowEvaluationModal(true);
    // };

    // const handleMarkSelectedAsRedo = () => {
    //     setPendingAction('Redo');
    //     setShowEvaluationModal(true);
    // };

    const confirmEvaluation = async () => {
        if (!pendingAction || selectedItems.length === 0) {
            Alert.alert('Error', 'Please select at least one submission and an action.');
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
                    studentRolls: selectedItems,
                    status: pendingAction
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
                                done: pendingAction === 'Done',
                                redo: pendingAction === 'Redo',
                                date: pendingAction === 'Done' ? new Date().toLocaleDateString('en-GB') : ''
                            }
                            : submission
                    )
                );

                setSelectedItems([]);
                setSelectionMode(false);
                setShowEvaluationModal(false);
                setPendingAction(null);
                fetchHomeworkDetails(); // Refresh the homework details
            }
        } catch (error) {
            console.error('Error updating homework status:', error);
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
                    status: 'Done'
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
                                date: new Date().toLocaleDateString('en-GB')
                            }
                            : submission
                    )
                );
                fetchHomeworkDetails(); // Refresh the homework details
            }
        } catch (error) {
            console.error('Error marking as done:', error);
        }
    };

    const handleMarkAsRedo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/mentor/updateHomeworkStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                    studentRolls: [id],
                    status: 'Redo'
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSubmissions(
                    submissions.map(submission =>
                        submission.id === id
                            ? {
                                ...submission,
                                redo: true,
                                done: false,
                                date: ''
                            }
                            : submission
                    )
                );
                fetchHomeworkDetails(); // Refresh the homework details
            }
        } catch (error) {
            console.error('Error marking as redo:', error);
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
            return Profile;
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
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{homework.level}</Text>
                    </View>
                    <Text style={styles.sectionText}>Section {homework.section}</Text>
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
                            <Text style={{ color: 'green', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>Last Checked At: {convertUTCtoIST12hr(item.lastChecked)}</Text>
                        ) : null}
                        {item.notCom ? (
                            <Text style={{ color: 'blue', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>Not Checked</Text>
                        ) : null}
                        {item.redo_count > 0 ? (
                            <View>
                                <Text style={{ color: 'red', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>Redo Count: {item.redo_count}</Text>
                                <Text style={{ color: 'green', fontSize: 11, marginTop: 5, width: 160, flexWrap: 'wrap' }}>Last Checked At: {convertUTCtoIST12hr(item.lastChecked)}</Text>
                            </View>
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
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    pendingAction === 'redo' && styles.selectedOption
                                ]}
                                onPress={() => setPendingAction('redo')}
                            >
                                <Redo />
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
                    <Text>Loading...</Text>
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
});

export default MentorHomeWorkDetail;