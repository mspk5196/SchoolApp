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
    marginBottom: 25,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginTop: 20,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop: 18,
  },

  // Underline
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  code: {
    fontSize: 12,
    color: '#888',
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

  //Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 1,
    marginVertical: 10,
    marginTop: 30,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },



  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
  },

  date: {
    fontSize: 12,
    color: '#444',
    marginLeft: 150,
  },
  arrowicon: {
    height: 20,
    width: 20,
    marginTop: 40,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  feeTag: {
    backgroundColor: '#D6DDFF ',
  },

  academicTag: {
    backgroundColor: '#A4F4E7',
  },

  otherTag: {
    backgroundColor: '#D6DDFF',
  },

  defaultTag: {
    backgroundColor: '#D6DDFF',
  },

  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0C36FF',
  },

  dropdownContent: {
    marginTop: 10,
  },

  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },

  amountText: {
    fontWeight: 'normal',
  },

  descriptionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  descriptionText: {
    fontSize: 13,
    color: '#555',
  },




})

export default styles;