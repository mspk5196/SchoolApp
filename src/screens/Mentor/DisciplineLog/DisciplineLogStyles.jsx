import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
  },
  headerTxt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 10,
  },
  BackIcon: {
    width: 19,
    height: 17,
  },
  searchIcon:{
    position: 'absolute',
    left: 29,
    zIndex: 1,
    top: '76%',
    transform: [{ translateY: -10 }],
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#EEEFF9',
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
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
    fontWeight: '500',
  },
  cardContent: {
    padding: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
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
    color: '#000',
    fontWeight: '600',
    flex: 1,
    paddingLeft: 8,
  },
  actionButtonCall: {
    backgroundColor: '#AEBCFF', 
    borderRadius: 999,
    padding: 10,
    marginLeft: 'auto',
    marginRight: 10,
  },
  actionButtonMsg: {
    backgroundColor: '#A4F4E7', 
    borderRadius: 999,
    padding: 10,
  },
  AddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    padding: 20,
    backgroundColor: '#0C36FF',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  AddIcon: {
    width: 20,
    height: 20,
  },
  
  // No results styles
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    color: '#333',
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
    backgroundColor: '#0C36FF',
    borderRadius: 30,
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
    color: '#333',
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardReasonContainer:{
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F8FA',
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  confirmReasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#0C36FF',
    borderRadius: 30,
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