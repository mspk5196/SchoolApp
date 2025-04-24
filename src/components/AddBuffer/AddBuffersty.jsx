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


  //Icons
  activityIcons: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  HomeIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop:380,
  },

  timerIcon:{
    marginLeft:111,
    marginTop:20,
    alignItems:'center',
    justifyContent:'center',
  },


  //Button
  buttonContainer:{
    height:40,
    backgroundColor:'#3557FF',
    borderWidth:2,
    borderColor:'#3557FF',
    justifyContent:'center',
    borderRadius:20,
    width:270,
    marginLeft:33,
    marginTop:380,
  },
  sendText:{
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  }

})

export default styles;