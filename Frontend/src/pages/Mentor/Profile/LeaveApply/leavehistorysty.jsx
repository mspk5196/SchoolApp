import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',  
    width: 500,  
    alignSelf: 'center', 
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
    marginTop:40,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop: 30,
  },

  // Search Bar
  searchView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 340,
    paddingHorizontal: 20,
    borderRadius: 30,
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
  historyIcon: {
    width: 24,
    height: 24,
  },


  //Box
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft:10,
    marginTop:20,
    borderRadius: 6,
  },
  card:  {
    borderWidth: 0.3,
    marginTop: 26,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  topInfoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftBox: {
    flexDirection: "row",
    alignItems: "center",
  },


  //Profile
  profileCircle: {
    backgroundColor: "#d1d1d1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  profileInitial: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color:"#000000",
    
  },
  phone: { color: "#666" },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },



  //inbox
  status: {
    color: "#11A533D1",
    fontWeight: "bold",
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  leaveType: {
    marginLeft: 60,
    fontSize: 14,
    color: "#4B4B4B",
    gap:10,
  },



  //ReasonContainer
  reasonBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop:10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    borderStyle: 'dashed',
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: "#ABABAB",
    borderRightColor: "#ABABAB",
    borderBottomColor: "#ABABAB",
    minHeight: 65,
  },
  reasonText: {
    fontSize: 13,
    color: '#444',
  },
});
export default styles;