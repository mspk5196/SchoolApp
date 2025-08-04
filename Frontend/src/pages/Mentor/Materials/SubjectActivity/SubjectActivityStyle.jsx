import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  activityCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
