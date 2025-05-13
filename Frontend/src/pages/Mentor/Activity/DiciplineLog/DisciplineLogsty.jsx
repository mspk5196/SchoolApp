import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginTop:30,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop:30,
  },


  //Icons
  activityIcons: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  AddIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },



   // Search Bar
   searchView: {
    flexDirection: "row",
    paddingVertical:15,
    marginTop:1,
    alignItems:'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems:'center', 
    width:345,
    paddingHorizontal:20,
    borderRadius:30,
    marginRight:20,
    backgroundColor: "#EEEFF9",
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#888",
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    color: "#000", 
    paddingVertical: 10,
    paddingHorizontal: 10,
  },




  //Flatlist
    card: {
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 2,
      marginBottom: 15,
      paddingVertical:20,
      marginHorizontal:1,
      marginVertical:1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    profilePic: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#ddd",
      marginRight: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },
    stdid: {
      fontSize: 14,
      color: "#666",
    },
    date: {
      fontSize: 12,
      color: "#999",
    },
    reasonTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 10,
      color:'black',
      marginLeft:10,
    },
    reasonBox: {
      backgroundColor: "#F7F8FA",
      padding: 10,
      borderRadius: 5,
      marginTop: 5,
    },
    reasonText: {
      fontSize: 14,
      color: "#333",
      padding:10,
    },
    registeredText: {
      fontSize: 15,
      color: "#000000",
      fontWeight:'bold',
      marginTop: 10,
      // alignItems:'flex-start'
    },
    actionButtons: {
      flex:1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    callButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    chatButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
 // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#3366ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Confirmation modal styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
  },
  confirmModalContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  confirmAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
  },
  confirmReasonContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  confirmReasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmReasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#3366ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  AddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    padding: 20,
    backgroundColor: '#0C36FF',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonCall: {
    backgroundColor: '#AEBCFF', 
    borderRadius: 999,
    padding: 8,
    marginLeft: 'auto',
    marginRight: 10,
  },
  actionButtonMsg: {
    backgroundColor: '#A4F4E7', 
    borderRadius: 999,
    padding: 8,
  },
  


});

export default styles;