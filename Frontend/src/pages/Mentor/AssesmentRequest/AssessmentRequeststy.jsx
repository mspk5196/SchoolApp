import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },


  //Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  homeIcon: {
    marginRight: 10,
  },
  activityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  
  // Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
  },



  //card
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 16,
    marginBottom: 12,
    marginTop:40,
    borderWidth:0.1,
    elevation:2,
    shadowOpacity:2,
    },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    backgroundColor: '#ddd',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  staffId: {
    fontSize: 12,
    color: '#777',
  },
  status: {
    color: '#EEAA16',
    fontWeight: 'bold',
  },
  grade: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  subject: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight:'500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    marginTop:12,
    fontSize: 13,
    color: '#444',
    flexDirection:'row',
    gap:5,
  },
  timerow:{
    flexDirection:'row',
  },
  students: {
    fontSize: 14,
    color: '#333',
    fontWeight:'600',
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderColor:"#BDBDBD",
    borderWidth:1,
  },
  levelText: {
    fontSize: 12,
    color: '#3557FF',
    fontWeight:'500',
  },
  listContainer: {
    paddingBottom: 80,
  },
  activityIcons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },


  //Icons
  AddIcon: {
    borderRadius: 30,
    padding: 10,
  },
  clockicon:{
    marginTop:14,
    marginRight:1,
    marginLeft:110,
  },
});
