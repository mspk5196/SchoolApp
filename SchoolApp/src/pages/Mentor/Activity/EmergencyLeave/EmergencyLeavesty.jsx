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
    marginTop: 30,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop: 30,
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
    paddingVertical: 15,
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center', 
    width: 290,
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

  // Icons
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

  // Flatlist 
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    gap: 20,
    paddingBottom: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginVertical:1,
    marginHorizontal:1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
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
    color: "black"
  },
  studentId: {
    fontSize: 14,
    color: "#777",
    marginTop: 7,
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
  
  // Modal and Popup Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000'
  },
  descriptionContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ABABAB',
    borderRadius: 5,
    marginBottom: 20,
  },
  descriptionInput: {
    borderLeftWidth:5,
    borderWidth:0.5,
    borderRadius:10,
    borderLeftColor:'rgb(224, 0, 0)',
    marginTop:20,
    marginBottom:20,
    padding: 10,
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0A58ED',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#444',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default styles;