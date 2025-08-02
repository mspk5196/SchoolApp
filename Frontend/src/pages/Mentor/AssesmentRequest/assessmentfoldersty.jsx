import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  heightPercentageToDP,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('4%'),
  },
  headerText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    marginLeft: wp('2%'),
    color: '#333',
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    bottom: hp('3%'),
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: wp('4%'),
    color: '#000',
    marginBottom: hp('0.5%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'), // ⬅️ Reduced vertical padding
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
    color: 'black',
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  selectorText: {
    fontSize: wp('4%'),
    color: '#333',
  },
  placeholderText: {
    fontSize: wp('4%'),
    color: '#999',
  },
  selectorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: wp('4%'),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: wp('85%'),
    // Fixed height issues with proper constraints
    paddingBottom: wp('18%'),
    maxHeight: hp('70%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', // This prevents content from spilling outside
  },
  // modalInnerContent: {
  //   paddingVertical: hp('1%'),
  //   paddingHorizontal: wp('4%'),
  //   flexGrow: 1,
  // },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // No margin to avoid spacing issues
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: wp('5%'),
    color: '#007BFF',
    fontWeight: '600',
  },
  optionItem: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: wp('4.2%'),
    color: '#333',
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007BFF',
  },
  selectedText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  fixedButtonContainer: {
    position: 'absolute',
    top: hp('90%'),
    left: wp('5%'),
    right: wp('5%'),
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2E5BFF',
    paddingVertical: hp('1.2%'),
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
    top: hp('2.0%'),
  },
  confirmText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: wp('90%'),
    maxHeight: hp('80%'),
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    fontSize: wp('4%'),
    color: '#2E5BFF',
    marginTop: hp('1%'),
  },
  studentName: {
    fontSize: wp('4.2%'),
    color: '#000',
  },
  studentLevel: {
    fontSize: wp('3.8%'),
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    fontSize: wp('4.5%'),
  },
  allotButton: {
    backgroundColor: '#2E5BFF',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 18,
  },
  allotButtonText: {
    color: 'white',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  emptyListContainer: {
    padding: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;
