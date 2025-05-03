import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: 'white',
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  blueBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#1857C0',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  facultyId: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: '#555',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  optionalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
    fontStyle: 'italic',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  // Activity selector
  activitySelector: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    height: 50,
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 6,
    padding: 8,
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 40,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0C36FF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  homeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BDC7F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: {
    fontSize: 24,
    color: '#1857C0',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Activity modal styles
  activityModalContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  activityModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activityModalText: {
    fontSize: 16,
    color: '#333333',
  },
  
  // Time modal styles for iOS
  timeModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    alignItems: 'center',
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  iosTimePicker: {
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1857C0',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default styles;