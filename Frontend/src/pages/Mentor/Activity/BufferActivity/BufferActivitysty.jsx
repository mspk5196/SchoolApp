import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Header
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginTop: 30,
  },
  activityText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 30,
  },

  // Underline
  underline: {
    borderBottomWidth: 0.9,
    borderBottomColor: 'black',
    width: 500,
    alignSelf: 'center',
    marginBottom: 15,
  },

  //Icons
  activityIcons: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  AddIcon: {
    // position: 'absolute',
    // bottom: 30,
    // right: 20,
    padding: 20,
    backgroundColor: '#0C36FF',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  HomeIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  //Flatlist

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1.5,
    marginHorizontal: 1,
    marginVertical: 1,
    marginBottom: 15,
    // borderWidth:0.5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C300',
    marginRight: 5,
  },
  status: {
    color: '#7991A4',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginTop: 3,
  },
  time: {
    color: '#EB4B42',
    fontSize: 15,
    alignSelf: 'flex-end',
  },
  button: {
    backgroundColor: '#3557FF',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  buttonContainer: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#3557FF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  greenDot: {
    backgroundColor: 'green',
  },
  redDot: {
    backgroundColor: 'red',
  },
  timeLeft: {
    fontSize: 14,
    color: '#EB4B42',
    marginVertical: 5,
    alignSelf: 'flex-end'
  },


});

export default styles;
