import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
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
  dropdown: {
    borderColor: '#D9D9D9',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: hp('5%'), // ⬅️ Uniform dropdown height
    zIndex: 1000,
  },
  dropdownContainer: {
    borderColor: '#D9D9D9',
    borderRadius: 15,
    zIndex: 1000,
    marginTop: 5,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: hp('85%'),
    top: hp('25%'),
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
});

export default styles;
