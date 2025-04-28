import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
    marginBottom: 15,
  },
  headerText: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    width: '100%',
  },
  accentBar: {
    width: 5,
    backgroundColor: '#4169e1', // Royal blue accent color as seen in image
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  facultyId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  subject: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginHorizontal: 10,
  },
  notification: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5252',
  },
  listContainer:{
    padding: 10,
  },
  tabBarPadding: {
    height: 75, // Match your tab bar height
    backgroundColor: 'white', // Match your tab bar color
  },
});
export default styles;