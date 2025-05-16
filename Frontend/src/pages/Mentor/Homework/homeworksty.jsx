// assess.css
import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    flex:1
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
    padding: wp('3%'),
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
    color:'black'
  },
  dropdown: {
    borderColor: '#D9D9D9',
    borderRadius: 8,
    backgroundColor: '#fff',
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
    bottom: hp('3%'),
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
    // top: hp('3.5%'),
  },
  confirmText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});

export default styles;
