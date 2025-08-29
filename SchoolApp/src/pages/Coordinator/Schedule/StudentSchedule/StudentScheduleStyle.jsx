import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    controlsContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    datePickerText: {
        fontSize: 18,
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#0C36FF',
    },
    periodContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    periodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        paddingBottom: 10,
        marginBottom: 10,
    },
    periodTime: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    periodSubject: {
        fontSize: 16,
        color: '#333'
    },
    editButtonText: {
        color: '#007BFF'
    },
    activityContainer: {
        // styles for batch activities
    },
    activity: {
        paddingVertical: 5,
    },
    overridesContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderColor: '#f0f0f0',
        paddingTop: 10,
    },
    overrideTitle: {
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    overrideItem: {
        backgroundColor: '#FFF5F5',
        padding: 8,
        borderRadius: 5,
        marginTop: 5,
    },
    noScheduleText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        backgroundColor: '#0C36FF',
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    // Section Tabs
    sectionTabsContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        // flex: 0
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
});

export default styles;