import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#Fdfdfd',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
        paddingTop: 42,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderColor: '#00000080',

      },
      headerTitle: {
        marginLeft: 15,
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
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
        marginTop: 20,
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
        fontSize: 16,
        fontWeight:"700", 
        fontWeight: "bold",
        marginLeft: 20,
      },
    
});

export default styles;