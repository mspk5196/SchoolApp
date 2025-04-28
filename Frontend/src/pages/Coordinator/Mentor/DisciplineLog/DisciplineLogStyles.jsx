import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  SubNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
  },
  cardContent: {
    padding: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardReason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  regBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registeredBy: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  phoneIcon: {
    marginHorizontal: 8,
  },
  messageIcon: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#3366ff',
    borderRadius: 28,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#3366ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Confirmation modal styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
  },
  confirmModalContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  confirmAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
  },
  confirmReasonContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  confirmReasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmReasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#3366ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;