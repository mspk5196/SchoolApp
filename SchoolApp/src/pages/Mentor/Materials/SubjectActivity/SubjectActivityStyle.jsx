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
    width: 17,
    height: 17,
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  gridItem: {
    width: '48%', // Two columns with some spacing
    marginRight: 0, // Remove the horizontal margin since we're using flexWrap
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

  // Quick Access Styles
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  quickAccessButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topicHierarchyButton: {
    backgroundColor: '#4CAF50',
  },

  batchManagementButton: {
    backgroundColor: '#FF9800',
  },

  quickAccessButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default styles;
