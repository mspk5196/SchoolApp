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
      fontSize: 17,
      color: "#000000",
      fontWeight:'bold',
      marginTop: 10,
      marginRight:29,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
    },
    callButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 0.1,
    },
    chatButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
 
  


});

export default styles;