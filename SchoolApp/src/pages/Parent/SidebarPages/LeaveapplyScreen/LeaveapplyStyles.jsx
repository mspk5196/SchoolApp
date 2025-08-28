import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderColor: '#00000080',
  },
  headerTitle: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formContent: {
    padding: 17,
    borderRadius: 10,
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#999',
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    height: 45,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color:'black',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,

  },
  dropdownButton: {
    height: 48,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#555555',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
  timeContainer: {
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#555555',
    marginRight: 4,
   
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  inputGroupTime:{
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#F7F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#EFF3FE',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4080FF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#4080FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default styles;