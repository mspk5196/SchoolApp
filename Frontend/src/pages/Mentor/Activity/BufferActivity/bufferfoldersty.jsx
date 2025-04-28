import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    marginTop: hp('5%'),
  },
  headerText: {
    color: 'black',
    fontSize: wp('5.2%'),
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
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: hp('1%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#F7F8FA',
    borderWidth: 0,
    borderRadius: 10,
  },
  dropdownContainer: {
    backgroundColor: '#F7F8FA',
    borderWidth: 0,
    marginTop: hp('1%'),
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  timeTextfrom: {
    fontSize: wp('4%'),
    color: '#6c757d',
    marginLeft: wp('2.5%'),
  },
  timeTextto: {
    fontSize: wp('4%'),
    color: '#6c757d',
    marginRight: wp('25%'),
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: hp('1.5%'),
    borderRadius: 25,
    marginTop: hp('13%'),
    marginRight: wp('6%'),
    marginLeft: wp('2%'),
    width: wp('72%'),
  },
  confirmText: {
    color: '#FFF',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    top:hp('12.8%'),
    right: wp('3%'),
    backgroundColor: '#AEBCFF',
    padding: wp('4%'),
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    width: wp('13%'),
    height: wp('13%'),
  },
});


export default styles;
