import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FaFaFa',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        right: 23,
        backgroundColor: '#AEBCFF',
        padding: 12,
        borderRadius: 100,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
        paddingTop: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FAFAFA',
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderColor: '#00000080',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
    },
    backButton: {
        paddingRight: 10,
        paddingTop: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    todayText: {
        fontSize: 15,
        marginVertical:'auto',
        fontWeight: '400',
        color: 'rgb(52, 52, 52)',
    },
    dateNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateNavArrow: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 10,
    },
    dateButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    todayIndicator: {
        marginRight: 10,
    },
    dateText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    deleteIcon: {
        // marginLeft: 155,
        color: '#FF6B6B',
        right:0
    },
    scrollContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    classnavgrade: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        flexGrow: 0,
        flexShrink: 0,
    },
    gradeselection: {
        backgroundColor: '#ffffff',
        padding: 10,
        marginLeft: 10,
        marginTop: 10,
        width: 80,
        borderRadius: 30,
        alignItems: 'center',
    },
    gradeselectiontext: {
        color: 'black',
        fontWeight: '500',
    },
    activeButton: {
        backgroundColor: '#0C36FF',
    },
    activeText: {
        color: 'white',
    },
    card: {
        padding: 30,
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 15,
        // Default card style for Level Promotion
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    centeredCardContent: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 20,
    },
    centeredText: {
        marginLeft: 0, // Remove left margin when centered
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    calendarModalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        width: '90%',
        maxHeight: '80%',
    },
    cancelModalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingVertical: 12,
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#FF6B6B',
        paddingVertical: 12,
        borderRadius: 5,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default styles;