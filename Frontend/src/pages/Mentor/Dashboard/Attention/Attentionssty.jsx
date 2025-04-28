import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default StyleSheet.create({
  container: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('4%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: wp('6%'),
    fontWeight: '600',
    marginLeft: wp('3%'),
    color: '#000',
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#CFCFCF',
    marginVertical: hp('2%'),
  },
  cardSection: {
    gap: hp('2.5%'),
    paddingBottom: hp('5%'),
  },
  card: {
    borderRadius: wp('3%'),
    padding: wp('4%'),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardPeach: {
    backgroundColor: '#FFF2E3',
  },
  cardPink: {
    backgroundColor: '#FFE5E5',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000000',
  },
  id: {
    fontSize: wp('3.5%'),
    color: '#555555',
    marginTop: hp('0.3%'),
  },
  assessment: {
    fontSize: wp('3.8%'),
    color: '#F34444',
    marginTop: hp('0.6%'),
    fontWeight: '500',
  },
  subjectBox: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  subject: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
  },
  daysOrange: {
    color: '#F58C1C',
    fontSize: wp('3.5%'),
    marginTop: hp('1%'),
  },
  daysRed: {
    color: '#FF0000',
    fontSize: wp('3.5%'),
    marginTop: hp('1%'),
  },
  subHeading: {
    fontSize: wp('4%'),
    color: '#8C8C8C',
    top: hp('1%'),
    marginTop: hp('2%'),
    fontWeight: '500',
  },
  acceptButton: {
    marginTop: hp('2%'),
    top: hp('2%'),
    width: '100%',
    backgroundColor: '#3455FF',
    paddingVertical: hp('1.3%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  acceptedDateText: {
    fontSize: wp('3.5%'),
    color: '#000',
    marginTop: hp('1.5%'),
    top: hp('1.5%'),
    marginLeft: wp('1%'),
  },

  // Optional if you want avatar in the future:
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
  },
});
