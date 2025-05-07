import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  scrollView: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 15,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
});

export default styles;