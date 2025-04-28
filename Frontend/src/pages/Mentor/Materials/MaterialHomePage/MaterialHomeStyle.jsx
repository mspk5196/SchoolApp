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

    //Flatlist items1
    gradeList: {
        flexDirection: "row",
        marginVertical: 10,
        marginHorizontal:10
    },

    gradeItem: {
        // paddingVertical: 15,
        paddingHorizontal: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 40,
        justifyContent:'center',
        alignItems:'center',
        height: 50,
        width:90,
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

});

export default styles;