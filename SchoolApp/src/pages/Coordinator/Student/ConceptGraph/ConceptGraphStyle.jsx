import { StyleSheet } from 'react-native';


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
    gradeSelector: {
        flexGrow: 0,
      backgroundColor: '#fff',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    gradeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: '#f0f0f0',
    },
    selectedGradeButton: {
      backgroundColor: '#3366ff',
    },
    gradeText: {
      color: '#666',
      fontWeight: '500',
    },
    selectedGradeText: {
      color: '#fff',
    },
    subjectSelector: {
        flexGrow: 0,
      backgroundColor: '#fff',
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    subjectButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: '#f0f0f0',
    },
    selectedSubjectButton: {
      backgroundColor: '#3366ff',
    },
    subjectText: {
      color: '#666',
      fontWeight: '500',
    },
    selectedSubjectText: {
      color: '#fff',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 24,
      margin: 16,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: '#333',
    },
    cardsContainer: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardContent: {
      flex: 1,
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
    moreButton: {
      padding: 4,
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#3366ff',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
export default styles;  