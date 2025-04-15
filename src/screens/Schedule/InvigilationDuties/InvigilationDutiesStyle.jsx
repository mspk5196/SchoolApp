import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    header:{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E3E3E3',
 },
    headerTxt:{
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      marginLeft: 10,
    },
    BackIcon: {
        width: 20,
        height: 20,
    },
    calendercontainer:{
        marginHorizontal: 15,
        marginTop: 20,
        marginVertical: 20,
        padding: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: 'white',
    },
    UpcomingExamTxt: {
        fontSize: 20,
        fontWeight: '400',
        marginHorizontal: 20,
        marginVertical: 10,
        color: 'black',
    },
    card: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 10,
        borderLeftWidth: 5, 
      },
        cardText: {
            fontSize: 18,
            fontWeight: "500",
            marginLeft: 10,
        },
        cardContent: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            marginBottom: 5,
        },
        date: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'black',
        },
        subject: {
            fontSize: 15,
            color: "black",
            paddingLeft: 10,
        },
        time: {
            fontSize: 15,
            color: "black",
            paddingLeft: 10,
            width: 200,
        },
        frequency: {
            fontSize: 15,
            color: "black",
            paddingLeft: 10,
        },
    TimeIcon: {
        width: 20,
        height: 20,
    },
    FrequencyIcon: {
        width: 20,
        height: 20,
    },
    BookIcon: {
        width: 20,
        height: 20,
    },
    MenuIcon: {
        width: 15,
        height: 15,
    },
    AssignBtn: {
        backgroundColor: '#0C36FF',
        padding: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 30,
        marginRight: 10,
        marginTop: 20,
    },
    AssignBtnTxt: {
        color: 'white',
        fontWeight: '400',
        fontSize: 15,
    },
    modal: {
        justifyContent: "flex-end",
        margin: 0,
      },
      modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        maxHeight: "60%",
      },
      searchBox: {
        backgroundColor: "#e8e8e8",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
      },
      facultyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      },
      selectedCard: {
        backgroundColor: "#EBEEFF",
      },
      staffName: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 2,
      },
      Hat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 2,
       
      },
      facultyName: {
        fontSize: 16,
        fontWeight: "bold",
      },
      facultySpec: {
        fontSize: 14,
        color: "#666",
      },
      facultyId: {
        fontSize: 12,
        color: "#777",
        paddingLeft: 27,
      },
      checkboxContainer: {
        justifyContent: "center",
        alignItems: "center",
      },
      selectButton: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 15,
        alignItems: "center",
        backgroundColor: "#3557FF",
        paddingVertical: 12,
        borderRadius: 20,
      },
      selectButtonText: {
        color: "#fff",
        fontSize: 18,
      },
      invigilatorLabel: {
            color: '#27AE60',
      },
      EditIcon:{
        width: 17,
        height: 17,
      },
      editButton:{
        paddingLeft: 20,
      },
      invigilatorName:{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
      },
      invigilatorId:{
        fontSize: 14,
        color: 'black',
      },


});

export default styles;
