import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './StudentScheduleStyle'; // New style file
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
    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);

    const [overrideData, setOverrideData] = useState({
        id: null,
        daily_schedule_id: null,
        activity_type: '',
        start_time: '09:00',
        end_time: '10:00',
        notes: ''
    });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/api/coordinator/student/getSectionStudents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sectionId: activeSection })
                });
                const data = await response.json();    
                if (data.success) setStudents(data.sectionStudent);   
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, [activeSection]);

    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/coordinator/weekly-schedule/sections`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activeGrade })
                });
                const data = await response.json();
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
            const data = await response.json();
            if (data.success) {
                setSchedule(data.schedule);
                setOverrides(data.overrides);
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

    const handleSaveOverride = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/coordinator/schedule/student/override`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...overrideData,
                    student_roll: selectedStudent
                })
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Schedule override saved.");
                setModalVisible(false);
                fetchStudentSchedule();
            } else {
                Alert.alert("Error", data.message || "Failed to save override.");
            }
        } catch (error) {
            console.error("Error saving override:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPress = (period) => {
        setOverrideData({
            id: null, // This is for a new override
            daily_schedule_id: period.daily_schedule_id,
            activity_type: 'Custom',
            start_time: period.period_start_time,
            end_time: period.period_end_time,
            notes: ''
        });
        setModalVisible(true);
    };

    const renderPeriod = (period) => {
        return (
            <View key={period.daily_schedule_id} style={styles.periodContainer}>
                <View style={styles.periodHeader}>
                    <Text style={styles.periodTime}>{period.period_start_time} - {period.period_end_time}</Text>
                    <Text style={styles.periodSubject}>{period.subject_name}</Text>
                    <TouchableOpacity onPress={() => handleEditPress(period)}>
                        <Text style={styles.editButtonText}>Edit for Student</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.activityContainer}>
                    {period.activity_type ? (
                        <View style={styles.activity}>
                            <Text>{period.start_time} - {period.end_time}: {period.activity_type} (Batch {period.batch_number})</Text>
                            <Text>Mentor: {period.mentor_name}</Text>
                        </View>
                    ) : (
                        <Text>No specific activity</Text>
                    )}
                </View>
                {period.overrides && (
                    <View style={styles.overridesContainer}>
                        <Text style={styles.overrideTitle}>Student-Specific Schedule:</Text>
                        {period.overrides.map(override => (
                            <View key={override.id} style={styles.overrideItem}>
                                <Text>{override.start_time} - {override.end_time}: {override.activity_type}</Text>
                                <Text>Notes: {override.notes}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackIcon width={24} height={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Schedule</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabsContainer}>
                {sections.map(section => (
                    <TouchableOpacity key={section.id} style={[styles.sectionTab, activeSection === section.id && styles.activeSectionTab]} onPress={() => setActiveSection(section.id)}>
                        <Text style={[styles.sectionTabText, activeSection === section.id && styles.activeSectionTabText]}>Section {section.section_name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={{ padding: 10, flex:50 }}>
                <View style={styles.controlsContainer}>
                    <Picker
                        selectedValue={selectedStudent}
                        onValueChange={(itemValue) => setSelectedStudent(itemValue)}
                        style={styles.picker}
                    >
                        {students.map(s => <Picker.Item key={s.roll} label={s.name} value={s.roll} />)}
                    </Picker>
                    <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                        <Text style={styles.datePickerText}>{selectedDate.toDateString()}</Text>
                    </TouchableOpacity>
                </View>

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

                {loading ? <ActivityIndicator size="large" /> : (
                    <ScrollView>
                        {schedule.length > 0 ? schedule.map(renderPeriod) : <Text style={styles.noScheduleText}>No schedule for this day.</Text>}
                    </ScrollView>
                )}
            </View>
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Student Schedule</Text>
                        <TextInput style={styles.input} value={overrideData.activity_type} onChangeText={text => setOverrideData({ ...overrideData, activity_type: text })} placeholder="Activity Type" />
                        <TextInput style={styles.input} value={overrideData.start_time} onChangeText={text => setOverrideData({ ...overrideData, start_time: text })} placeholder="Start Time (HH:MM)" />
                        <TextInput style={styles.input} value={overrideData.end_time} onChangeText={text => setOverrideData({ ...overrideData, end_time: text })} placeholder="End Time (HH:MM)" />
                        <TextInput style={styles.input} value={overrideData.notes} onChangeText={text => setOverrideData({ ...overrideData, notes: text })} placeholder="Notes" multiline />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.button} onPress={handleSaveOverride}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CoordinatorStudentSchedule;