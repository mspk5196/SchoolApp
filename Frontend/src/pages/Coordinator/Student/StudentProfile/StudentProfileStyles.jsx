import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
  },
  headerTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  BackIcon: {
    width: 20,
    height: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  selectedCard: {
    backgroundColor: '#EBEEFF',
  },


  scrollWrapper: {
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  classnavgrade: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  classnavsection: {
    flexDirection: 'row',
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  gradeselection: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginLeft: 10,
    marginTop: 20,
    width: 100,
    borderRadius: 30,
    alignItems: 'center',
  },
  gradeselectiontext: {
    color: 'black',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#0C36FF',
  },
  activeText: {
    color: 'white',
  },
  listItem: {
    width: '45%',
    margin: 8,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: '#2D50FD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  removeText: {
    color: '#fff',
  },
  listContent: {
    marginLeft: 0,
    alignItems: 'center',
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  listName: {
    fontWeight: '500',
    color: 'black',
  },
  listId: {
    fontWeight: '400',
    fontSize: 12,
    color: 'grey',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },

});

export default styles;