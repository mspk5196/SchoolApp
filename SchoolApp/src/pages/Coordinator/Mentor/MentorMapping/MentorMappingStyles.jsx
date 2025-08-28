import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
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

  tabContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#1e88e5',
  },
  tabText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  addButton: {
    marginVertical: 10,
    alignItems: 'center',
    padding: 10
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#3557FF',

  },
  mentorList: {
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
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
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  specification: {
    fontSize: 14,
    color: '#555',
  },
  facultyId: {
    fontSize: 12,
    color: '#000',
  },
  moreIcon: {
    display: 'flex',
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'center',
  },
  moreText: {
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
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
    color: "#000"
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
    backgroundColor: '#3557FF',
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
    gap: 6,
    color: '#000',
  },
  Hat: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6
  },
  // Section Tabs
  sectionTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    width: 115,
  },
  activeSectionTab: {
    backgroundColor: '#0C36FF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeSectionTabText: {
    color: '#FFFFFF',
  },
});

export default styles;
