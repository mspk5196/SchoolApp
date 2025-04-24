import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  backButton: {
    paddingRight: 10,
    paddingTop: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
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
classnavsection:{
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
    width: 90,
    borderRadius: 30,
    alignItems: 'center',
},
gradeselectiontext: {
    color: 'black',
    fontWeight:'500',
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
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 12,
    width:74,
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
    width: 65,
    height: 65,
    borderRadius: 30,
    marginBottom: 11,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B2829',
  },
  listId: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
    color: '#323F49',
  },
   
 
});

export default styles;