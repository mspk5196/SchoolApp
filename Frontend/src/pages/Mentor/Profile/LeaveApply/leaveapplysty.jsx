import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('4%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    marginTop: hp('5%'),
  },
  headerText: {
    color: 'black',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  headerBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd',
    marginBottom: hp('2%'),
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  inputContainer: {
    marginBottom: hp('2.5%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('1%'),
  },
  input: {
    height: hp('6%'),
    borderWidth: 1,
    borderColor: '#ddd',
    color:'black',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#F8F9FA',
    fontSize: wp('3.5%'),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
  },
  halfInputContainer: {
    width: '48%',
  },
  halfInputContainerTime: {
    width: '48%',
  },
  timeInput: {
    height: hp('6%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#F8F9FA',
    fontSize: wp('3.5%'),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optional: {
    fontSize: wp('3%'),
    color: '#6c757d',
    marginLeft: wp('1.5%'),
    marginBottom: hp('0.5%'),
  },
  descriptionInput: {
    height: hp('15%'),
    textAlignVertical: 'top',
    marginBottom: hp('1%'),
  },
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#F8F9FA',
  },
  dropdownContainer: {
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf:'center',
    marginBottom: 20,
    gap:50,
    bottom:0,
    position:'absolute'
  },
  cancelButton: {
    backgroundColor: '#EBEEFF',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('12%'),
    borderRadius: wp('6%'),
    marginTop: hp('7%'),
    marginLeft: wp('5%'),
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('12%'),
    borderRadius: wp('6%'),
    marginTop: hp('7%'),
    marginRight: wp('5%'),
  },
  cancelText: {
    color: '#3557FF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#FFF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: wp('4.5%'),
    textAlign: 'center',
    color: '#333',
  },
  timeValue:{
    textAlign: 'left',
    marginVertical:'auto',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: 'red',
  },
});

export default styles;
