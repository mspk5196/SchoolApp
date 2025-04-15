import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { View, Text, FlatList, Pressable, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Picker } from '@react-native-picker/picker';
import BackIcon from '../../../assets/ExamSchedule/Back.svg';
import BookIcon from '../../../assets/ExamSchedule/Book.svg';
import FrequencyIcon from '../../../assets/ExamSchedule/Repeat.svg';
import TimeIcon from '../../../assets/ExamSchedule/Time.svg';
import AddIcon from '../../../assets/ExamSchedule/Add.svg';
import MenuIcon from '../../../assets/ExamSchedule/Menu.svg';
import styles, { modalStyles, frequencyStyles } from './ExamScheduleStyle';
import { useExams } from './ExamContext'; // Import the context hook

const ExamSchedule = ({ navigation }) => {
    // Use the exam context instead of local state
    const { sessions, addSession, updateSession, deleteSession } = useExams();
    
    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [customDays, setCustomDays] = useState([]);
    
    const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState('Don\'t Repeat');
    
    // Add state for editing functionality
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    
    // New time picker states
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTimeType, setSelectedTimeType] = useState('start'); // 'start' or 'end'
    const [selectedTime, setSelectedTime] = useState({
        hour: '09',
        minute: '40',
        period: 'AM'
    });
    
    // Time picker data
    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    
    // Frequency options
    const frequencyOptions = [
        'Don\'t Repeat',
        'Daily',
        'Custom'
    ];
    
    // Subject options
    const subjects = [
        'Mathematics', 
        'Science', 
        'English',
        'History',
        'Physics',
        'Chemistry',
        'Biology'
    ];
    
    // Open time modal
    const openTimeModal = (type) => {
        setSelectedTimeType(type);
        
        if (type === 'start' && startTime) {
            const [timeValue, period] = startTime.split(' ');
            const [hour, minute] = timeValue.split(':');
            setSelectedTime({
                hour: hour,
                minute: minute,
                period: period
            });
        } else if (type === 'end' && endTime) {
            const [timeValue, period] = endTime.split(' ');
            const [hour, minute] = timeValue.split(':');
            setSelectedTime({
                hour: hour,
                minute: minute,
                period: period
            });
        } else {
            // Default time
            setSelectedTime({
                hour: '09',
                minute: '00',
                period: 'AM'
            });
        }
        
        setShowTimeModal(true);
    };

    // Confirm time selection
    const confirmTimeSelection = () => {
        const newTime = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
        
        if (selectedTimeType === 'start') {
            setStartTime(newTime);
        } else {
            setEndTime(newTime);
        }
        
        setShowTimeModal(false);
    };
    
    // Show frequency modal
    const showFrequencyModal = () => {
        if (selectedSubject && selectedDate && startTime && endTime) {
            setFrequencyModalVisible(true);
        } else {
            alert('Please fill in all fields');
        }
    };
    
    // Reset form fields
    const resetForm = () => {
        setSelectedSubject('Mathematics');
        setSelectedDate('');
        setStartTime('');
        setEndTime('');
        setSelectedFrequency('Don\'t Repeat');
        setCustomDays([]);
        setIsEditing(false);
        setEditingIndex(null);
    };
    
    // Handle edit session
    const handleEditSession = (index) => {
        setIsEditing(true);
        setEditingIndex(index);
        
        const sessionToEdit = sessions[index];
        
        // Parse the session data
        setSelectedSubject(sessionToEdit.subject);
        setSelectedDate(sessionToEdit.date);
        
        // Parse the time string to extract start and end times
        const timeRange = sessionToEdit.time.split(' - ');
        setStartTime(timeRange[0]);
        setEndTime(timeRange[1]);
        
        // Set frequency
        const frequency = sessionToEdit.frequency === 'One Time' ? 'Don\'t Repeat' : sessionToEdit.frequency;
        setSelectedFrequency(frequency);
        
        // Open the modal
        setModalVisible(true);
    };
    
    // Add or update session handler
    const handleAddSession = () => {
        const newSession = {
            date: selectedDate,
            subject: selectedSubject,
            time: `${startTime} - ${endTime}`,
            frequency: selectedFrequency === 'Don\'t Repeat' ? 'One Time' : selectedFrequency,
            color: getSubjectColor(selectedSubject),
            invigilators: []
        };
        
        if (isEditing && editingIndex !== null) {
            // Update existing session
            updateSession(editingIndex, newSession);
        } else {
            // Add new session
            addSession(newSession);
        }
        
        // Reset form and close modals
        setFrequencyModalVisible(false);
        setModalVisible(false);
        resetForm();
    };
    
    // Get subject color
    const getSubjectColor = (subject) => {
        const colors = {
            'Mathematics': '#3f51b5',
            'Science': '#FFA500',
            'English': '#008000',
            'History': '#D81B60',
            'Physics': '#9C27B0',
            'Chemistry': '#00BCD4',
            'Biology': '#4CAF50'
        };
        return colors[subject] || '#3f51b5';
    };
    
    // Open add session modal
    const openAddSessionModal = () => {
        resetForm();
        setModalVisible(true);
    };
    
    // Handle delete session
    const handleDeleteSession = (index) => {
        deleteSession(index);
    };
    
    // Get marked dates for calendar
    const markedDates = sessions.reduce((acc, session) => {
        acc[session.date] = { selected: true, selectedColor: session.color };
        return acc;
    }, {});
    
    return (
        <MenuProvider>
            <SafeAreaView style={{ flex: 1 }}>
               
                    {/* Header */}
                    <View style={styles.header}>
                        <BackIcon width={styles.BackIcon.width} height={styles.BackIcon.height} onPress={() => navigation.goBack()}/>
                        <Text style={styles.headerTxt}>Exam Schedule</Text>
                    </View>
                    <ScrollView nestedScrollEnabled={true}>
                    {/* Calendar */}
                    <View style={styles.calendercontainer}>
                        <Calendar style={styles.calender} current={'2025-03-14'} markedDates={markedDates} />
                    </View>

                    {/* Upcoming Exams */}
                    <View>
                        <Text style={styles.UpcomingExamTxt}>Upcoming Exam</Text>
                    </View>

                    {/* List of Sessions - Updated to use context data */}
                    <View>
                        <FlatList
                            data={sessions}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => (
                                <View style={[styles.card, { borderLeftColor: item.color }]}>
                                    <Text style={styles.date}>{item.date.split('-')[2]} {'\n'}MAR</Text>
                                    <View style={styles.cardContent}>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingBottom: 5 }}>
                                                <BookIcon width={styles.BookIcon.width} height={styles.BookIcon.height} />
                                                <Text style={styles.subject}>{item.subject}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingBottom: 5 }}>
                                                <TimeIcon width={styles.TimeIcon.width} height={styles.TimeIcon.height} />
                                                <Text style={styles.time}>{item.time}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingBottom: 5 }}>
                                                <FrequencyIcon width={styles.FrequencyIcon.width} height={styles.FrequencyIcon.height} />
                                                <Text style={styles.frequency}>{item.frequency}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Menu style={styles.menu}>
                                        <MenuTrigger style={styles.menuTrigger}>
                                            <MenuIcon width={styles.MenuIcon.width} height={styles.MenuIcon.height} />
                                        </MenuTrigger>
                                        <MenuOptions style={styles.menuContainer}>
                                            <MenuOption onSelect={() => handleEditSession(index)}>
                                                <Text style={styles.menuOptionText}>Edit</Text>
                                            </MenuOption>
                                            <MenuOption onSelect={() => handleDeleteSession(index)}>
                                                <Text style={styles.menuOptionDelete}>Delete</Text>
                                            </MenuOption>
                                        </MenuOptions>
                                    </Menu>
                                </View>
                            )}
                        />
                    </View>

                    {/* Add Session Button */}
                    <Pressable style={styles.addButton} onPress={openAddSessionModal}>
                        <AddIcon width={styles.AddIcon.width} height={styles.AddIcon.height} />
                        <Text style={styles.addButtonText}> Add more session</Text>
                    </Pressable>
                </ScrollView>
                
                {/* Add/Edit Session Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                >
                    <View style={modalStyles.centeredView}>
                       
                        <View style={modalStyles.modalView}>
                       
                            <Text style={modalStyles.modalTitle}>
                                {isEditing ? 'Edit Exam Session' : 'Add New Exam Session'}
                            </Text>
                            <ScrollView>
                            {/* Subject Dropdown */}
                            <Text style={modalStyles.inputLabel}>Subject</Text>
                            <View style={modalStyles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedSubject}
                                    style={modalStyles.picker}
                                    onValueChange={(itemValue) => setSelectedSubject(itemValue)}
                                >
                                    {subjects.map((subject) => (
                                        <Picker.Item key={subject} label={subject} value={subject} />
                                    ))}
                                </Picker>
                            </View>
    
                            {/* Date Picker */}
                            <Text style={modalStyles.inputLabel}>Date</Text>
                            <View style={modalStyles.calendarContainer}>
                                <Calendar
                                    onDayPress={(day) => setSelectedDate(day.dateString)}
                                    markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#3f51b5' } } : {}}
                                    style={modalStyles.calendar}
                                />
                            </View>
    
                            {/* Time Pickers - Updated to use the touchable inputs */}
                            <View style={modalStyles.timeContainer}>
                                <View style={modalStyles.timeInputContainer}>
                                    <Text style={modalStyles.inputLabel}>Start Time</Text>
                                    <Pressable 
                                        style={modalStyles.timeInput} 
                                        onPress={() => openTimeModal('start')}
                                    >
                                        <Text>{startTime || 'Select Start Time'}</Text>
                                    </Pressable>
                                </View>
    
                                <View style={modalStyles.timeInputContainer}>
                                    <Text style={modalStyles.inputLabel}>End Time</Text>
                                    <Pressable 
                                        style={modalStyles.timeInput} 
                                        onPress={() => openTimeModal('end')}
                                    >
                                        <Text>{endTime || 'Select End Time'}</Text>
                                    </Pressable>
                                </View>
                            </View>
    
                            {/* Action Buttons */}
                            <View style={modalStyles.buttonContainer}>
                                <Pressable
                                    style={[modalStyles.button, modalStyles.buttonCancel]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={modalStyles.buttonTextCancel}>Cancel</Text>
                                </Pressable>
    
                                <Pressable
                                    style={[modalStyles.button, modalStyles.buttonSave]}
                                    onPress={showFrequencyModal}
                                >
                                    <Text style={modalStyles.buttonTextSave}>Continue</Text>
                                </Pressable>
                            </View>
                            </ScrollView>
                        </View>
                      
                    </View>
                </Modal>
    
                {/* Frequency Selection Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={frequencyModalVisible}
                    onRequestClose={() => setFrequencyModalVisible(false)}
                >
                    <View style={modalStyles.RepeatedcenteredView}>
                        <View style={modalStyles.RepeatedmodalView}>
                            <Text style={modalStyles.RepeatedmodalTitle}>Select Repeat Schedule</Text>
    
                            <View style={frequencyStyles.container}>
                                {frequencyOptions.map((option) => (
                                    <Pressable
                                        key={option}
                                        style={[
                                            frequencyStyles.radioOption,
                                            selectedFrequency === option && frequencyStyles.radioOptionSelected
                                        ]}
                                        onPress={() => setSelectedFrequency(option)}
                                    >
                                        <View style={frequencyStyles.radioCircle}>
                                            {selectedFrequency === option && (
                                                <View style={frequencyStyles.selectedRb} />
                                            )}
                                        </View>
                                        <Text style={frequencyStyles.radioText}>{option}</Text>
                                    </Pressable>
                                ))}
                            </View>
    
                            {/* Custom schedule options - shown only when Custom is selected */}
                            {selectedFrequency === 'Custom' && (
                                <View style={frequencyStyles.customDaysContainer}>
                                    <Text style={modalStyles.inputLabel}>Custom Schedule</Text>
                                    <View style={frequencyStyles.daySelector}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <Pressable
                                                key={day}
                                                style={[
                                                    frequencyStyles.dayButton,
                                                    customDays.includes(day) && frequencyStyles.dayButtonSelected
                                                ]}
                                                onPress={() => {
                                                    setCustomDays((prevDays) => {
                                                        if (prevDays.includes(day)) {
                                                            return prevDays.filter(d => d !== day);
                                                        } else {
                                                            return [...prevDays, day];
                                                        }
                                                    });
                                                }}
                                            >
                                                <Text style={[
                                                    frequencyStyles.dayText,
                                                    customDays.includes(day) && frequencyStyles.dayTextSelected
                                                ]}>
                                                    {day}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                    <Text style={frequencyStyles.hint}>
                                        Tap days to select custom repeat schedule
                                    </Text>
                                </View>
                            )}
    
                            {/* Action Buttons */}
                            <View style={modalStyles.buttonContainer}>
                                <Pressable
                                    style={[modalStyles.button, modalStyles.buttonCancel]}
                                    onPress={() => setFrequencyModalVisible(false)}
                                >
                                    <Text style={modalStyles.buttonTextCancel}>Back</Text>
                                </Pressable>
    
                                <Pressable
                                    style={[modalStyles.button, modalStyles.buttonSave]}
                                    onPress={handleAddSession}
                                >
                                    <Text style={modalStyles.buttonTextSave}>Save</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Time Selection Modal */}
                <Modal
                    transparent={true}
                    visible={showTimeModal}
                    animationType="slide"
                    onRequestClose={() => setShowTimeModal(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay || { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={1}
                        onPress={() => setShowTimeModal(false)}
                    >
                        <View 
                            style={styles.timeModalContainer || { 
                                backgroundColor: 'white', 
                                borderRadius: 15, 
                                padding: 20, 
                                width: '80%', 
                                maxHeight: '70%' 
                            }} 
                            onStartShouldSetResponder={() => true}
                        >
                            <Text style={styles.timeModalTitle || { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                                Select {selectedTimeType === 'start' ? 'Start' : 'End'} Time
                            </Text>
                            
                            <View style={styles.timePickerContainer || { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                {/* Hour */}
                                <FlatList
                                    data={hours}
                                    keyExtractor={(item) => `hour-${item}`}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.timePickerItem || { height: 40, alignItems: 'center', justifyContent: 'center' },
                                                selectedTime.hour === item && (styles.selectedTimePickerItem || { backgroundColor: '#e6e6e6' })
                                            ]}
                                            onPress={() => setSelectedTime({...selectedTime, hour: item})}
                                        >
                                            <Text 
                                                style={[
                                                    styles.timePickerText || { fontSize: 16 },
                                                    selectedTime.hour === item ? 
                                                        (styles.selectedTimePickerText || { fontWeight: 'bold', color: '#3f51b5' }) : 
                                                        (styles.unselectedTimePickerText || { color: '#333' })
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.timePickerColumn || { width: 60, height: '100%' }}
                                    showsVerticalScrollIndicator={false}
                                    initialScrollIndex={hours.indexOf(selectedTime.hour) !== -1 ? hours.indexOf(selectedTime.hour) : 0}
                                    getItemLayout={(data, index) => (
                                        {length: 40, offset: 40 * index, index}
                                    )}
                                />
                                
                                <Text style={styles.timeSeparator || { fontSize: 20, fontWeight: 'bold', marginHorizontal: 5 }}>:</Text>
                                
                                {/* Minutes */}
                                <FlatList
                                    data={minutes}
                                    keyExtractor={(item) => `minute-${item}`}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.timePickerItem || { height: 40, alignItems: 'center', justifyContent: 'center' },
                                                selectedTime.minute === item && (styles.selectedTimePickerItem || { backgroundColor: '#e6e6e6' })
                                            ]}
                                            onPress={() => setSelectedTime({...selectedTime, minute: item})}
                                        >
                                            <Text 
                                                style={[
                                                    styles.timePickerText || { fontSize: 16 },
                                                    selectedTime.minute === item ? 
                                                        (styles.selectedTimePickerText || { fontWeight: 'bold', color: '#3f51b5' }) : 
                                                        (styles.unselectedTimePickerText || { color: '#333' })
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.timePickerColumn || { width: 60, height: '100%' }}
                                    showsVerticalScrollIndicator={false}
                                    initialScrollIndex={minutes.indexOf(selectedTime.minute) !== -1 ? minutes.indexOf(selectedTime.minute) : 0}
                                    getItemLayout={(data, index) => (
                                        {length: 40, offset: 40 * index, index}
                                    )}
                                />
                                
                                {/* AM/PM */}
                                <View style={styles.periodPickerColumn || { width: 50, height: '100%', marginLeft: 10 }}>
                                    {['AM', 'PM'].map(period => (
                                        <TouchableOpacity
                                            key={period}
                                            style={[
                                                styles.periodPickerItem || { height: 40, alignItems: 'center', justifyContent: 'center', marginVertical: 5 },
                                                selectedTime.period === period && (styles.selectedPeriodPickerItem || { backgroundColor: '#e6e6e6', borderRadius: 8 })
                                            ]}
                                            onPress={() => setSelectedTime({...selectedTime, period})}
                                        >
                                            <Text 
                                                style={[
                                                    styles.periodPickerText || { fontSize: 16 },
                                                    selectedTime.period === period ? 
                                                        (styles.selectedPeriodPickerText || { fontWeight: 'bold', color: '#3f51b5' }) : 
                                                        (styles.unselectedPeriodPickerText || { color: '#333' })
                                                ]}
                                            >
                                                {period}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            
                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={() => setShowTimeModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.saveButton}
                                    onPress={confirmTimeSelection}
                                >
                                    <Text style={styles.saveButtonText}>Select</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </MenuProvider>
    );
};

export default ExamSchedule;