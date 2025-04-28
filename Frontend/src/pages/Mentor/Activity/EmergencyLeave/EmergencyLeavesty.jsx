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

  // Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
  },


   // Search Bar
   searchView: {
    flexDirection: "row",
    paddingVertical:15,
    alignItems:'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems:'center', 
    width:290,
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
  HomeIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },



  //Flatlist 
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFF",
      padding: 15,
      gap:20,
      paddingBottom:10,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 0.5,
    },
    leftSection: {
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
    name: {
      fontSize: 16,
      fontWeight: "bold",
      color:"black"
    },
    studentId: {
      fontSize: 14,
      color: "#777",
      marginTop:7,
    },
    applyButton: {
      backgroundColor: "#0A58ED",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    applyText: {
      color: "#FFF",
      fontSize: 14,
      fontWeight: "bold",
    },
  
  
})

export default styles;