import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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
  container: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
  },
  dateGroup: {
    marginBottom: hp('3%'),
  },
  dateText: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    marginBottom: hp('1%'),
    color:'black',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: wp('4%'),
    elevation: 3,
    width: '100%',
  },
  gradeBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('0.5%'),
  },
  circleLine: {
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#2F5DF3',
    backgroundColor: '#fff',
    zIndex: 1,
  },

  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#2F5DF3',
    marginTop: hp('1%'),
  },
  gradeText: {
    fontSize: wp('4.1%'),
    fontWeight: '600',
    marginBottom: hp('0.5%'),
    color:'#323F49',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.8%'),
    gap: wp('3%'),
    flexWrap: 'wrap',
  },
  subjectText: {
    fontSize: wp('4%'),
    flex: 1,
    flexBasis: 'auto',
    color:'#323F49'
  },
  statusText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
  },
  greenStatus: {
    color: 'green',
  },
  blueStatus: {
    color: 'blue',
  },
  homeButton: {
    position: 'absolute',
    bottom: hp('1%'),
    right: wp('5%'),
    backgroundColor: '#2F5DF3',
    padding: wp('3.5%'),
    borderRadius: 50,
  },
});

export default styles;
