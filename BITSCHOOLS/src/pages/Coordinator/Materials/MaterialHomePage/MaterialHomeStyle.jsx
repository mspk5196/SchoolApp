import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    HomeIcon: {
        width: 25,
        height: 25,
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
        marginHorizontal: 10,
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
    cardManagementOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        gap:20
    },
    managementButton: {
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        minWidth: 70,
        alignItems: 'center',
    },
    managementButtonText: {
        fontSize: 12,
        fontWeight: '600',
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
    noScheduleText:{
        color:'grey',
        alignSelf:'center'
    },
    activeSectionTab: {
        backgroundColor: '#0C36FF',
    },
    sectionTabText: {
        fontSize: 14,
        alignSelf:'center',
        color: '#333333',
    },
    activeSectionTabText: {
        color: '#FFFFFF',
        paddingLeft: 5, // Added from Academic Schedule
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    noDataContent: {
        flex: 1,
        justifyContent: 'center',
    },
});

export default styles;