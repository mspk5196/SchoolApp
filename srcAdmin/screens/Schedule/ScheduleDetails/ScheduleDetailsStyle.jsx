import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faFaFa',
    },
    scrollViewContent: {
        paddingBottom: 80, // Space for the floating add button
    },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3', // Matched with Academic Schedule
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginLeft: 10,
    },
    
    // Section Tabs
    sectionTabsContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 10, // Added from Academic Schedule
    },
    sectionTab: {
        paddingHorizontal: 20, // Matched with Academic Schedule
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F5F5F5',
        width: 105, // Fixed width from Academic Schedule
    },
    activeSectionTab: {
        backgroundColor: '#0C36FF',
    },
    sectionTabText: {
        fontSize: 14,
        color: '#333333',
    },
    activeSectionTabText: {
        color: '#FFFFFF',
        paddingLeft: 5, // Added from Academic Schedule
    },
    
    // Days Navigation
    daysContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 5, // Added from Academic Schedule
    },
    dayItem: {
        alignItems: 'center',
        marginRight: 18,
        width: 50,
        paddingVertical: 5, // Added for consistency
    },
    activeDayItem: {
        borderWidth: 1,
        borderColor: '#0C36FF',
        borderRadius: 20,
        paddingVertical: 10,
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
        marginTop: 4,
    },
    activeDayText: {
        color: '#0C36FF', // Added from Academic Schedule
        paddingLeft: 5,
    },
    
    // Schedule Container
    scheduleContainer: {
        paddingHorizontal: 60,
        paddingTop: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    
    // Time Section
    timeContainer: {
        width: 120,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timeText: {
        fontSize: 12,
        color: '#666666',
        width: 110,
    },
    timeIndicator: {
        alignItems: 'center',
        marginLeft: 5,
    },
    timeCircle: {
        width: 14, // Matched with Academic Schedule
        height: 14, // Matched with Academic Schedule
        borderRadius: 7, // Matched with Academic Schedule
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#0C36FF',
        marginTop: 5,
        marginVertical: 7, // Added from Academic Schedule
    },
    timeLine: {
        width: 2,
        height: 100,
        backgroundColor: '#7991A4', // Matched with Academic Schedule
        marginTop: 8,
    },
    
    // Details Section
    detailsContainer: {
        flex: 1,
        borderLeftWidth: 0,
        paddingLeft: 15,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        marginRight: 8,
        color: '#666666',
    },
    detailText: {
        fontSize: 14,
        color: '#333333',
    },
    
    // Add Button
    addButton: {
        position: 'absolute',
        right: 135,
        bottom: -49,
        backgroundColor: '#0C36FF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 8,
    },
    addButtonIcon: {
        color: '#FFFFFF',
    },
    
    // Create/Edit Button - updated with Academic Schedule styles
    createButtonContainer: {
        padding: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0C36FF',
        paddingVertical: 15,
        borderRadius: 25,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginRight: 8,
    },
    editButton: {
        padding: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 50,
        width: 60,
        marginLeft: 'auto', // Improved from Academic Schedule
        marginBottom: 15,
    },
    
    // Delete Button
    deleteButton: {
        position: 'absolute',
        top: -10,
        right: -26,
        padding: 8,
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalSection: {
        marginBottom: 16,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333333',
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeLabel: {
        width: 50,
        fontSize: 14,
        color: '#666666',
    },
    timeInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    timeInputText: {
        fontSize: 14,
        color: '#333333',
    },
    selectionInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    selectionIcon: {
        marginRight: 10,
        color: '#666666',
    },
    selectionText: {
        fontSize: 14,
        color: '#333333',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20, // Matched with Academic Schedule
    },
    cancelButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8, // Matched with Academic Schedule
        marginRight: 8,
        padding: 12, // Added from Academic Schedule
    },
    cancelButtonText: {
        fontSize: 14,
        color: '#333333',
    },
    saveButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0C36FF',
        borderRadius: 8, // Matched with Academic Schedule
        marginLeft: 8,
        padding: 12, // Added from Academic Schedule
    },
    saveButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    
    // List Modal Styles
    listModalContainer: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
        maxHeight: '60%',
    },
    listModalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    listModalItemText: {
        fontSize: 14,
        color: '#333333',
    },
    
    // Time Picker Modal Styles - updated from Academic Schedule
    timeModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 350,
        alignSelf: 'center', // Added from Academic Schedule
        maxHeight: '80%',
    },
    timeModalTitle: {
        fontSize: 18,
        fontWeight: '600', // Matched with Academic Schedule
        marginBottom: 20,
        textAlign: 'center',
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    timePickerColumn: {
        height: 200,
        width: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        overflow: 'hidden',
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 10, // Matched with Academic Schedule
    },
    timePickerItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8, // Matched with Academic Schedule
    },
    selectedTimePickerItem: {
        backgroundColor: '#0C36FF',
    },
    timePickerText: {
        fontSize: 16,
    },
    selectedTimePickerText: {
        color: '#FFFFFF',
    },
    unselectedTimePickerText: {
        color: '#333333',
    },
    periodPickerColumn: {
        height: 200,
        justifyContent: 'center',
        marginLeft: 15,
    },
    periodPickerItem: {
        height: 40,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 5,
    },
    selectedPeriodPickerItem: {
        backgroundColor: '#0C36FF',
    },
    periodPickerText: {
        fontSize: 16,
        fontWeight: 'bold', // Added from existing styles
    },
    selectedPeriodPickerText: {
        color: '#FFFFFF',
    },
    unselectedPeriodPickerText: {
        color: '#333333',
    },
    
    // Select Button - from Academic Schedule
    selectButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#0C36FF',
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    selectButtonText: {
        color: 'white',
    },
});

export default styles;