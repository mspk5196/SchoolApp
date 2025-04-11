import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
  },

  // Profile Section
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  userPhone: {
    color: 'gray',
    fontSize: 14,
  },

  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  attendanceLabel: {
    fontSize: 14,
    marginRight: 8,
  },

  attendancePercentage: {
    fontSize: 14,
    marginLeft: 8,
    color: '#27ae60',
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  hourlyAttendance: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 4,
    fontWeight: 'bold',
  },

  // Survey Section
  surveyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    alignItems: 'center',
  },

  surveyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },

  surveyInfo: {
    flex: 1,
  },

  surveyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  surveyFeedback: {
    color: 'gray',
    fontSize: 14,
  },

  startButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },

  // Performance Graph Tabs
  performanceGraphTabs: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },

  performanceTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },

  activePerformanceTab: {
    backgroundColor: '#007bff',
  },

  performanceTabText: {
    fontSize: 12,
    color: 'gray',
  },

  activePerformanceTabText: {
    color: 'white',
  },

  // Graph Section
  barContainer: {
    width: 60,
    height: 160,
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'flex-end',
  },

  bar: {
    width: 30,
    borderRadius: 6,
    marginBottom: 4,
  },

  barLabel: {
    fontSize: 12,
    color: '#333',
  },

  // Homework Section
  homeworkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    padding: 16,
  },

  homeworkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  level: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: 'bold',
  },

  homeworkCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    color: '#3498db',
    fontSize: 14,
  },

  homeworkDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  durationText: {
    marginRight: 12,
    color: 'gray',
    fontSize: 14,
  },

  viewButtonContainer: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  viewButton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default styles;