import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  // Safe Area & Container
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  
  // Header Components
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginTop: hp('2%'),
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    marginLeft: wp('3%'),
  },
  headerText: {
    color: '#000',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  headerBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd',
    marginBottom: hp('2%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: '#000',
    width: '100%',
    alignSelf: 'center',
  },

  // Activity Header (for survey list)
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    gap: wp('1.5%'),
  },
  activityText: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hp('0.1%'),
  },

  // Form Container & Content
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: wp('4%'),
    paddingBottom: hp('12%'),
  },
  formListContainer: {
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
    paddingBottom: hp('15%'),
  },

  // Card Components
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Survey Card Specific
  surveyCard: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    paddingVertical: hp('3.5%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 0.5,
  },

  // Form Fields
  fieldContainer: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    marginBottom: hp('0.8%'),
    color: '#333',
  },
  input: {
    height: hp('6%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#f9f9f9',
    fontSize: wp('3.5%'),
    color: '#333',
  },
  textArea: {
    minHeight: hp('12%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    paddingTop: hp('1%'),
    backgroundColor: '#f9f9f9',
    fontSize: wp('3.5%'),
    color: '#333',
    textAlignVertical: 'top',
  },
  descriptionInput: {
    height: hp('12.5%'),
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#f8f9fa',
    fontSize: wp('3.5%'),
    marginBottom: hp('1.2%'),
  },

  // Dropdown Components
  dropdown: {
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    minHeight: hp('6%'),
    backgroundColor: '#f9f9f9',
  },
  dropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  // Question Components (for feedback)
  questionContainer: {
    marginBottom: hp('2%'),
    padding: wp('3%'),
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  questionLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#495057',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9ecef',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginTop: hp('1%'),
  },
  addQuestionButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#495057',
  },

  // Survey List Card Components
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    marginRight: wp('1.2%'),
  },
  statusText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#7991A4',
  },

  // Info Section
  gradeText: {
    fontSize: wp('3.8%'),
    marginTop: hp('0.6%'),
    fontWeight: '600',
    color: '#333',
  },
  studentCount: {
    fontSize: wp('3.8%'),
    color: '#27AE60',
    marginTop: hp('0.4%'),
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('0.6%'),
  },
  activeTime: {
    fontSize: wp('3.5%'),
    color: '#EB4B42',
  },
  inactiveTime: {
    fontSize: wp('3.5%'),
    color: '#7991A4',
  },

  // Buttons
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: hp('1.6%'),
    borderRadius: wp('6%'),
    flex: 1,
    marginRight: wp('2.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  surveyButton: {
    backgroundColor: '#3557FF',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.2%'),
  },
  surveyButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  selectStudentsButton: {
    flex: 1,
    height: hp('6%'),
    backgroundColor: '#3557FF',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  selectStudentsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  selectButton: {
    backgroundColor: '#3557FF',
    borderRadius: wp('6%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  allotButton: {
    backgroundColor: '#2E5BFF',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    marginTop: hp('2.2%'),
  },
  allotButtonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },

  // Home Button
  homeButton: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: wp('6%'),
    backgroundColor: '#AEBCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Navigation
  bottomBar: {
    flexDirection: 'row',
    padding: wp('4%'),
    backgroundColor: '#f4f4f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: hp('10%'),
  },

  // Activity Icons
  activityIcons: {
    position: 'absolute',
    bottom: hp('4%'),
    right: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('4%'),
  },
  addIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('2.5%'),
  },
  homeIcon: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('2.5%'),
    marginRight: wp('2.5%'),
    marginTop: hp('5%'),
  },

  // Modal Components
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    padding: wp('5%'),
    maxHeight: '80%',
  },
  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    padding: wp('5%'),
    maxHeight: hp('85%'),
    top: hp('25%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    marginBottom: hp('2%'),
    textAlign: 'center',
    color: '#333',
  },

  // Student Components
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentDetails: {
    justifyContent: 'center',
  },
  studentName: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
  },
  studentRoll: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.2%'),
  },
  studentLevel: {
    fontSize: wp('3.8%'),
    marginTop: hp('0.2%'),
  },
  avatarContainer: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Checkbox Components
  checkbox: {
    width: wp('6%'),
    height: wp('6%'),
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: wp('1%'),
    fontSize: wp('4.5%'),
  },
  checkboxSelected: {
    width: wp('6%'),
    height: wp('6%'),
    backgroundColor: '#3557FF',
    borderRadius: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Book Icon
  bookIcon: {
    fontSize: wp('4%'),
    color: '#2E5BFF',
    marginTop: hp('1%'),
  },
});

export default styles;