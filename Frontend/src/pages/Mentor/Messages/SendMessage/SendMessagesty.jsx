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
    marginRight: 10,
    marginTop:32,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop:30,
    marginRight:15,
  },

  // Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
  },

  //Page
  headerText:{
    marginTop:30,
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  subjectInput:{
    height: 40,
    marginTop:5,
    color:'black',
    backgroundColor:'#F7F8FA',
    borderColor: '#E7E7E7',
    borderWidth:1,
  },
  descriptionInput:{
    height: 100,
    marginTop:5,
    color:'black',
    backgroundColor:'#F7F8FA',
    borderColor: '#E7E7E7',
    borderWidth:1,
  },


  //Button
  buttonContainer:{
    height:40,
    backgroundColor:'#3557FF',
    borderWidth:2,
    borderColor:'#3557FF',
    justifyContent:'center',
    borderRadius:20,
    width:300,
    marginLeft:20,
    marginTop:380,
  },
  sendText:{
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  }
})

export default styles;