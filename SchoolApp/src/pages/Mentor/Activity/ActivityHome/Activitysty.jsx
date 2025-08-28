import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

  
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },


  //Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",  
    justifyContent: "flex-start",  
    gap: 10,   
    marginTop: 30,
    paddingHorizontal: 20,
  },

  homeIcon: {
    width: 30,
    height: 30,
  },

  activityText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },



  // FlatList Items
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
    height: 100, 
    marginVertical: 8,
    borderRadius: 10,
    width: "100%",
    flex: 1, 
  },
  activityList:{
    padding:15,
  },

  icon: {
    width: 50,
    height: 50,
    marginRight: 30, 
    fontWeight:'bold',
    fontSize:20,
  },

  itemText: {
    fontSize: 20,
    color: "#333",
    flex: 1, 
    fontWeight:'bold',
    textAlign: "left",
  },

  selectedText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default styles;
