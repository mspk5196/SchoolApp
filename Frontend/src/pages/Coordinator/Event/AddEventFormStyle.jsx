import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    formContainer: {
      paddingVertical: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
      color: '#111827',
    },
    input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: '#111827',
      backgroundColor: '#FFFFFF',
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      overflow: 'hidden',
    },
    dateInput: {
      flex: 1,
      padding: 12,
      fontSize: 14,
      color: '#111827',
    },
    calendarButton: {
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderLeftWidth: 1,
      borderLeftColor: '#E5E7EB',
    },
    calendarIcon: {
      fontSize: 18,
      color: '#6B7280',
    },
    dropdownInput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#FFFFFF',
    },
    inputText: {
      fontSize: 14,
      color: '#111827',
    },
    placeholderText: {
      fontSize: 14,
      color: '#9CA3AF',
    },
    dropdownIcon: {
      fontSize: 14,
      color: '#6B7280',
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
      color: 'black',
      padding: 12,
    },
    bannerContainer: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#FFFFFF',
    },
    bannerText: {
      fontSize: 14,
      color: '#111827',
      textAlign: 'center',
    },
    linkText: {
      color: '#3557FF',
    },
    orText: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      marginVertical: 8,
    },
    buttonContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    enrollButton: {
      backgroundColor: '#3557FF',
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    enrollButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      maxHeight: '60%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 16,
      textAlign: 'center',
    },
    optionItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    optionText: {
      fontSize: 16,
      color: '#111827',
    },
    closeButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#111827',
    },
    // New styles for banner image
    selectedBannerContainer: {
      position: 'relative',
      height: 160,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 8,
    },
    selectedBannerImage: {
      width: '100%',
      height: '100%',
    },
    removeBannerButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeBannerButtonText: {
      fontSize: 20,
      color: '#111827',
      lineHeight: 20,
    },
    sampleImageModalContent: {
      maxHeight: '70%',
    },
    sampleImageItem: {
      flex: 1,
      margin: 4,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    sampleImage: {
      width: '100%',
      height: '100%',
    }
});

export default styles;