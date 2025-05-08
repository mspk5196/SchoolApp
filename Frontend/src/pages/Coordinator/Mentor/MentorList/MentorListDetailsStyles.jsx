import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // marginLeft: 20,
  },
  todayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'

  },
  dateText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  subjectText: {
    fontSize: 16,
    color: '#000000',
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
  // Add these new styles for the calendar
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginRight: 190
  },
  calendarModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '90%',
    maxHeight: '80%',
  },
  homeButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subjectList: {
    maxHeight: 300,
  },
  subjectItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subjectItemText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  }
});
export default styles