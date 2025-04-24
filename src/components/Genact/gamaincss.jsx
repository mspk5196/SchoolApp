import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('1.5%'),
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
});

export default styles;
