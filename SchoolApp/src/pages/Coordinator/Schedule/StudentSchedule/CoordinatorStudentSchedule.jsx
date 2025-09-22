import { apiFetch } from "../../../../utils/apiClient.js";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView, FlatList, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './StudentScheduleStyle.jsx';
import { API_URL } from '../../../../utils/env';
import BackIcon from '../../../../assets/CoordinatorPage/BackLogs/Back.svg';

const CoordinatorStudentSchedule = ({ navigation, route }) => {
    const { activeGrade } = route.params;
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedule, setSchedule] = useState([]);
    const [overrides, setOverrides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [showStudentList, setShowStudentList] = useState(true);

    const [overrideData, setOverrideData] = useState({
        id: null,
        daily_schedule_id: null,
        activity_type: '',
        start_time: '09:00',
        end_time: '10:00',
        notes: '',
        subject_id: null,
        mentor_id: null,
        ssa_sub_activity_id: null,
        topic_id: null,
        activity_instructions: '',
        is_assessment: false,
        total_marks: '',
        schedule_source: null, // Track if general or student_specific
        session_id: null, // For student-specific schedules
        session_type: null, // Academic or Assessment
        batch_id: null // Add batch_id
    });

    // Dropdown data states
    const [subjects, setSubjects] = useState([]);
    const [activities, setActivities] = useState([]);
    const [subActivities, setSubActivities] = useState([]);
    const [topics, setTopics] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loadingDropdown, setLoadingDropdown] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!activeSection) return;

            setLoading(true);
            try {
                const response = await apiFetch(`/coordinator/schedule/getSectionStudents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sectionId: activeSection })
                });
                const data = response
                if (data.success) {
                    setStudents(data.sectionStudent);
                } else {
                    Alert.alert('Error', data.message || 'Failed to fetch students');
                }
            } catch (error) {
                console.error("Error fetching students:", error);
                Alert.alert('Error', 'Failed to fetch students data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [activeSection]);

    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                const response = await apiFetch(`/coordinator/weekly-schedule/sections`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activeGrade })
                });
                const data = response
                if (data.success && data.gradeSections.length > 0) {
                    setSections(data.gradeSections);
                    setActiveSection(data.gradeSections[0].id);
                } else {
                    Alert.alert('No Sections Found', data.message || 'No sections are associated with this grade.');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch sections data.');
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, [activeGrade]);

    const fetchStudentSchedule = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`${API_URL}/api/coordinator/schedule/student/${dateStr}/${selectedStudent}`);
            const data = response
            if (data.success) {
                setSchedule(data.schedule);
                // setOverrides(data.overrides);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentSchedule();
    }, [selectedStudent, selectedDate]);

    // Helper functions for time conversion
    const timeStringToDate = (timeString) => {
        const today = new Date();
        const [hours, minutes] = timeString.split(':');
        today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return today;
    };

    const dateToTimeString = (date) => {
        return date.toTimeString().slice(0, 5); // HH:MM format
    };

    // Fetch dropdown data functions
    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/getSubjects`);
            const data = response
            if (data.success) {
                setSubjects(data.subjects || []);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    const fetchActivitiesForSubject = async (subjectId) => {
        if (!subjectId) {
            setActivities([]);
            return;
        }
        try {
            const response = await apiFetch(`/coordinator/schedule/student/getSubjectActivity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId })
            });
            const data = response
            if (data.success) {
                setActivities(data.subjectActivities || []);
                // console.log("Fetched subject activities:", data.subjectActivities);
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
            setActivities([]);
        }
    };

    const fetchSubActivitiesForActivity = async (activityId, subjectId) => {
        if (!activityId || !subjectId) {
            setSubActivities([]);
            return;
        }
        try {
            const response = await apiFetch(`/coordinator/schedule/student/getSectionSubjectSubActivities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityId, subjectId })
            });
            const data = response
            if (data.success) {
                setSubActivities(data.sectionSubjectSubActivity || []);
            }
        } catch (error) {
            console.error("Error fetching sub activities:", error);
            setSubActivities([]);
        }
    };

    const fetchTopicsForSubActivity = async (subActivityId, subjectId) => {
        if (!subActivityId || !subjectId) {
            setTopics([]);
            return;
        }
        try {
            const response = await apiFetch(`/coordinator/schedule/student/getTopicHierarchyBySubActivity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subActivityId,
                    subjectId,
                    gradeId: activeGrade,
                    activityId: overrideData.activity_type
                })
            });
            const data = response
            if (data.success) {
                setTopics(data.topics || []);
                // console.log("Fetched topics:", data.topics);
                fetchVenues();
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            setTopics([]);
        }
    };

    const fetchMentors = async () => {
        try {
            const response = await apiFetch(`/coordinator/mentor/getGradeMentors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gradeID: activeGrade })
            });
            const data = response
            if (data.success) {
                setMentors(data.gradeMentors || []);
                // console.log("Fetched mentors:", data.gradeMentors);
            }
        } catch (error) {
            console.error("Error fetching mentors:", error);
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await apiFetch(`/coordinator/schedule/student/getAllVenuesByTime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: overrideData.start_time,
                    endTime: overrideData.end_time,
                    date: selectedDate.toISOString().split('T')[0]
                })
            });
            const data = response
            if (data.success) {
                setVenues(data.venues || []);
                console.log("Fetched venues:", data.venues);
            } else {
                console.error("Failed to fetch venues:", data.message);
                setVenues([]);
            }
        } catch (error) {
            console.error("Error fetching venues:", error);
            setVenues([]);
        }
    };

    // Effect hooks for dependent dropdown updates
    useEffect(() => {
        if (overrideData.subject_id) {
            fetchActivitiesForSubject(overrideData.subject_id);
        } else {
            setActivities([]);
            setSubActivities([]);
            setTopics([]);
        }
    }, [overrideData.subject_id]);

    useEffect(() => {
        if (overrideData.activity_type && overrideData.subject_id) {
            const selectedActivity = activities.find(act => act.activity_type === overrideData.activity_type);
            if (selectedActivity) {
                fetchSubActivitiesForActivity(selectedActivity.id, overrideData.subject_id);
            }
        } else {
            setSubActivities([]);
            setTopics([]);
        }
    }, [overrideData.activity_type, activities]);

    useEffect(() => {
        if (overrideData.ssa_sub_activity_id && overrideData.subject_id) {
            fetchTopicsForSubActivity(overrideData.ssa_sub_activity_id, overrideData.subject_id);
        } else {
            setTopics([]);
        }
    }, [overrideData.ssa_sub_activity_id]);

    const handleSaveOverride = async () => {
        // Validate required fields
        if (!overrideData.subject_id || !overrideData.activity_type || !overrideData.mentor_id) {
            Alert.alert("Validation Error", "Please fill in all required fields (Subject, Activity Type, Mentor)");
            return;
        }

        if (overrideData.is_assessment && !overrideData.total_marks) {
            Alert.alert("Validation Error", "Please enter total marks for assessment");
            return;
        }

        setLoading(true);
        try {
            let response;

            // Check if this is a student-specific schedule (no pa_id) or general schedule
            if (overrideData.schedule_source === 'student_specific' && overrideData.session_id) {
                // Use new endpoint for student-specific schedules
                console.log("Using student-specific edit endpoint");
                response = await apiFetch(`/coordinator/schedule/student/edit-specific`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: overrideData.session_id,
                        sessionType: overrideData.session_type,
                        studentRoll: selectedStudent,
                        sectionId: activeSection,
                        mentorId: overrideData.mentor_id,
                        ssaSubActivityId: overrideData.ssa_sub_activity_id,
                        topicId: overrideData.topic_id,
                        startTime: overrideData.start_time,
                        endTime: overrideData.end_time,
                        venueId: overrideData.venue_id,
                        activityInstructions: overrideData.activity_instructions,
                        isAssessment: overrideData.is_assessment,
                        totalMarks: overrideData.is_assessment ? parseInt(overrideData.total_marks) : null,
                        date: overrideData.date,
                        subjectId: overrideData.subject_id,
                        batchId: overrideData.batch_id
                    })
                });
            } else {
                // Use existing override endpoint for general schedules
                console.log("Using general schedule override endpoint");
                response = await apiFetch(`/coordinator/schedule/student/override`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...overrideData,
                        student_roll: selectedStudent,
                        total_marks: overrideData.is_assessment ? parseInt(overrideData.total_marks) : null
                    })
                });
            }

            const data = response
            if (data.success) {
                Alert.alert("Success", "Schedule updated successfully.");
                setModalVisible(false);
                fetchStudentSchedule();
            } else {
                Alert.alert("Error", data.message || "Failed to update schedule.");
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            Alert.alert("Error", "Failed to update schedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditPress = async (period) => {
        console.log("Editing period:", period);

        setLoadingDropdown(true);

        // Initialize override data with current period data
        setOverrideData({
            id: null, // This is for a new override
            daily_schedule_id: period.daily_schedule_id,
            mentor_id: period.mentor_id,
            ssa_sub_activity_id: period.ssa_sub_activity_id,
            topic_id: period.topic_id,
            pa_id: period.period_activity_id,
            session_id: period.session_id, // For student-specific schedules
            schedule_source: period.schedule_source, // Track schedule type
            session_type: period.session_type, // Academic or Assessment
            batch_id: period.batch_id, // Add batch_id
            activity_type: period.activity_type,
            sub_activity_name: period.sub_activity_name,
            start_time: period.start_time,
            end_time: period.end_time,
            date: selectedDate.toISOString().split('T')[0],
            subject_id: period.subject_id,
            subject_name: period.subject_name,
            venue_id: period.venue_id,
            topic_hierarchy_path: period.topic_hierarchy_path,
            mentor_roll: period.mentor_roll,
            activity_instructions: period.activity_instructions || '',
            is_assessment: Boolean(period.is_assessment),
            total_marks: period.total_marks || '',
            notes: '',
            student_roll: selectedStudent,
            section_id: activeSection,
        });

        // Fetch all dropdown data
        try {
            await Promise.all([
                fetchSubjects(),
                fetchMentors()
            ]);

            // Fetch dependent data if subject is already selected
            if (period.subject_id) {
                await fetchActivitiesForSubject(period.subject_id);

                if (period.activity_type) {
                    // Find activity ID from activity type
                    const activities = await apiFetch(`/coordinator/schedule/student/getSubjectActivity`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subjectId: period.subject_id })
                    }).then(res => res.json());

                    if (activities.success) {
                        const selectedActivity = activities.subjectActivities.find(act => act.activity_type === period.activity_type);
                        if (selectedActivity && period.ssa_sub_activity_id) {
                            await fetchSubActivitiesForActivity(selectedActivity.id, period.subject_id);
                            await fetchTopicsForSubActivity(period.ssa_sub_activity_id, period.subject_id);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
            Alert.alert("Error", "Failed to load form data");
        } finally {
            setLoadingDropdown(false);
        }

        setModalVisible(true);
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student.roll);
        setShowStudentList(false);
    };

    const handleBackToStudentList = () => {
        setSelectedStudent(null);
        setShowStudentList(true);
        setSchedule([]);
        // setOverrides([]);
    };

    const renderStudentItem = ({ item }) => (
        <TouchableOpacity
            style={styles.studentItem}
            onPress={() => handleStudentSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentRoll}>Roll: {item.roll}</Text>
                <Text style={styles.studentDetails}>
                    Grade: {activeGrade} | Section: {activeSection && sections.find(s => s.id === activeSection)?.section_name}
                </Text>
            </View>
            <Text style={styles.selectText}>View Schedule →</Text>
        </TouchableOpacity>
    );

    const renderStudentList = () => (
        <View style={styles.studentListContainer}>
            <Text style={styles.sectionTitle}>
                Students in Section {sections.find(s => s.id === activeSection)?.section_name}
            </Text>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centerLoader} />
            ) : students.length > 0 ? (
                <FlatList
                    data={students}
                    renderItem={renderStudentItem}
                    keyExtractor={(item) => item.roll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.studentList}
                />
            ) : (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No students found for this section</Text>
                </View>
            )}
        </View>
    );

    const renderPeriod = (period, index) => {
        // Create a unique key combining multiple identifiers
        const uniqueKey = `${period.daily_schedule_id}_${period.period_activity_id || 'no_pa'}_${period.start_time}_${index}`;

        return (
            <View key={uniqueKey} style={styles.periodContainer}>
                <View style={styles.periodHeader}>
                    <Text style={styles.periodTime}>{period.start_time} - {period.period_end_time}</Text>
                    <Text style={styles.periodSubject}>{period.subject_name} - (Batch {period.batch_number})</Text>

                    <TouchableOpacity
                        onPress={() => handleEditPress(period)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.editButtonText}>Edit for Student</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.activityContainer}>
                    {period.activity_type ? (
                        <View style={styles.activity}>
                            {/* Schedule type indicator */}
                            {period.schedule_source === 'student_specific' && (
                                <Text style={styles.studentSpecificLabel}>
                                    🎯 Student-Specific {period.session_type}
                                </Text>
                            )}
                            <Text>{period.start_time} - {period.end_time}: {period.activity_type} - {period.sub_activity_name}</Text>
                            <Text>Mentor: {period.mentor_name}({period.mentor_roll})</Text>
                            <Text>Topic: {period.topic_hierarchy_path}</Text>
                            <Text>Venue: {period.venue_name}</Text>
                            {period.is_assessment ? (
                                <View style={{ marginTop: 4 }}>
                                    <Text style={{ fontWeight: 'bold', color: 'black' }}>Assessment Type: {period.session_type}</Text>
                                    <Text style={{ fontWeight: 'bold', color: 'black' }}>Total Marks: {period.total_marks}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <Text>No specific activity</Text>
                    )}
                </View>
                {/* {period.overrides && (
                    <View style={styles.overridesContainer}>
                        <Text style={styles.overrideTitle}>Student-Specific Schedule:</Text>
                        {period.overrides.map(override => (
                            <View key={override.id} style={styles.overrideItem}>
                                <Text>{override.start_time} - {override.end_time}: {override.activity_type}</Text>
                                <Text>Notes: {override.notes}</Text>
                            </View>
                        ))}
                    </View>
                )} */}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (selectedStudent) {
                            handleBackToStudentList()
                        }
                        else {
                            navigation.goBack();
                        }
                    }}
                    style={styles.backButtonContainer}
                >
                    <BackIcon width={24} height={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {selectedStudent ?
                        `${students.find(s => s.roll === selectedStudent)?.name || 'Student'} Schedule` :
                        'Student Schedule'
                    }
                </Text>
                {selectedStudent && (
                    <TouchableOpacity
                        onPress={handleBackToStudentList}
                        style={styles.backToListButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backToListText}>All Students</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Section Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabsContainer}>
                {sections.map(section => (
                    <TouchableOpacity
                        key={section.id}
                        style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]}
                        onPress={() => {
                            setActiveSection(section.id);
                            handleBackToStudentList(); // Reset to student list when changing section
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>
                            Section {section.section_name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {showStudentList ? (
                    renderStudentList()
                ) : (
                    <View style={styles.scheduleContainer}>
                        {/* Date Picker and Controls */}
                        <View style={styles.scheduleControls}>
                            <View style={styles.studentInfoHeader}>
                                <Text style={styles.selectedStudentName}>
                                    {students.find(s => s.roll === selectedStudent)?.name}
                                </Text>
                                <Text style={styles.selectedStudentRoll}>
                                    Roll: {selectedStudent}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDatePickerVisibility(true)}
                                style={styles.datePickerButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.datePickerText}>
                                    📅 {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker Modal */}
                        {isDatePickerVisible && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setDatePickerVisibility(false);
                                    if (date) setSelectedDate(date);
                                }}
                            />
                        )}

                        {/* Schedule List */}
                        {loading ? (
                            <ActivityIndicator size="large" style={styles.centerLoader} />
                        ) : (
                            <ScrollView style={styles.scheduleScrollView}>
                                {schedule.length > 0 ? (
                                    schedule.map((period, index) => renderPeriod(period, index))
                                ) : (
                                    <View style={styles.noDataContainer}>
                                        <Text style={styles.noScheduleText}>
                                            No schedule found for {selectedDate.toLocaleDateString()}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>

            {/* Override Modal */}
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Edit Student Schedule</Text>

                            {/* Schedule Type Indicator */}
                            {overrideData.schedule_source && (
                                <View style={styles.scheduleTypeIndicator}>
                                    <Text style={styles.scheduleTypeText}>
                                        {overrideData.schedule_source === 'student_specific'
                                            ? `📝 Student-Specific ${overrideData.session_type || ''} Schedule`
                                            : '📋 General Class Schedule'
                                        }
                                    </Text>
                                </View>
                            )}

                            {loadingDropdown && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#007AFF" />
                                    <Text style={styles.loadingText}>Loading form data...</Text>
                                </View>
                            )}

                            {/* Time Fields */}
                            <View style={styles.timeContainer}>
                                <View style={styles.timeField}>
                                    <Text style={styles.fieldLabel}>Start Time</Text>
                                    <TouchableOpacity
                                        style={styles.timePickerButton}
                                        onPress={() => setStartTimePickerVisibility(true)}
                                        activeOpacity={0.7}
                                        disabled
                                    >
                                        <Text style={styles.timePickerText}>{overrideData.start_time}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.timeField}>
                                    <Text style={styles.fieldLabel}>End Time</Text>
                                    <TouchableOpacity
                                        style={styles.timePickerButton}
                                        onPress={() => setEndTimePickerVisibility(true)}
                                        activeOpacity={0.7}
                                        disabled
                                    >
                                        <Text style={styles.timePickerText}>{overrideData.end_time}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Start Time Picker */}
                            {isStartTimePickerVisible && (
                                <DateTimePicker
                                    value={timeStringToDate(overrideData.start_time)}
                                    mode="time"
                                    display="spinner"
                                    onChange={(event, selectedTime) => {
                                        setStartTimePickerVisibility(false);
                                        if (selectedTime) {
                                            setOverrideData({
                                                ...overrideData,
                                                start_time: dateToTimeString(selectedTime)
                                            });
                                        }
                                    }}
                                />
                            )}

                            {/* End Time Picker */}
                            {isEndTimePickerVisible && (
                                <DateTimePicker
                                    value={timeStringToDate(overrideData.end_time)}
                                    mode="time"
                                    display="spinner"
                                    onChange={(event, selectedTime) => {
                                        setEndTimePickerVisibility(false);
                                        if (selectedTime) {
                                            setOverrideData({
                                                ...overrideData,
                                                end_time: dateToTimeString(selectedTime)
                                            });
                                        }
                                    }}
                                />
                            )}

                            {/* Subject Dropdown */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Subject</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.subject_id}
                                        onValueChange={(value) => {
                                            setOverrideData({
                                                ...overrideData,
                                                subject_id: value,
                                                activity_type: '',
                                                ssa_sub_activity_id: null,
                                                topic_id: null
                                            });
                                        }}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Subject" value={null} />
                                        {subjects.map(subject => (
                                            <Picker.Item
                                                key={subject.id}
                                                label={subject.subject_name}
                                                value={subject.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Activity Type Dropdown */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Activity Type</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.activity_type}
                                        onValueChange={(value) => {
                                            setOverrideData({
                                                ...overrideData,
                                                activity_type: value,
                                                ssa_sub_activity_id: null,
                                                topic_id: null
                                            });
                                        }}
                                        style={styles.picker}
                                        enabled={activities.length > 0}
                                    >
                                        <Picker.Item label="Select Activity Type" value="" />
                                        {activities.map(activity => (
                                            <Picker.Item
                                                key={activity.id}
                                                label={activity.activity_type}
                                                value={activity.activity_type}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Sub Activity Dropdown */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Sub Activity</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.ssa_sub_activity_id}
                                        onValueChange={(value) => {
                                            setOverrideData({
                                                ...overrideData,
                                                ssa_sub_activity_id: value,
                                                topic_id: null
                                            });
                                        }}
                                        style={styles.picker}
                                        enabled={subActivities.length > 0}
                                    >
                                        <Picker.Item label="Select Sub Activity" value={null} />
                                        {subActivities.map(subActivity => (
                                            <Picker.Item
                                                key={subActivity.id}
                                                label={subActivity.sub_act_name}
                                                value={subActivity.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Topic Dropdown */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Topic</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.topic_id}
                                        onValueChange={(value) => {
                                            setOverrideData({ ...overrideData, topic_id: value });
                                        }}
                                        style={styles.picker}
                                        enabled={topics.length > 0}
                                    >
                                        <Picker.Item label="Select Topic" value={null} />
                                        {topics.map(topic => (
                                            <Picker.Item
                                                key={topic.id}
                                                label={topic.hierarchy_path}
                                                value={topic.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Mentor Dropdown */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Mentor</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.mentor_id}
                                        onValueChange={(value) => {
                                            setOverrideData({ ...overrideData, mentor_id: value });
                                        }}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Mentor" value={null} />
                                        {mentors.map(mentor => (
                                            <Picker.Item
                                                key={mentor.id}
                                                label={`${mentor.name} (${mentor.roll})`}
                                                value={mentor.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Venue</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={overrideData.venue_id}
                                        onValueChange={(value) => {
                                            setOverrideData({ ...overrideData, venue_id: value });
                                        }}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Venue" value={null} />
                                        {venues.map(venue => (
                                            <Picker.Item
                                                key={venue.id}
                                                label={`${venue.name}`}
                                                value={venue.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Activity Instructions */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Activity Instructions</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={overrideData.activity_instructions}
                                    onChangeText={text => setOverrideData({ ...overrideData, activity_instructions: text })}
                                    placeholder="Enter activity instructions..."
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Assessment Toggle */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.switchContainer}>
                                    <Text style={styles.fieldLabel}>Is Assessment</Text>
                                    <Switch
                                        value={overrideData.is_assessment}
                                        onValueChange={(value) => {
                                            setOverrideData({
                                                ...overrideData,
                                                is_assessment: value,
                                                total_marks: value ? overrideData.total_marks : ''
                                            });
                                        }}
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor={overrideData.is_assessment ? "#f5dd4b" : "#f4f3f4"}
                                    />
                                </View>
                            </View>

                            {/* Total Marks (only show if assessment) */}
                            {overrideData.is_assessment && (
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>Total Marks</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={overrideData.total_marks}
                                        onChangeText={text => setOverrideData({ ...overrideData, total_marks: text })}
                                        placeholder="Enter total marks"
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}

                            {/* Notes */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Notes</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={overrideData.notes}
                                    onChangeText={text => setOverrideData({ ...overrideData, notes: text })}
                                    placeholder="Additional notes..."
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSaveOverride}
                                    activeOpacity={0.8}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CoordinatorStudentSchedule;