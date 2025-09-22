import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList } from "react-native";
import { API_URL } from "../../../../utils/env.js";
import BackIcon from '../../../../assets/CoordinatorPage/Logs/Back.svg';
import styles from './steSty';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CheckBox } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';

const StudentTopicEnrollment = ({ navigation, route }) => {
    const { coordinatorData, activeGrade } = route.params;

    // State for UI controls
    const [activeTab, setActiveTab] = useState('sectionWise');
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dropdown states
    const [openSection, setOpenSection] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sections, setSections] = useState([]);

    const [openSubject, setOpenSubject] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjects, setSubjects] = useState([]);

    const [openBatch, setOpenBatch] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batches, setBatches] = useState([]);

    const [openActivity, setOpenActivity] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [activities, setActivities] = useState([]);

    const [openSubActivity, setOpenSubActivity] = useState(false);
    const [selectedSubActivity, setSelectedSubActivity] = useState(null);
    const [subActivities, setSubActivities] = useState([]);

    // Student selection
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Effect to ensure only one dropdown is open at a time
    useEffect(() => {
        // When section dropdown opens, close others
        if (openSection) {
            setOpenSubject(false);
            setOpenBatch(false);
            setOpenActivity(false);
            setOpenSubActivity(false);
        }
    }, [openSection]);

    useEffect(() => {
        // When subject dropdown opens, close others
        if (openSubject) {
            setOpenSection(false);
            setOpenBatch(false);
            setOpenActivity(false);
            setOpenSubActivity(false);
        }
    }, [openSubject]);

    useEffect(() => {
        // When batch dropdown opens, close others
        if (openBatch) {
            setOpenSection(false);
            setOpenSubject(false);
            setOpenActivity(false);
            setOpenSubActivity(false);
        }
    }, [openBatch]);

    useEffect(() => {
        // When activity dropdown opens, close others
        if (openActivity) {
            setOpenSection(false);
            setOpenSubject(false);
            setOpenBatch(false);
            setOpenSubActivity(false);
        }
    }, [openActivity]);

    useEffect(() => {
        // When sub-activity dropdown opens, close others
        if (openSubActivity) {
            setOpenSection(false);
            setOpenSubject(false);
            setOpenBatch(false);
            setOpenActivity(false);
        }
    }, [openSubActivity]);

    // Fetch sections for the active grade
    useEffect(() => {
        if (coordinatorData && coordinatorData.id) {
            fetchSections();
        }
    }, [coordinatorData]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/coordinator/getGradeSections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gradeID: activeGrade })
            });

            const data = await response.json();
            if (data.success) {
                const sectionOptions = data.gradeSections.map(section => ({
                    label: `Grade ${section.grade_id} - ${section.section_name}`,
                    value: section.id
                }));
                // console.log(sectionOptions);

                setSections(sectionOptions);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch sections');
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            Alert.alert('Error', 'Failed to fetch sections');
        } finally {
            setLoading(false);
        }
    };

    // Fetch students when section is selected
    useEffect(() => {
        if (selectedSection) {
            fetchStudents(selectedSection);
            fetchSubjects(selectedSection);
        }
    }, [selectedSection]);

    const fetchStudents = async (sectionId) => {
        try {
            setStudents([]);
            setLoading(true);
            const response = await fetch(`${API_URL}/api/coordinator/getStudentsBySection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId })
            });

            const data = await response.json();
            if (data.success) {
                const studentList = data.students.map(student => ({
                    id: student.roll,
                    name: student.name,
                    roll: student.roll,
                    isSelected: false
                }));
                setStudents(studentList);
                setSelectedStudents([]);
                setSelectAll(false);
            }
            else if (data.noStudents) {
                setStudents([]);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Alert.alert('Error', 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (sectionId) => {
        try {
            const response = await fetch(`${API_URL}/api/coordinator/batches/getSectionSubjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId })
            });

            const data = await response.json();
            if (data.success) {
                const subjectOptions = data.sectionSubjects.map(subject => ({
                    label: subject.subject_name,
                    value: subject.id
                }));
                setSubjects(subjectOptions);
                setSelectedSubject(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch subjects');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            Alert.alert('Error', 'Failed to fetch subjects');
        }
    };

    // Fetch batches when subject is selected
    useEffect(() => {
        if (selectedSubject && selectedSection) {
            fetchBatches(selectedSection, selectedSubject);
        }
    }, [selectedSubject, selectedSection]);

    const fetchBatches = async (sectionId, subjectId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/coordinator/batches/${sectionId}/${subjectId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            
            if (data.success) {
                const batchOptions = data.data.map(batch => ({
                    label: `${batch.batch_name} (Level ${batch.batch_level})`,
                    value: batch.id
                }));
                setBatches(batchOptions);                
                setSelectedBatch(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch batches');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            Alert.alert('Error', 'Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    // Fetch activities when batch is selected
    useEffect(() => {
        if (selectedBatch && selectedSubject) {
            fetchActivities(selectedSubject);
        }
    }, [selectedBatch, selectedSubject]);

    const fetchActivities = async (subjectId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/coordinator/topics/getSectionSubjectActivities/${selectedSection}/${subjectId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                const activityOptions = data.sectionSubjectActivity.map(activity => ({
                    label: activity.activity_name,
                    value: activity.id
                }));
                setActivities(activityOptions);
                setSelectedActivity(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            Alert.alert('Error', 'Failed to fetch activities');
        } finally {
            setLoading(false);
        }
    };

    // Fetch sub-activities when activity is selected
    useEffect(() => {
        if (selectedActivity) {
            fetchSubActivities(selectedActivity);
        }
    }, [selectedActivity]);

    const fetchSubActivities = async (activityId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/coordinator/topics/getSectionSubjectSubActivities/${activityId}/${selectedSubject}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                const subActivityOptions = data.sectionSubjectSubActivity.map(subActivity => ({
                    label: subActivity.sub_act_name,
                    value: subActivity.id
                }));
                setSubActivities(subActivityOptions);
                setSelectedSubActivity(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch sub-activities');
            }
        } catch (error) {
            console.error('Error fetching sub-activities:', error);
            Alert.alert('Error', 'Failed to fetch sub-activities');
        } finally {
            setLoading(false);
        }
    };

    // Handle student selection
    const handleStudentSelection = (studentRoll) => {
        const updatedStudents = students.map(student => {
            if (student.roll === studentRoll) {
                return { ...student, isSelected: !student.isSelected };
            }
            return student;
        });

        setStudents(updatedStudents);
        const selected = updatedStudents.filter(student => student.isSelected).map(student => student.roll);
        setSelectedStudents(selected);
        setSelectAll(selected.length === updatedStudents.length);
    };

    // Handle select all students
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        const updatedStudents = students.map(student => ({
            ...student,
            isSelected: newSelectAll
        }));

        setStudents(updatedStudents);
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            setSelectedStudents(updatedStudents.map(student => student.roll));
        } else {
            setSelectedStudents([]);
        }
    };

    // Generate enrollment data for section-wise
    const generateSectionWise = async () => {
        if (!selectedSection) {
            Alert.alert('Error', 'Please select a section');
            return;
        }

        if (selectedStudents.length === 0) {
            Alert.alert('Error', 'Please select at least one student');
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch(`${API_URL}/api/coordinator/generateSectionWiseEnrollment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coordinatorId: coordinatorData.id,
                    sectionId: selectedSection,
                    studentRolls: selectedStudents
                })
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Section-wise enrollment generated successfully');
                // Reset selected values
                setSelectedStudents([]);
                setSelectAll(false);
                const updatedStudents = students.map(student => ({
                    ...student,
                    isSelected: false
                }));
                setStudents(updatedStudents);
            } else {
                Alert.alert('Error', data.message || 'Failed to generate enrollment');
            }
        } catch (error) {
            console.error('Error generating enrollment:', error);
            Alert.alert('Error', 'Failed to generate enrollment');
        } finally {
            setIsProcessing(false);
        }
    };

    // Generate enrollment data for subject-wise
    const generateSubjectWise = async () => {
        if (!selectedSection || !selectedSubject || !selectedBatch || !selectedActivity || !selectedSubActivity) {
            Alert.alert('Error', 'Please select all required fields');
            return;
        }

        if (selectedStudents.length === 0) {
            Alert.alert('Error', 'Please select at least one student');
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch(`${API_URL}/api/coordinator/generateSubjectWiseEnrollment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coordinatorId: coordinatorData.id,
                    sectionId: selectedSection,
                    subjectId: selectedSubject,
                    batchId: selectedBatch,
                    activityId: selectedActivity,
                    subActivityId: selectedSubActivity,
                    studentRolls: selectedStudents
                })
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Subject-wise enrollment generated successfully');
                // Reset selected values
                setSelectedStudents([]);
                setSelectAll(false);
                const updatedStudents = students.map(student => ({
                    ...student,
                    isSelected: false
                }));
                setStudents(updatedStudents);
            } else {
                Alert.alert('Error', data.message || 'Failed to generate enrollment');
            }
        } catch (error) {
            console.error('Error generating enrollment:', error);
            Alert.alert('Error', 'Failed to generate enrollment');
        } finally {
            setIsProcessing(false);
        }
    };

    // Generate all enrollments at once (direct option)
    const generateAll = async () => {
        if (!selectedSection) {
            Alert.alert('Error', 'Please select a section');
            return;
        }

        if (selectedStudents.length === 0) {
            Alert.alert('Error', 'Please select at least one student');
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch(`${API_URL}/api/coordinator/generateAllEnrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coordinatorId: coordinatorData.id,
                    sectionId: selectedSection,
                    studentRolls: selectedStudents
                })
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'All enrollments generated successfully');
                // Reset selected values
                setSelectedStudents([]);
                setSelectAll(false);
                const updatedStudents = students.map(student => ({
                    ...student,
                    isSelected: false
                }));
                setStudents(updatedStudents);
            } else {
                Alert.alert('Error', data.message || 'Failed to generate enrollments');
            }
        } catch (error) {
            console.error('Error generating enrollments:', error);
            Alert.alert('Error', 'Failed to generate enrollments');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackIcon
                    style={styles.backIcon}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTxt}>Student Topic Enrollment</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sectionWise' ? styles.activeTab : null]}
                    onPress={() => setActiveTab('sectionWise')}
                >
                    <MaterialCommunityIcons name="account-group" size={20} color={activeTab === 'sectionWise' ? "#007AFF" : "#666"} />
                    <Text style={[styles.tabText, activeTab === 'sectionWise' ? styles.activeTabText : null]}>Section-wise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'subjectWise' ? styles.activeTab : null]}
                    onPress={() => setActiveTab('subjectWise')}
                >
                    <MaterialCommunityIcons name="book-open-variant" size={20} color={activeTab === 'subjectWise' ? "#007AFF" : "#666"} />
                    <Text style={[styles.tabText, activeTab === 'subjectWise' ? styles.activeTabText : null]}>Subject-wise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'createAll' ? styles.activeTab : null]}
                    onPress={() => setActiveTab('createAll')}
                >
                    <MaterialCommunityIcons name="clipboard-list" size={20} color={activeTab === 'createAll' ? "#007AFF" : "#666"} />
                    <Text style={[styles.tabText, activeTab === 'createAll' ? styles.activeTabText : null]}>Create All</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
            {/* This outer view is crucial for z-index stacking context */}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <View style={[styles.contentContainer, { zIndex: 100 }]}>
                    {/* Section Selection (common for all tabs) */}
                    <View style={[styles.formGroup, { zIndex: 5000 }]}>
                        <Text style={styles.label}>Select Section</Text>
                        <DropDownPicker
                            open={openSection}
                            value={selectedSection}
                            items={sections}
                            setOpen={setOpenSection}
                            setValue={setSelectedSection}
                            setItems={setSections}
                            placeholder="Select a section"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={5000}
                            zIndexInverse={1000}
                            maxHeight={200}
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                            listMode="SCROLLVIEW"
                        />
                    </View>

                    {/* Subject-wise specific fields */}
                    {activeTab === 'subjectWise' && selectedSection && (
                        <>
                            <View style={[styles.formGroup, { zIndex: 4000 }]}>
                                <Text style={styles.label}>Select Subject</Text>
                                <DropDownPicker
                                    open={openSubject}
                                    value={selectedSubject}
                                    items={subjects}
                                    setOpen={setOpenSubject}
                                    setValue={setSelectedSubject}
                                    setItems={setSubjects}
                                    placeholder="Select a subject"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    zIndex={4000}
                                    zIndexInverse={1000}
                                    maxHeight={200}
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                    listMode="SCROLLVIEW"
                                    disabled={openSection}
                                />
                            </View>

                            {selectedSubject && (
                                <View style={[styles.formGroup, { zIndex: 3000 }]}>
                                    <Text style={styles.label}>Select Batch</Text>
                                    <DropDownPicker
                                        open={openBatch}
                                        value={selectedBatch}
                                        items={batches}
                                        setOpen={setOpenBatch}
                                        setValue={setSelectedBatch}
                                        setItems={setBatches}
                                        placeholder="Select a batch"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        zIndex={3000}
                                        maxHeight={200}
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                        listMode="SCROLLVIEW"
                                        disabled={openSubject}
                                        zIndexInverse={2000}
                                    />
                                </View>
                            )}

                            {selectedBatch && (
                                <View style={[styles.formGroup, { zIndex: 2000 }]}>
                                    <Text style={styles.label}>Select Activity</Text>
                                    <DropDownPicker
                                        open={openActivity}
                                        value={selectedActivity}
                                        items={activities}
                                        setOpen={setOpenActivity}
                                        setValue={setSelectedActivity}
                                        setItems={setActivities}
                                        placeholder="Select an activity"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        zIndex={2000}
                                        zIndexInverse={3000}
                                        maxHeight={200}
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                        listMode="SCROLLVIEW"
                                        disabled={openBatch}
                                    />
                                </View>
                            )}

                            {selectedActivity && (
                                <View style={[styles.formGroup, { zIndex: 1000 }]}>
                                    <Text style={styles.label}>Select Sub-Activity</Text>
                                    <DropDownPicker
                                        open={openSubActivity}
                                        value={selectedSubActivity}
                                        items={subActivities}
                                        setOpen={setOpenSubActivity}
                                        setValue={setSelectedSubActivity}
                                        setItems={setSubActivities}
                                        placeholder="Select a sub-activity"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        zIndex={1000}
                                        zIndexInverse={4000}
                                        maxHeight={200}
                                        scrollViewProps={{
                                            nestedScrollEnabled: true,
                                        }}
                                        listMode="SCROLLVIEW"
                                        disabled={openActivity}
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {/* Student Selection (common for all tabs when section is selected) */}
                    {selectedSection && students.length > 0 && (
                        <>
                            <View style={styles.studentsHeader}>
                                <Text style={styles.studentsTitle}>Select Students</Text>
                                <View style={styles.selectAllContainer}>
                                    <CheckBox
                                        checked={selectAll}
                                        onPress={handleSelectAll}
                                        containerStyle={styles.selectAllCheckbox}
                                    />
                                    <Text style={styles.selectAllText}>Select All</Text>
                                </View>
                            </View>
                            
                            {/* Student List Section */}
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.roll}
                                renderItem={({ item }) => (
                                    <View style={styles.studentItem}>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentRoll}>{item.roll}</Text>
                                            <Text style={styles.studentName}>{item.name}</Text>
                                        </View>
                                        <CheckBox
                                            checked={item.isSelected}
                                            onPress={() => handleStudentSelection(item.roll)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                )}
                                style={styles.studentsList}
                                ListEmptyComponent={
                                    <Text style={styles.noStudentsText}>No students found for this section</Text>
                                }
                            />

                            {/* Generate Button based on active tab */}
                            <TouchableOpacity
                                style={[styles.generateButton, isProcessing && styles.disabledButton]}
                                onPress={() => {
                                    if (activeTab === 'sectionWise') generateSectionWise();
                                    else if (activeTab === 'subjectWise') generateSubjectWise();
                                    else if (activeTab === 'createAll') generateAll();
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.generateButtonText}>
                                        {activeTab === 'sectionWise' ? 'Generate Section-Wise Enrollment' :
                                            activeTab === 'subjectWise' ? 'Generate Subject-Wise Enrollment' :
                                                'Generate All Enrollments'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {selectedSection && students.length === 0 && (
                        <Text style={styles.noStudentsText}>No students found for this section</Text>
                    )}
                </View>
            )}
        </View>
        
        </View>
    );
};

export default StudentTopicEnrollment;
