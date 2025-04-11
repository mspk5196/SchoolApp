import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 42,
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#00000080',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    
  },
  headerTitle: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  addButton: {
    padding: 5,
  },
  leaveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  listContainer: {
    padding: 10,
  },
  leaveCard: {
    backgroundColor: '#FAFAFA',
    marginBottom: 15,
    padding: 6,
    paddingBottom: 5,
    overflow: 'hidden',
  },
  leaveContainer: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#7C7C7C26',
    shadowOffset: { width: 0, height: 2 },
  },
  dateHeader: {
    padding: 12,
    backgroundColor: '#fafafa',
    color: '#323F49',
    fontSize: 14,
    fontWeight: '500',
  },
  userInfoContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 0,
    alignItems: 'center',  
    borderBottomColor: '#F0F0F0',
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 20,
  },
  userTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  userRegno: {
    fontSize: 12,
    color: '#878787',
    fontWeight: '500',
    marginTop: 2,
  },
  statusActions: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
    marginLeft: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFEEEE',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 12,
    paddingBottom: 0,
    borderBottomColor: '#F0F0F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginLeft: 8,
  },
  reasonContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 12,
    flexDirection: 'row',
    marginVertical: 10,
  },
  accentBar: {
    width: 5,
    backgroundColor: '#4169e1',
  },
  contentContainer: {
    padding: 7,
    flex: 1,
  },
  reasonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    lineHeight: 17,
   
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4080FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
});

export default styles;