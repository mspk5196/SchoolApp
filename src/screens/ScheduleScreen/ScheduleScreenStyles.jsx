import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f8f9fa'  // Slightly lighter background for better contrast
  },
  headerContainer: {
    padding: 20,
    marginBottom: 5
  },
  headerText: {
    fontSize: 28,  // Increased size for more prominence
    fontWeight: 'bold',
    letterSpacing: 0.5  // Slight letter spacing for better readability
  },
  tabContainer: {
    flexDirection: 'row', 
    paddingHorizontal: 20,
    marginBottom: 20  // Increased margin for better spacing
  },
  tabButton: {
    borderRadius: 25,  // More rounded corners
    paddingVertical: 12,  // Slightly taller buttons
    paddingHorizontal: 22,
    marginRight: 12,
    shadowColor: '#000',  // Light shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  activeTabButton: {
    backgroundColor: '#4361EE',  // Slightly more vibrant blue
  },
  inactiveTabButton: {
    backgroundColor: '#ffffff',  // White background for inactive tabs
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15
  },
  inactiveTabText: {
    color: '#555555',
    fontWeight: '500',
    fontSize: 15
  },
  scrollViewContent: {
    flex: 1, 
    paddingHorizontal: 20
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,  // More rounded corners
    padding: 10,
    marginBottom: 25,
    shadowColor: '#000',  // Shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  calendarHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10
  },
  calendarHeaderText: {
    fontSize: 18, 
    fontWeight: '600',
    color: '#333333'
  },
  calendarNavigationContainer: {
    flexDirection: 'row'
  },
  calendarNavButton: {
    padding: 6
  },
  sectionHeaderText: {
    marginBottom: 18, 
    fontSize: 18, 
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#333333'
  },
  examItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4, 
  },
  examDateContainer: {
    width: 60, 
   
    justifyContent: 'center', 
    alignItems: 'center',
    paddingRight: 12
  },
  examDateText: {
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4361EE'
  },
  examMonthText: {
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#4361EE',
    marginTop: 2
  },
  examInfoContainer: {
    flex: 1, 
    paddingLeft: 12
  },
  examInfoRow: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  examInfoRowMargin: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8  // Increased for better spacing
  },
  examInfoIcon: {
    width: 18, 
    height: 18, 
    marginRight: 8,
  },
  examInfoText: {
    fontWeight: '600',
    fontSize: 16
  },
  daySelectorContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 18,  // Increased for better spacing
    marginHorizontal: 10
  },
  dayButton: {
    width: 36,  // Slightly larger buttons
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeDayButton: {
    backgroundColor: '#FF9F1C',  // Slightly adjusted orange
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  inactiveDayButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  activeDayText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 15
  },
  inactiveDayText: {
    fontWeight: '500',
    color: '#555555',
    fontSize: 15
  },
  academicItemContainer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1
  },
  academicItemInfoContainer: {
    flex: 1
  },
  academicItemSubject: {
    fontWeight: '600',
    fontSize: 16
  },
  academicItemGrade: {
    marginTop: 4,
    fontSize: 14,
    color: '#555555'
  },
  academicItemType: {
    marginTop: 4, 
    color: '#FF8C00',
    fontSize: 13,
    fontWeight: '500'
  },
  academicItemTimeContainer: {
    flexDirection: 'column', 
    alignItems: 'center'
  },
  academicItemTime: {
    marginRight: 12,
    fontWeight: '500',
    margin:10,
    fontSize: 14
  },
  academicItemAvatar: {
    width: 36, 
    height: 36, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  }
});

export default styles;