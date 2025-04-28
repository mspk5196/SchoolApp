import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 1,
  },
  page: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 30,
    height: 30,
    marginLeft: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A5E6D',
    marginRight: 2.5,
    marginTop: 55,
  },
  profile: {
    width: 28,
    height: 28,
    marginTop: 62,
    marginLeft: 90,
  },
  logout: {
    width: 28,
    height: 28,
    marginLeft: 10,
    marginTop: 62,
    marginRight: 45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginLeft: 40,
  },

  //switch
  switch: {
    marginLeft: 185,
    width: 48,
    height: 26.67,
  },

  //menus

  menus: {
    padding: 0.5,
    flexDirection: 'row',
    marginLeft: 13,
  },
  mainpage: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  card1: {
    width: 130,
    height: 130,
    borderColor: '#EBEEFF',
    borderWidth: 0.1,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EBEEFF',
    marginLeft: 30,
    marginTop: 20,
  },
  menutitle: {
    color: 'black',
    marginTop: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menutitle1: {
    color: 'black',
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icons: {
    width: 70,
    height: 70,
    marginTop: 30,
  },
  icons1: {
    width: 70,
    height: 70,
    marginTop: 20,
  },
});

export default styles;
