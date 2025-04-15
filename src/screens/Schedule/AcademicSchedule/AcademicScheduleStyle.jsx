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
    Tick2Icon: {
        width: 20,
        height: 20,
    },
    Add2Icon: {
        width: 20,
        height: 20,
    },
    Time2Icon: {
        width: 15,
        height: 15,
    },
    Book2Icon: {
        width: 15,
        height: 15,
    },
    sectionTabs: {
        flexGrow: 0,
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 15,
      },
      
      daysTabs: {
        flexGrow: 0,
        marginBottom: 5,
        marginLeft: 15,
      },
      scrollViewContent: {
        flexGrow: 1,
      },
      sectionTab: {
        // Reduce these values
        paddingHorizontal: 20, // Try a smaller value like 10
        paddingVertical: 12,   // Try a smaller value like 8
        marginRight: 10,       // Keep spacing between tabs
        borderRadius: 20,
        // Add a fixed width if needed
        width: 105,            // Adjust based on your design
      },

      dayTab: {
        // Reduce these values
        paddingHorizontal: 14, // Try a smaller value like 10
        paddingVertical: 12,   // Try a smaller value like 8
        marginRight: 10,
        borderRadius: 10,
        // Add a fixed width if needed
        width: 65,             // Adjust based on your design
      },
      
      
      
      
      activeTab: {
        backgroundColor: '#0C36FF',
      },
      sectionTabText: {
        fontSize: 14,
        color: '#333333',
      },
      activeTabText: {
        color: '#FFFFFF',
        paddingLeft: 5,
      },     
      activeDay: {
        borderWidth: 1,
        borderColor: '#0C36FF',
        borderRadius: 20,
      },
      dayText: {
        fontSize: 14,
        color: '#333333',
      },
      activeDayText: {
        color: '#0C36FF',
        paddingLeft: 5,
      },
      sessionsContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
      },
      sessionItem: {
        marginBottom: 16,
      },
      sessionTimes: {
        marginBottom: 8,
      },
      timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        marginLeft: 15,
      },
      timeLabel: {
        width: 60,
        fontSize: 14,
        color: '#999999',
      },
      timeValue: {
        width: 100,
      },
      timeText: {
        fontSize: 14,
        color: '#999999',
      },
      timeIcon: {
        marginLeft: 8,
      },
      circle: {
        width: 14,
        height: 14,
        marginVertical: 7,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#0C36FF',
        backgroundColor: '#FFFFFF',
      },
      clockIcon: {
        marginLeft: 16,
      },
      sessionNameContainer: {
        marginLeft: 12,
      },
      sessionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
      },
      subjectContainer: {
        marginLeft: 204,
        position: 'absolute',
        top: 28,
        left: 8,
      },
      subjectButton: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      subjectText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333333',
      },
      verticalLine: {
        position: 'absolute',
        left: 188,
        top: 28,
        width: 2,
        height: 50,
        backgroundColor: '#7991A4',
      },
      addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        marginHorizontal: 93,
        width: 200,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'black',
        borderRadius: 5,
      },
      addButtonText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#0C36FF',
      },
      createButtonContainer: {
        padding: 16,
      },
      createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0C36FF',
        paddingVertical: 15,
        borderRadius: 25,
      },
      createButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginRight: 8,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      subjectModalContainer: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
      },
      subjectModalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
      },
      subjectModalText: {
        fontSize: 16,
        color: '#333333',
      },
  
      periodItem: {
        paddingVertical: 16,
        marginVertical: 16,
      },
      editButton: {
        padding: 20,
        backgroundColor: '#0C36FF',
        borderRadius: 50,
        width: 60,
        marginLeft: 330,
        marginBottom: 15,
      },
      EditIcon: {
        width: 20,
        height: 20,
      },
      timeModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 350,
        alignSelf: 'center',
        maxHeight: '80%',
      },
      timeModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
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
        marginHorizontal: 10,
      },
      timePickerItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
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
        marginLeft: 15,
        height: 200,
        justifyContent: 'center',
      },
      periodPickerItem: {
        height: 40,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 5,
      },
      selectedPeriodPickerItem: {
        backgroundColor: '#0C36FF',
      },
      periodPickerText: {
        fontSize: 16,
      },
      selectedPeriodPickerText: {
        color: '#FFFFFF',
      },
      unselectedPeriodPickerText: {
        color: '#333333',
      },
      modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
      },
      cancelButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
      },
      cancelButtonText: {
        color: 'black',
      },
      selectButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#0C36FF',
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
      },
      selectButtonText: {
        color: 'white',
      },
  });


  export default styles;