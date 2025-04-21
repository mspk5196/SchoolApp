import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f8f8',
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
    conceptCard: {
      backgroundColor: '#fff',
      padding: 16,
      margin: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    monthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    monthText: {
      fontSize: 12,
      color: '#666',
      marginLeft: 4,
    },
    cardRight: {
      alignItems: 'flex-end',
    },
    difficultyBadge: {
      backgroundColor: '#e8f7e8',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
    },
    difficultyText: {
      color: '#5cb85c',
      fontSize: 12,
      fontWeight: '500',
    },
    endsInText: {
      fontSize: 12,
      fontWeight: '500',
    },
    progressSection: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
      marginBottom: 18,
    },
    progressList: {
      flex: 1,
    },
    progressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    gradeLabel: {
      width: 40,
      fontSize: 14,
      fontWeight: '500',
      color: '#000',
    },
    progressBarContainer: {
      flex: 1,
      height: 30,
      borderBottomEndRadius: 7,
      borderTopEndRadius: 7,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#f9a825',
      borderBottomEndRadius: 7,
      borderTopEndRadius: 7,
    },
    highlightedProgressBar: {
      backgroundColor: '#3366ff',
    },
    progressCount: {
      width: 40,
      fontSize: 14,
      color: '#666',
      textAlign: 'right',
    },
  });

export default styles;