// import React, { useState, useEffect } from 'react';
// import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import styles from './Calendermodelsty';

// const CalendarModal = ({ visible, onClose, onSelectDate,markedDates, initialDate = new Date() }) => {
//     const [selectedDate, setSelectedDate] = useState(formatDateString(initialDate));
//     const [currentMonth, setCurrentMonth] = useState(initialDate);

//     // Format a Date object to YYYY-MM-DD string for the calendar component
//     function formatDateString(date) {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     }

//     // Format date to display format (DD/MM/YYYY)
//     function formatDisplayDate(dateString) {
//         if (!dateString) return '';
//         const [year, month, day] = dateString.split('-');
//         return `${day}/${month}/${year}`;
//     }

//     // Handle date selection
//     const handleDateSelection = (date) => {
//         const dateString = date.dateString;
//         setSelectedDate(dateString);
//         onSelectDate && onSelectDate(new Date(dateString));
//     };

//     // Handle month change
//     const onMonthChange = (month) => {
//         const newDate = new Date(month.timestamp);
//         setCurrentMonth(newDate);
//     };

//     // Generate marked dates object for the calendar
//     const getMarkedDates = () => {
//         const markedDates = {};

//         // Mark selected date
//         if (selectedDate) {
//             markedDates[selectedDate] = {
//                 selected: true,
//                 selectedColor: '#4169e1',
//             };
//         }

//         // Mark today's date
//         const today = formatDateString(new Date());
//         if (today !== selectedDate) {
//             markedDates[today] = {
//                 marked: true,
//                 dotColor: '#4169e1',
//             };
//         }

//         return markedDates;
//     };

//     return (
//         <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={onClose}
//         >
//             <View style={styles.calendarModal} onStartShouldSetResponder={() => true}>

//                 <Calendar
//                     current={formatDateString(currentMonth)}
//                     markedDates={getMarkedDates()}
//                     onDayPress={handleDateSelection}
//                     onMonthChange={onMonthChange}
//                     hideExtraDays={false}
//                     enableSwipeMonths={true}
//                     theme={{
//                         todayTextColor: '#4169e1',
//                         selectedDayBackgroundColor: '#4169e1',
//                         textDayFontSize: 14,
//                         textMonthFontSize: 16,
//                         textDayHeaderFontSize: 14,
//                         arrowColor: '#4169e1',
//                     }}
//                 />

//                 {/* Selected date display and confirm button */}
//                 <View style={styles.selectedDateContainer}>
//                     <Text style={styles.selectedDateText}>
//                         Selected: {formatDisplayDate(selectedDate)}
//                     </Text>
//                     <TouchableOpacity
//                         style={styles.confirmButton}
//                         onPress={() => {
//                             onSelectDate && onSelectDate(new Date(selectedDate));
//                             onClose();
//                         }}
//                     >
//                         <Text style={styles.confirmButtonText}>Confirm</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </TouchableOpacity>
//     );
// };

// export default CalendarModal;



import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from './Calendermodelsty';

const CalendarModal = ({ visible, onClose, onSelectDate, markedDates: externalMarked = {}, initialDate = new Date() }) => {
    const [selectedDate, setSelectedDate] = useState(formatDateString(initialDate));
    const [currentMonth, setCurrentMonth] = useState(initialDate);

    // Format Date object to 'YYYY-MM-DD'
    function formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Format to 'DD/MM/YYYY'
    function formatDisplayDate(dateString) {
        if (!dateString || typeof dateString !== 'string') return '';
        
        const [year, month, day] = dateString.split('-');
    
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        const monthIndex = parseInt(month, 10) - 1;
        return `${parseInt(day, 10)} ${monthNames[monthIndex]} ${year}`;
    }

    const handleDateSelection = (date) => {
        const dateString = date.dateString;
        setSelectedDate(dateString);
        onSelectDate && onSelectDate(new Date(dateString));
    };

    const onMonthChange = (month) => {
        const newDate = new Date(month.timestamp);
        setCurrentMonth(newDate);
    };

    const getMarkedDates = () => {
        const merged = { ...externalMarked };

        // Mark selected date
        if (selectedDate) {
            merged[selectedDate] = {
                ...(merged[selectedDate] || {}),
                selected: true,
                selectedColor: '#4169e1',
            };
        }

        // Mark today
        const today = formatDateString(new Date());
        if (today !== selectedDate) {
            merged[today] = {
                ...(merged[today] || {}),
                marked: true,
                dotColor: '#4169e1',
            };
        }

        return merged;
    };

    return (
        <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={onClose}>
                <View style={styles.calendarModal} onStartShouldSetResponder={() => true}>
                    <Calendar
                        current={formatDateString(currentMonth)}
                        markedDates={getMarkedDates()}
                        onDayPress={handleDateSelection}
                        onMonthChange={onMonthChange}
                        hideExtraDays={false}
                        enableSwipeMonths={true}
                        theme={{
                            todayTextColor: '#4169e1',
                            selectedDayBackgroundColor: '#4169e1',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 14,
                            arrowColor: '#4169e1',
                        }}
                        renderHeader={(date) => {
                            const monthNames = [
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                              ];
                            return (
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                                {date.toString().slice(4, 7)} {monthNames[date.getMonth()]} {date.getFullYear()}
                              </Text>
                            );
                          }}
                    />

                    <View style={styles.selectedDateContainer}>
                        <Text style={styles.selectedDateText}>
                            Selected: {formatDisplayDate(selectedDate)}
                        </Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    onSelectDate && onSelectDate(new Date(selectedDate));
                                    onClose();
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
        </TouchableOpacity>
    );
};

export default CalendarModal;
