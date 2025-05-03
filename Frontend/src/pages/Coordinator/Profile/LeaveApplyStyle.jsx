import {StyleSheet} from 'react-native';

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
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    // height:650,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
    fontWeight: '500',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    fontSize: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInputContainer: {
    width: '48%',
  },
  halfInputContainerTime: {
    width: '48%',
  },
  timeInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    color: '#000',
    fontWeight: '500',
    fontSize: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optional: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 6,
    marginBottom: 4,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf:'center',
    marginBottom: 20,
    gap:50,
    bottom:0,
    position:'absolute'
  },
  cancelButton: {
    backgroundColor: '#EBEEFF',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
    // marginTop: 56,
    // marginLeft: 50,
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
    // marginTop: 56,
    // marginRight: 50,
  },
  cancelText: {
    color: '#1E40FF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New dropdown styles
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownField: {
    position: 'relative',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: 'red',
  },
});

export default styles;