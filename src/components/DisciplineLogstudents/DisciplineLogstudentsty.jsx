import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },


  //Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginTop: 15,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop: 15,
  },


  //Searchbar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 350,
    paddingHorizontal: 20,
    marginTop:20,
    borderRadius: 10,
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
 
  
  
  //Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
  },



  recentTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },




  //Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePic: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#ddd', 
    marginRight: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    flexDirection:'row',
  },
  userName: {
    fontSize: 16,
    color: "#000",
  },


});
