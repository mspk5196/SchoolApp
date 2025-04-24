import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  BackIcon: {
    width: 20,
    height: 20,
  },
  selectedCard: {
    backgroundColor: '#EBEEFF',
  },
  
  scrollWrapper: {
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10, 
  },
  classnavgrade: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  classnavsection:{
    flexDirection: 'row',
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  gradeselection: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginLeft: 10,
    marginTop: 20,
    width: 90,
    borderRadius: 30,
    alignItems: 'center',
  },
  gradeselectiontext: {
    color: 'black',
    fontWeight:'500',
  },
  activeButton: {
    backgroundColor: '#0C36FF',
  },
  activeText: {
    color: 'white',
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
  cardInfo: {
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F8FA',
    marginBottom: 12,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#3366ff',
    borderRadius: 28,
  },
  
  // No Results styling
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
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