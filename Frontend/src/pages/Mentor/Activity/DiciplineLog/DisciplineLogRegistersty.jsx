import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
    marginTop:8,
  },
  backicon:{
    width: 30,
    height:30,
    marginTop:9,
  },



  //Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
  },



  //Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd', 
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  stdid:{
    fontSize: 14,
    color: "#424242",
    marginBottom: 2,
    fontWeight:'600',
  },
  subText: {
    fontSize: 15,
    color: "#3C3C3C",
    marginBottom: 2,
    fontWeight:'600',
  },
  
 


  //Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    marginTop:40,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop:25,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    color:'#000000',
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  callicon:{
    width:25,
    height:25,
    marginLeft:8,
    marginTop:12,
  },
  submitButton: {
    backgroundColor: "#3557FF",
    paddingVertical: 14,
    borderRadius: 45,
    alignItems: "center",
    marginTop:290,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;
