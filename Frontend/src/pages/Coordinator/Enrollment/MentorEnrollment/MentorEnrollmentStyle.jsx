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
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  backButton: {
    paddingRight: 10,
    marginBottom: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 35,
    color: '#999',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePickerButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4285F4',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  inputIcon: {
    marginLeft: 10,
  },
  
  // New dropdown styles to match WeeklySchedule
  selectionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  selectionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  
  // Modal styles to match WeeklySchedule
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listModalContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    maxHeight: '60%',
  },
  listModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  listModalItemText: {
    fontSize: 14,
    color: '#333333',
  },
  
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    borderRadius: 6,
    padding: 16,
    marginVertical: 20,
  },
  uploadButtonText: {
    color: '#1857C0',
    marginLeft: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1857C0',
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3557FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3557FF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  uploadedDocsContainer: {
    marginBottom: 20,
  },
  uploadedDocsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  documentDeleteButton: {
    padding: 8,
  },
});

export default styles;