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

  //Add
  addIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    padding: 20,
    backgroundColor: '#0C36FF',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Search Bar
  searchView: {
    flexDirection: "row",
    paddingVertical: 15,
    marginTop: 20,
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 345,
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

  // Tabs (All, Unread, Read)
  tabContainer: {
    flexDirection: "row",
    marginVertical: 15,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C4C4C4",
    marginRight: 10,
  },
  selectedTab: {
    backgroundColor: "#3557FF",
    borderColor: "#3557FF",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedTabText: {
    color: "#FFF",
  },

  // Message List
  inboxItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  inboxLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inboxDot: {
    width: 9,
    height: 9,
    backgroundColor: "#3557FF",
    borderRadius: 50,
    marginRight: 10,
    marginBottom: 40,
  },
  inboxText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },
  inboxMsg: {
    fontSize: 14,
    color: "#868686",
    marginTop: 2,
    flexShrink: 1,
  },
  inboxTime: {
    fontSize: 12,
    color: "#868686",
    alignSelf: "center",
  },
});

export default styles;


