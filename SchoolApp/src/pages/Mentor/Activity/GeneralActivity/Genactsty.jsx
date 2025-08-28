import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('5%'),
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    marginTop: hp('5%'),
  },
  headerText: {
    color: '#000',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: hp('2%'),
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: wp('5%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  formGroup: {
    marginBottom: hp('2.2%'),
    width: '100%',
  },
  label: {
    fontSize: wp('3.8%'),
    color: '#111827',
    fontWeight: '600',
    marginBottom: hp('0.8%'),
  },
  input: {
    height: hp('5.6%'),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: wp('4%'),
    backgroundColor: '#F8FAFC',
    fontSize: wp('3.8%'),
    color: '#111827',
  },
  dropdown: {
    height: hp('5.6%'),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: wp('4%'),
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: hp('1%'),
    borderRadius: 12,
    paddingVertical: hp('1%'),
  },
  bottomActionRow: {
    position: 'absolute',
    bottom: hp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    width: '100%',
  },
  
  
  otpButton: {
    backgroundColor: '#2563eb',
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('15%'),
    borderRadius: 30,
    left:wp('3%')
  },
  
  otpButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: "#AEBCFF",
    padding: wp('2.0%'),
    borderRadius: 40,
    left:wp('7%')
  }
  
  
});

export default styles;
