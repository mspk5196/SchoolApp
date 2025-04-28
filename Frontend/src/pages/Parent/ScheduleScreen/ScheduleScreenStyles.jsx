import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  headerContainer: {
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
    marginBottom: 15,
  },
  headerText: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  tabContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', // Center the tabs horizontally
    paddingHorizontal: 20,
    marginBottom: 20
  },
  academicContainer: {
    flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingBottom: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,

  },
  tabButton: {
    borderRadius: 25,
  
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginHorizontal: 6, // Equal spacing on both sides
      },
  activeTabButton: {
    backgroundColor: '#4361EE',
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
  examContainer: {
    flex: 1,
    paddingHorizontal:20,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 10, // Reduced from 10
    paddingVertical: 25, // Reduced from 20
    marginBottom: 15, // Reduced from 25
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  calendarHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 5 
  },
  calendarHeaderText: {
    fontSize: 16, 
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
    color: '#4A5E6D'
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
    marginTop: 8
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
  daySelectorScrollView: {
    marginBottom: 15,
  },
  daySelectorContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activeDayButton: {
    backgroundColor: '#FF9F1C',
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
    marginHorizontal:6,
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
    color: '#000000',
    fontWeight: '600',
    fontSize: 16
  },
  academicItemGrade: {
    color: '#000000',
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
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  academicItemTime: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 8,
  },
  academicItemAvatar: {
    width: 36, 
    height: 36, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  // Detail screen styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailHeaderContainer: {
    padding: 20,
    marginBottom: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailDateText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  detailInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailInfoInside: {
    display: 'flex',
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
  },
  levelText: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 14,
  },
  rankContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  rankText: {
    color: '#FF9800',
    fontWeight: '500',
    fontSize: 14,
  },
  assessmentText: {
    fontSize: 14,
    color: '#555',
  },
  scoresContainer: {
    marginBottom: 11,
    marginHorizontal: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreincont: {
    width: '48%',
    flexDirection: 'column',
    justifyContent:'flex-start',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#323F49',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pdfButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfButtonText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default styles;