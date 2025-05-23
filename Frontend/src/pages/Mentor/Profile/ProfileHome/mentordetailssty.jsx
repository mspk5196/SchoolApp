import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
    marginTop: hp('5.2%'),
    marginLeft: wp('2.5%'),
  },
  headerText: {
    color: 'black',
    fontSize: wp('5.2%'),
    fontWeight: 'bold',
    marginLeft: wp('1.2%'),
    marginBottom: hp('0.3%'),
  },
  headerBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd',
    marginHorizontal: wp('1.5%'),
    marginBottom: hp('1.2%'),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: wp('3.5%'),
    shadowColor: '#000',
    width: wp('90%'),
    marginLeft: wp('4%'),
  },
  profileContainer: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('8%'),
  },
  details: {
    marginLeft: wp('4%'),
    flex: 1,
  },
  name: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: wp('3.8%'),
    color: '#777',
    marginTop: hp('0.4%'),
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.2%'),
  },
  grade: {
    fontSize: wp('3.8%'),
    color: '#555',
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: wp('1.5%'),
    borderRadius: wp('3.5%'),
    marginTop: hp('2.5%'),
    alignItems: 'center',
    width: wp('90%'),
    marginLeft: wp('4%'),
  },
  attendanceTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: 'black',
    marginRight: wp('62%'),
  },
  percentValue: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#007bff',
    alignSelf: 'flex-start',
    marginLeft: wp('6.5%'),
    marginTop: hp('2.5%'),
  },
  attendanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: hp('2.5%'),
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    minWidth: wp('25%'),
    justifyContent: 'flex-start',
  },
  attendanceIcon: {
    width: wp('9%'),
    height: wp('9%'),
    marginRight: wp('1%'),
  },
  attendanceTextContainer: {
    flexDirection: 'column',
    marginLeft: wp('2.9%'),
  },
  attendanceText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#555',
  },
  attendanceNumber: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'black',
    marginTop: hp('0.3%'),
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('3.5%'),
    marginTop: hp('2.5%'),
    width: wp('90%'),
    marginLeft: wp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: wp('3.8%'),
    color: '#555',
    marginBottom: hp('0.6%'),
    textAlign: 'left',
  },
  bold: {
    fontWeight: 'bold',
    color: 'black',
  },
  leaveButton: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('3.5%'),
    marginTop: hp('2.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('40%'),
    height: hp('12%'),
    marginLeft: wp('4%'),
    shadowColor: '#000',
  },
  leaveButtonText: {
    color: 'black',
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
  },
  homeButton: {
    position: 'absolute',
    marginTop: hp('90%'),
    left: wp('88%'),
    transform: [{ translateX: -wp('9%') }],
    backgroundColor: '#AEBCFF',
    borderRadius: wp('17%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
  },
});

export default styles;
