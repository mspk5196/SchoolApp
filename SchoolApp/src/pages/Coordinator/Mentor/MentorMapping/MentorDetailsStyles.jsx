import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FaFaFa',
    flex: 1,
  },
  SubNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: 'white',
  },
  headerTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
    paddingTop: 0,
    position: 'absolute',
    left: 40,
    top: -22,

  },
  BackIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    left: 17,
    top: -17,
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
    width: 50,
    height: 50,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  specification: {
    fontSize: 12,
    color: '#000',
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    gap: 40,
    marginTop: 20
  },
  student:
  {
    fontSize: 12,
    marginLeft: 40,
    fontWeight: '600'
  },
  subject: {
    fontSize: 12,
    fontWeight: '500'
  },
  tabContainer: {
    flexDirection: 'row',
    flexGrow:0,
    flexShrink:0,
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    marginBottom:5,
    borderRadius: 20,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3557FF'
  },
  tabText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,

    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },
  listId: {
    fontSize: 14,
    color: '#000'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 1,
  },
  removeText: {
    color: 'red'
  },
  listContent: {
    marginLeft: 12,
    gap:10,
  },
  listItemSub: {
    flexDirection: 'row',
    flexGrow: 1,
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#1857C0'
  },
  // Add these styles to your existing MentorDetailsStyles.js file

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000',
  },
  staffList: {
    maxHeight: 300,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  staffId: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '500',
  },
})
export default styles