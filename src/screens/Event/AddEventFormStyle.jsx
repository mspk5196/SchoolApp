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
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#111827',
    justifyContent: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#111827',
  },
  timeIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  bannerOptions: {
    marginTop: 8,
  },
  bannerOption: {
    marginBottom: 8,
  },
  bannerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  textLink: {
    color: '#3557FF',
  },
  orText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 8,
  },
  selectedBannerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  selectedBanner: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    height: 48,
    backgroundColor: '#3557FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sampleImageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sampleImageModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  sampleImageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  sampleImageItem: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sampleImage: {
    width: '100%',
    height: 120,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});

export default styles;