// assess.css
import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    flex: 1,
    position: 'relative',
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
    position: 'relative',
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: hp('0.8%'),
    marginTop: hp('1%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: wp('3%'),
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
    color: 'black',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: wp('3.5%'),
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
  },
  selectedText: {
    fontSize: wp('4%'),
    color: '#000',
  },
  placeholderText: {
    fontSize: wp('4%'),
    color: '#999',
  },
  errorText: {
    fontSize: wp('3.5%'),
    color: '#FF3B30',
    marginTop: -hp('1.5%'),
    marginBottom: hp('1%'),
    marginLeft: wp('1%'),
  },
  errorBox: {
    borderColor: '#FF3B30',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('85%'),
    maxHeight: hp('60%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    color: '#2E5BFF',
  },
  modalList: {
    width: '100%',
    maxHeight: hp('40%'),
  },
  modalItem: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: '100%',
  },
  modalItemText: {
    fontSize: wp('4%'),
    color: '#333',
  },
  closeButton: {
    marginTop: hp('2%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: wp('4%'),
    color: '#333',
    fontWeight: '500',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: hp('3%'),
    left: wp('5%'),
    right: wp('5%'),
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2E5BFF',
    paddingVertical: hp('1.5%'),
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2E5BFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});

export default styles;