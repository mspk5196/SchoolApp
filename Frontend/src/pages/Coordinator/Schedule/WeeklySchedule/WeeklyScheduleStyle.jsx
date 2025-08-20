import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // A slightly off-white background for better contrast
    },
    scrollViewContent: {
        paddingBottom: 100, // Increased space for the floating add button
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF', // White header
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 15,
    },

    // Section Tabs
    sectionTabsContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
    },
    sectionTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F0F0F0',
    },
    activeSectionTab: {
        backgroundColor: '#0C36FF',
        shadowColor: '#0C36FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    sectionTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
    },
    activeSectionTabText: {
        color: '#FFFFFF',
    },

    // Days Navigation
    daysContainer: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 15,
        justifyContent: 'space-around', // Distribute days evenly
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 10,
    },
    dayItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    activeDayItem: {
        backgroundColor: '#E6ECFF', // A light blue to indicate active state
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    activeDayText: {
        color: '#0C36FF',
    },

    // Schedule Container
    scheduleContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 10, // Space between timeline items
    },
    noScheduleText: {
        marginTop: 50,
        color: '#666666',
        fontSize: 16,
        textAlign: 'center',
    },

    // Time Section
    timeContainer: {
        width: 90, // Adjusted width
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 5,
        textAlign: 'center'
    },
    timeIndicator: {
        alignItems: 'center',
        flex: 1,
    },
    timeCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#0C36FF',
    },
    timeLine: {
        flex: 1, // Make line fill the space
        width: 2,
        backgroundColor: '#D0D0D0', // Lighter color for the timeline
    },

    // Details Section as a Card
    detailsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        // marginLeft: 10,
        marginBottom: 15, // Space between cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        position: 'relative', // For absolute positioning of delete button
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10, // More space between details
    },
    detailIcon: {
        marginRight: 10,
        color: '#0C36FF',
    },
    detailText: {
        fontSize: 15,
        color: '#333333',
        flex: 1, // Allow text to wrap
    },

    // Add Button
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 30, // Make it circular
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    
    // Delete Button
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        borderRadius: 15,
        backgroundColor: '#FEEEEE',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        maxHeight: '85%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333333',
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeLabel: {
        width: 50,
        fontSize: 15,
        color: '#666666',
    },
    timeInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
    },
    timeInputText: {
        fontSize: 15,
        color: '#333333',
    },
    selectionInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FAFAFA',
    },
    selectionIcon: {
        marginRight: 12,
        color: '#0C36FF',
    },
    selectionText: {
        fontSize: 15,
        color: '#333333',
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        flex: 1,
        marginRight: 10, // Adjusted margin
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 8,
        flex: 1,
        marginLeft: 10, // Adjusted margin
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // List Modal Styles
    listModalContainer: {
        width: '90%',
        maxWidth: 350,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        maxHeight: '60%', // Use max height instead of fixed height
        elevation: 5,
        overflow: 'hidden', // Ensures children conform to border radius
    },
    listModalScroll: {
        flexGrow: 0,
    },
    listModalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    listModalHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center'
    },
    listModalItem: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    listModalItemText: {
        fontSize: 16,
        color: '#333333',
    },
    noMentorsText: {
        padding: 20,
        textAlign: 'center',
        color: '#666666',
        fontSize: 15
    },

    // Time Picker Modal Styles
    timeModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        maxWidth: 350,
        alignSelf: 'center',
        overflow: 'hidden',
        elevation: 5,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;