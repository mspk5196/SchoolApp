import { StyleSheet } from "react-native";

const styles = StyleSheet.create({


  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },


  //Underline
 underline: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
    marginTop:10,
  }, 


  //Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",  
    justifyContent: "flex-start",  
    gap: 10,   
    marginTop: 20,
    paddingHorizontal: 20,
  },

  homeIcon: {
    width: 30,
    height: 30,
  },

  activityText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginTop:3,
  },



  //Flatlist items1
  gradeList: {
    flexDirection: "row",
    marginVertical: 10,
  },

  gradeItem: {
    paddingVertical: 15,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginRight: 10,
  },

  selectedGrade: {
    backgroundColor: "#2563EB",
    borderRadius:20,
    height:50,
    textAlign:"center",
  },

  gradeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  selectedGradeText: {
    color: "#FFF",
  },


  // FlatList Items2
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center',
    padding: 10,
    height: 100, 
    marginVertical: 8,
    borderRadius: 10,
    width: "100%",
    flex: 1, 
  },
  activityList:{
    padding:12,
  },

  itemText: {
    fontSize: 20,
    color: "#333",
    flex: 1, 
    fontWeight:'bold',
    textAlign: "center",
  },

  selectedText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default styles;