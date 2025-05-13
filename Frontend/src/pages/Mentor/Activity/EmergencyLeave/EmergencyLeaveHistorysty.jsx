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


  //Flatlist
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginVertical: 1,
    marginHorizontal: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: "black",
  },
  studentId: {
    fontSize: 14,
    fontWeight: "450",
    color: "#777",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clockIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  timeText: {
    fontSize: 14,
    color: "#777",
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  descriptionBox: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#ABABAB",
    borderWidth: 0.3,
    marginTop: 5,
  },
  redLine: {
    width: 4,
    height: 'fix-the-content',
    backgroundColor: "#EB4B42",
    marginRight: 10,
    borderRadius: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    flexShrink: 1,
    paddingBottom: 20,
    paddingTop: 10,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "left",
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    marginLeft: 5,
  },
  callIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    padding: 20,
  },
  callText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2456E5",
    padding: 20,
  },



})

export default styles;