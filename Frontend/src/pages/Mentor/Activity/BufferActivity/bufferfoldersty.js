import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 10,
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  // New selection field styles (replacing dropdown)
  selectionField: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  disabledField: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  placeholderText: {
    color: '#999',
  },
  selectedText: {
    color: '#333',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  optionList: {
    maxHeight: 350,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  timeCard: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeField: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timeTextfrom: {
    color: '#333',
    fontWeight: '500',
  },
  timeTextto: {
    color: '#333',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  homeButton: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default styles;
