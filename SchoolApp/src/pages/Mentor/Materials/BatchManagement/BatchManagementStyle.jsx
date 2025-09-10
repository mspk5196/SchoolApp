import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  subjectInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  sectionInfo: {
    fontSize: 14,
    color: '#666',
  },

  selectorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  content: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  analyticsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },

  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },

  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  batchContainer: {
    padding: 16,
    paddingTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  batchTitle: {
    flex: 1,
  },

  batchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  batchStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  batchLevel: {
    fontSize: 14,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  batchStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },

  batchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewDetailsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },

  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },

  modalCloseButton: {
    marginRight: 16,
    padding: 8,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },

  modalContent: {
    flex: 1,
  },

  batchDetailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  detailsItem: {
    width: '48%',
    marginBottom: 16,
  },

  detailsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  detailsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  studentsSection: {
    margin: 16,
    marginTop: 0,
  },

  studentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  studentRoll: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  assignedDate: {
    fontSize: 12,
    color: '#999',
  },

  studentStats: {
    alignItems: 'flex-end',
  },

  performanceContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  performanceLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },

  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  performanceChange: {
    fontSize: 12,
    fontWeight: '600',
  },

  progressContainer: {
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },

  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
});

export default styles;
