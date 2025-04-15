import { StyleSheet } from "react-native";

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
    calendercontainer: {
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
        BookIcon: {
            width: 20,
            height: 20,
        },
        TimeIcon: {
            width: 20,
            height: 20,
        },
        FrequencyIcon: {
            width: 20,
            height: 20,
        },
        AddIcon: {
            width: 20,
            height: 20,
        },
        MenuIcon: {
            width: 15,
            height: 15,
        },
        cardContent: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            marginLeft: 10,
            marginBottom: 15,
        },
        menuTrigger: {
            padding: 10,
            alignSelf: 'flex-end',
            marginTop: 5,
            borderRadius: 10,
        },
        menuContainer: {
            backgroundColor: '#000',
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 15,
            alignItems: 'center',
        },
        menuOptionText: {
            fontSize: 13,
            color: 'white',
            paddingVertical: 5,
        },
        menuOptionDelete: {
            fontSize: 13,
            color: 'red',
            paddingTop: 5,
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
        addButton: {
            backgroundColor: "#0C36FF",
            padding: 15,
            borderRadius: 10,
            marginBottom: 25,
            alignItems: "center",
            width: 250,
            alignSelf: "center",
            flexDirection: "row",
            justifyContent: "center",
          },
          addButtonText: {
            color: "white",
            fontSize: 16,
          },
          
       centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '70%', // Half page modal
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 10,
    },
    picker: {
        height: 50,
    },
    calendarContainer: {
        marginBottom: 10,
    },
    calendar: {
        borderRadius: 10,
        elevation: 2,
        marginBottom: 10,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeInputContainer: {
        width: '48%',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 45,
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        width: '48%',
    },
    cancelButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        marginRight: 8,
    },
    cancelButtonText:{
        fontSize: 14,
        color: '#333333',
    },
    saveButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0C36FF',
        borderRadius: 5,
        marginLeft: 8,
      },
      saveButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
      },
    
    buttonSave: {
        backgroundColor: '#3557FF',
    },
    buttonCancel: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#3557FF',
    },
    buttonTextSave: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonTextCancel: {
        color: '#3557FF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    timePickerColumn: {
        height: 200,
        width: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        overflow: 'hidden',
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 5,
    },
    timePickerItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    selectedTimePickerItem: {
        backgroundColor: '#0C36FF',
    },
    timePickerText: {
        fontSize: 16,
    },
    selectedTimePickerText: {
        color: '#FFFFFF',
    },
    unselectedTimePickerText: {
        color: '#333333',
    },
    periodPickerColumn: {
        height: 200,
        justifyContent: 'center',
        marginLeft: 15,
    },
    periodPickerItem: {
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        alignItems: 'center',
        width: 50,
    },
    selectedPeriodPickerItem: {
        backgroundColor: '#0C36FF',
    },
    periodPickerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedPeriodPickerText: {
        color: '#FFFFFF',
    },
    unselectedPeriodPickerText: {
        color: '#333333',
    },
    
    // Time Modal Styles
    timeModalContainer: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
    },
    timeModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '86%', // Half page modal
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 10,
    },
    picker: {
        height: 50,
    },
    calendarContainer: {
        marginBottom: 10,
    },
    calendar: {
        borderRadius: 10,
        elevation: 2,
        marginBottom: 10,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeInputContainer: {
        width: '48%',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 45,
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        width: '48%',
    },
    buttonSave: {
        backgroundColor: '#3557FF',
    },
    buttonCancel: {
        backgroundColor: '#F0F0F0',
    },
    buttonTextSave: {
        color: 'white',
       
        textAlign: 'center',
    },
    buttonTextCancel: {
        color: '#333333',
     
        textAlign: 'center',
    },
    RepeatedcenteredView:{
        flexGrow: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    RepeatedmodalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '66%', // Half page modal
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    RepeatedmodalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    timeModalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '85%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    timePickerWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    }
});

const frequencyStyles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    radioOptionSelected: {
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#3f51b5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    selectedRb: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3f51b5',
    },
    radioText: {
        fontSize: 16,
        fontWeight: '500',
    },
    customDaysContainer: {
        marginTop: 10,
        marginBottom: 20,
        width: '100%',
    },
    daySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#3f51b5',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    dayButtonSelected: {
        backgroundColor: '#3f51b5',  // Highlight selected days
        borderRadius: 20,  // Change text color for better visibility
    },
    dayTextSelected: {
        color: 'white',  // Change text color for better visibility
    },
   
    
});



export default styles;
export { modalStyles };
export { frequencyStyles };