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
    scrollContainer: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: 'white',
      padding: 16,
      margin: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateText: {
      fontSize: 14,
      color: '#666',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#000000',
    },
    statusText: {
      fontSize: 14,
      color: '#F39C12',
      fontWeight: '500',
    },
    uploadSection: {
      paddingHorizontal: 16,
      paddingBottom: 100, // Extra space at the bottom for the button
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
      marginVertical: 12,
    },
    uploadBox: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ddd',
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    dropArea: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    dropText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
    },
    chooseFileBtnText: {
      fontSize: 14,
      color: '#204FDC',
      textAlign: 'center',
      marginHorizontal: 4,
    },
    hereText:{
        fontSize: 14,
        color: '#3557FF',
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fileName: {
      marginLeft: 8,
      fontSize: 14,
      color: '#333',
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 24,
      left: 16,
      right: 16,
    },
    removeFileBtnText:{
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    submitButton: {
      backgroundColor: '#3557FF',
      borderRadius: 24,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
      marginRight: 8,
    },
  });
  
export default styles;  