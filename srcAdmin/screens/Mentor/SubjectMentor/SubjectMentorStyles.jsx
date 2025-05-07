import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 32,
    marginHorizontal: -10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
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
  selectedCard: {
    backgroundColor: '#fafafa',
  },

  scrollWrapper: {
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  classnavsubject: {
    flexDirection: 'row',
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  subjectselection: {
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
  addButtonText: {
    fontSize: 15,
    color: '#0C36FF',
    fontWeight: '600',
  },
  mentorList: {
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1857C0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700', 
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  specification: {
    fontSize: 12.8,
    color: '#555',
  },
  facultyId: {
    fontSize: 11,
    color: '#777',
  },
  moreIcon: {
    padding: 8,
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 20,
    color: '#333',
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
    color: '#000',
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
  staffName: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
  Hat: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
});

export default styles;
