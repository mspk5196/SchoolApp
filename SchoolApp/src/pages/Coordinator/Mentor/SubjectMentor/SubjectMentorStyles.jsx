import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  subjectTabsContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginLeft: -10,
    marginRight: -10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: 'white',
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
  selectedCard: {
    backgroundColor: '#EBEEFF',
  },

  scrollWrapper: {
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10, // Add padding on both sides
    paddingRight: 20, // Extra padding at the end to ensure last item isn't cut off
  },
  classnavsubject: {
    flexDirection: 'row',
    paddingVertical: 8,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#fff',
  },
  subjectselection: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginRight: 10, // Use marginRight instead of marginHorizontal for more predictable scrolling
    marginTop: 20,
    width: 110, // Slightly wider for better content display
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  gradeselectiontext: {
    color: 'black',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#0C36FF',
  },
  activeText: {
    color: 'white',
  },
  addButton: {
    marginVertical: 10,
    alignItems: 'center',
  },
  addButtonText:
  {
    fontSize: 15,
    color: '#0C36FF',
    fontWeight: '600'
  },
  mentorList: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1857C0'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border for better look
  },
  cardContent: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  specification: {
    fontSize: 14,
    color: '#555',
  },
  facultyId: {
    fontSize: 12,
    color: '#777',
  },
  moreIcon: {
    padding: 8,
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 20,
    color: '#999',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  searchBox: {
    backgroundColor: '#e8e8e8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  facultyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',

  },
  facultyDetails: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000'
  },
  facultySpec: {
    fontSize: 14,
    color: '#000',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#0C36FF',
    paddingVertical: 12,
    borderRadius: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  staffName:
  {
    display: 'flex',
    flexDirection: 'row',
    gap: 6
  },
  Hat: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6
  },


});

export default styles;
