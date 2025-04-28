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
      marginTop: 30,
    },
    activityText: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#000",
      marginTop: 30,
    },

  // Search Bar
  searchView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 290,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 20,
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
  historyIcon: {
    width: 24,
    height: 24,
  },

  // Leave Card
  inboxItem: {
    borderWidth: 0.3,
    marginTop: 26,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  topInfoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },


  //Profile
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  namePhoneContainer: {
    marginLeft: 10,
    textAlign:"left",
    marginRight:130,
  },


  //inbox
  inboxText: {
    fontWeight: "bold",
    fontSize: 16,
    color:"#000000",
  },
  inboxMsg: {
    fontSize: 13,
    color: "#777", 
  },

  status: {
    color: '#E7A05E',
    fontWeight: 'bold',
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusicon: {
    marginRight: 5,
  },

  infobox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leaveType: {
    fontWeight: '500',
    color: '#4B4B4B',
  },
  date: {
    justifyContent: "flex-end",
  },
  dateRange: {
    color: '#333',
  },




  //reasoncontainer
  reasonBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    borderStyle: 'dashed',
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: "#ABABAB",
    borderRightColor: "#ABABAB",
    borderBottomColor: "#ABABAB",
    minHeight: 65,
  },
  reasonText: {
    fontSize: 13,
    color: '#444',
  },



  //Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectBtn: {
    backgroundColor: '#CF544F',
    flex: 0.48,
    padding: 10,
    borderRadius: 8,
  },
  acceptBtn: {
    backgroundColor: '#6CA044',
    flex: 0.48,
    padding: 10,
    borderRadius: 8,
  },
  rejectText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },



  //Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#000",
    marginRight:84,
   },
  
  reasonCard: {
    width: "100%",
    backgroundColor: '#FFFFFF',
    borderRightColor: "#E0E0E0",
    borderTopColor:'#E0E0E0',
    borderBottomColor:'#E0E0E0',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#CF544F',
    borderStyle: 'dashed',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
  },
  
  reasonText: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    backgroundColor: "#E4E9FF",
    borderRadius: 20,
    alignItems: "center",
  },
  
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    backgroundColor: "#234BFF",
    borderRadius: 20,
    alignItems: "center",
  },
  
  cancelButtonText: {
    color: "#234BFF",
    fontWeight: "600",
    fontSize: 14,
  },
  
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  
  
});

export default styles;
