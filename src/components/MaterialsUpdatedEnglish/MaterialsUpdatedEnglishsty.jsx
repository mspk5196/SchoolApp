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
    marginTop: 15,
    paddingHorizontal: 1,
  },

  homeIcon: {
    width: 30,
    height: 30,
    marginTop:5,
  },

  activityText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginTop:3,
    marginRight:50,
  },
  heading:{
    marginTop:20,
    fontWeight:'bold',
    fontSize:19,
    color:'#333',
  },



  levelContainer: {
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    marginTop:20,
    borderRadius: 10,
    elevation: 0.1,
    padding: 10,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  levelTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color:'#333',
  },
  expectedDate: {
    color: '#888',
    fontSize: 12,
    marginTop:4,
    marginLeft:100,
  },
  editicon:{
    width: 30,
    height:30,
    marginTop:5,
    marginRight:5,
  },
  edit:{
    color:'blue',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopLeftRadius:8,
    borderTopRightRadius:8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#365cff',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  materialBox: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  materialText: {
    flex: 1,
    fontSize: 14,
    color: '#000', 
    marginLeft:10,
  },
  noMaterial: {
    textAlign: 'center',
    color: '#aaa',
    paddingVertical: 10,
  },
});

export default styles;