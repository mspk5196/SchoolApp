import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    marginBottom: 10,
  },
  MentorDayDetails:
  {
    width: '95%',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 7,
    marginBottom: -4
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,

  },
  mentorInfo: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E3E3E3',
    padding: 10

  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#000',
    fontWeight: '700'
  },
  statsContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },

  statBox: {
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  statLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600'

  },
  infoBox: {
    width: '95%',
    margin: 10,
  },
  infoRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderRadius: 10
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row'
  },
  infoTitle: {
    marginTop: 3,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    marginLeft: 5

  },
  infoTitle1: {
    marginTop: 3,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    marginLeft: 30
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 6,
    color: '#000',
    fontWeight: "600"
  },

  penicon: {
    marginTop: 5,
    marginLeft: 5
  },
  scheduleSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 10,
    width: '95%',
    margin: 10,
    borderRadius: 10,
    marginBottom: -10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000'
  },
  // Updated date navigation styles
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateNavigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 10,
  },
  dateNavArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 10,
  },
  dateButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  assignButton: {
    marginLeft: 10,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    marginBottom: 7,
    width: '95%',
    margin: 10
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  gradeText: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
    fontWeight: '600'

  },
  typeText: {
    fontSize: 14,
    color: '#ff9800',
    marginTop: 4,
    fontWeight: '600'
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  eyeicon: {
    marginTop: 7
  },
  shedulesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '95%',
    margin: 10,
    borderRadius: 10
  },
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
  calendarModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedSubject: {
    backgroundColor: '#F0F7FF',
  },
  selectedSubjectText: {
    color: '#0066CC',
    fontWeight: '500',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteIcon: {
    marginLeft: 10,
    color: '#FF6B6B',
  },
  homeButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 25,
  },
  // Add new styles for session modal
  sessionModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  sessionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 10,
  },
  sessionList: {
    maxHeight: 350,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checkboxContainer: {
    marginRight: 10,
  },
  sessionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  allotButton: {
    marginTop: 20,
    backgroundColor: '#0C36FF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  allotButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add new styles for faculty modal
  facultyModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchBox: {
    backgroundColor: '#e8e8e8',
    padding: 12,
    borderRadius: 10,
  },
  facultyList: {
    maxHeight: 350,
  },
  facultyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedFacultyItem: {
    backgroundColor: '#F0F7FF',
  },
  facultyDetails: {
    flex: 1,
  },
  staffName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  hatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  facultySpec: {
    fontSize: 14,
    color: '#666',
  },
  selectButton: {
    marginTop: 15,
    backgroundColor: '#0C36FF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facultyModalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  facultyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFacultyItem: {
    backgroundColor: '#f0f8ff',
  },
  facultyDetails: {
    flex: 1,
  },
  staffName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  hatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  facultySpec: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  checkboxContainer: {
    marginLeft: 10,
  },
  selectButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
export default styles