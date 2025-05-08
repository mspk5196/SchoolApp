import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FaFaFa',
    },
    HomeIcon: {
        width: 19,
        height: 17,
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
        fontSize: 23,
        fontWeight: '600',
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
    classnavsection:{
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
        fontWeight:'500',
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
    
});

export default styles;