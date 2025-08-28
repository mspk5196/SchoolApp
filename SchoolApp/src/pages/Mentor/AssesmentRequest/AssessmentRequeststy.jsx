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
    borderRadius: 8,
    padding: 16,
    marginBottom: 0,
    marginTop: 16,
    marginHorizontal: 2,
    marginVertical: 2,
    elevation: 1,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
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
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    marginTop: 12,
    fontSize: 13,
    color: '#444',
    flexDirection: 'row',
    gap: 5,
  },
  timerow: {
    flexDirection: 'row',
  },
  students: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
    borderColor: "#BDBDBD",
    borderWidth: 1,
  },
  activeLevel: {
    borderColor: "#3557FF",
    backgroundColor: "#F5F7FF",
  },
  levelText: {
    fontSize: 12,
    color: '#3557FF',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 80,
  },
  activityIcons: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    backgroundColor: '#0C36FF',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // elevation: 3,
  },
  clockicon: {
    marginTop: 14,
    marginRight: 1,
    marginLeft: 110,
  },

  // Student List Styles
  studentsContainer: {
    backgroundColor: '#fffff',
    marginBottom: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 2,
    marginVertical: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 1,
    // borderWidth: 0.5,
    // borderColor: '#eee',
    borderTopWidth: 0,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1.5,
    height: 80
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentDetails: {
    marginLeft: 10,
    gap: 5,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentId: {
    fontSize: 13,
    color: '#777',
  },
  studentDate: {
    fontSize: 12,
    color: '#777',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Adds space at the bottom for the floating action button
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    minHeight: '80%', // Use minHeight to ensure it takes up enough space
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '30%', // Position more towards the center
  },
});