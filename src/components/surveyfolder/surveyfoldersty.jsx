import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('3%'),
    backgroundColor: '#f4f4f4',
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
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('0.5%'),
    marginTop: hp('2%'),
  },
  input: {
    height: hp('6%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#F8F9FA',
    fontSize: wp('3.5%'),
    marginBottom: hp('1.2%'),
  },
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#F8F9FA',
  },
  dropdownContainer: {
    borderColor: '#ddd',
    marginTop: hp('1%'),
    borderRadius: wp('5%'),
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: wp('7%'),
    right: wp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('93%'),
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: hp('1.6%'),
    borderRadius: wp('6%'),
    flex: 1,
    marginRight: wp('2.5%'),
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: "#AEBCFF",
    padding: wp('2.7%'),
    borderRadius: 50,
  },
  descriptionInput: {
    height: hp('12.5%'),
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#F8F9FA',
    fontSize: wp('3.5%'),
  },

  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: hp('85%'), 
    top:hp('25%'),
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
