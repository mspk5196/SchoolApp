import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    HomeIcon: {
        width: 23,
        height: 23,
    },
    Header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    HeaderTxt: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#000000',
        marginLeft: 10,
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
        width: 100,
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
        width: 110, // Fixed width from Academic Schedule
        elevation: 1,
    },

    //Flatlist items1
    gradeList: {
        flexDirection: "row",
        marginVertical: 10,
        marginHorizontal: 10,
        flex: 0,
        flexGrow: 0
    },

    gradeItem: {
        // paddingVertical: 15,
        paddingHorizontal: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 90,
        borderRadius: 40,
        marginRight: 10,
    },

    selectedGrade: {
        backgroundColor: "#2563EB",
        textAlign: "center",
    },

    gradeText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#000",
    },

    selectedGradeText: {
        color: "#FFF",
    },

    // Empty state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        marginTop: 40,
    },

    subjectListContainer: {
        flex: 1,
        marginTop: 20,
    },

    noDataContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 300,
    },

    // New styles for enhanced layout
    subjectContainer: {
        marginBottom: 16,
    },

    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 16,
    },

    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginHorizontal: 4,
        alignItems: 'center',
    },

    topicHierarchyButton: {
        backgroundColor: '#4CAF50',
    },

    batchManagementButton: {
        backgroundColor: '#FF9800',
    },

    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default styles;