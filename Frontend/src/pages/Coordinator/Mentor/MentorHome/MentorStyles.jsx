import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    Navbar: {
        marginTop: 90,
        marginLeft: 35,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    text: {
        color: '#323F49',
        fontSize: 19,
        fontWeight: '700',
        marginTop: 10,
    },
    container: {

        backgroundColor: '#F5F5F5',
        padding: 10,
    },
    Navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    homelogo: {
        marginTop: 10,
        marginRight: 10,
        marginLeft: 15
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 25,
        marginVertical: 8,
        marginHorizontal: 5,
        borderRadius: 15,
        marginBottom: 20,
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',

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
        elevation: 2,
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
});

export default styles