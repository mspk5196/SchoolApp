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
    scrollWrapper: {
        marginVertical: 10,
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
    classnavsection: {
        flexDirection: 'row',
        marginBottom: 20,
        flexGrow: 0,
        flexShrink: 0,
    },
    gradeselection: {
        backgroundColor: '#ffffff',
        padding: 10,
        marginLeft: 10,
        marginTop: 10,
        width: 90,
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 15,
    },
    cardText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 20,
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
    },
    noScheduleText: {
        color: 'grey',
        alignSelf: 'center'
    },
    activeSectionTab: {
        backgroundColor: '#0C36FF',
    },
    sectionTabText: {
        fontSize: 14,
        alignSelf: 'center',
        color: '#333333',
    },
    activeSectionTabText: {
        color: '#FFFFFF',
        paddingLeft: 5, // Added from Academic Schedule
    },

});

export default styles;