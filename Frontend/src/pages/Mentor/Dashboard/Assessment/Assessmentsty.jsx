import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  headerText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    marginLeft: wp('3%'),
    color: '#333',
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: wp('4%'),
    marginTop: hp('1%'),
  },
  sessionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  sessionTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subject: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: "#333",
  },
  time: {
    fontSize: wp('3.8%'),
    color: '#777',
  },
  gradeText: {
    marginTop: hp('1%'),
    fontSize: wp('3.8%'),
    color: '#555',
  },
  academicText: {
    color: '#333',
    fontWeight: '500',
  },
  levelRow: {
    flexDirection: 'row',
    marginTop: hp('1.5%'),
  },
  level1Btn: {
    backgroundColor: '#3366FF',
    borderRadius: 20,
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('6%'),
    marginRight: wp('2%'),
  },
  level2Btn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3366FF',
    borderRadius: 20,
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('6%'),
    marginRight: wp('2%'),
  },
  level1Text: {
    color: '#fff',
    fontWeight: '600',
  },
  level2Text: {
    color: '#3366FF',
    fontWeight: '600',
  },
  scrollBox: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    maxHeight: hp('55%'),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
  },
  profileImg: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('4%'),
  },
  profileName: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#333',
  },
  profileId: {
    fontSize: wp('3.5%'),
    color: '#777',
  },
  completeBtn: {
    backgroundColor: '#3366FF',
    position: 'absolute',
    bottom: hp('3%'),
    left: wp('6%'),
    right: wp('6%'),
    borderRadius: 30,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  feedbackModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 100,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  modalQuestion: {
    textAlign: 'center',
    fontSize: 16,
    color: "#333",
    fontWeight: 'bold',
    marginBottom: 20,
    right: wp('10%'),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    right: wp('20%'),
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginLeft: 100,
    marginRight: 10,
  },
  radioText: {
    fontSize: 16,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#0057FF',
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredModal: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 200,
  },
  progressContainer: {
    height: 14,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 50,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 50,
  },
  materialContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    marginBottom: 80,
  },
  materialTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  materialList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  materialItem: {
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  selectedMaterial: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  totalMarksInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  markModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  markInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    fontSize: 18,
    marginVertical: 15,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  markDisplay: {
    fontSize: wp('3.2%'),
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 4
  },

  // Modal overlay styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles for bulk update mode
  bulkModeBar: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    marginHorizontal: wp('4%'),
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bulkModeText: {
    fontSize: wp('3.5%'),
    color: '#333',
    flex: 1,
  },

  cancelBulkBtn: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },

  cancelBulkText: {
    color: '#fff',
    fontWeight: '500',
  },

  bulkActionBtn: {
    backgroundColor: '#3366FF',
    position: 'absolute',
    bottom: hp('12%'),
    left: wp('6%'),
    right: wp('6%'),
    borderRadius: 30,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  bulkActionText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },

  // Material selection styles
  materialLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },

  materialScroll: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
  },

  materialItemText: {
    color: '#333',
  },

  selectedMaterialText: {
    color: '#2196f3',
    fontWeight: '500',
  },

  // Style for absent students
  absentText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  markInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  markDisplay: {
    fontSize: 14,
    color: '#555',
  },
  percentageDisplay: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  levelMaterialContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  levelHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },


});
