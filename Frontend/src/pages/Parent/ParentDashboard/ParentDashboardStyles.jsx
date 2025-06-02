import { StyleSheet, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  // Common Styles
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionContainer: {
    marginVertical: 16,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },

  // Profile Section
  profileCard: {
    marginTop: 18,
    backgroundColor: '#EBEEFF',
    borderRadius: 12,
    paddingBottom: 16,
  },

  profileDetails: {
    flexDirection: 'row',
    paddingBottom: 4,
    // padding: 16,
    paddingLeft: 78,
    alignItems: 'center',
    position: 'relative',
  },

  profileImageWrapper: {
    position: 'absolute',
    left: 16,
    top: -23, // Negative value to position the image overlapping the border
    zIndex: 2, // Ensures the image appears above the card
  },

  profileImage: {
    width: 68,
    height: 67,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#F0F5FF',
  },

  profileInfo: {
    flex: 1,
    /* marginTop: -2, */
  },

  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    marginLeft: 12,
    color: '#333',
  },

  userroll: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 18,
  },
  //attendanceContainer

  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingLeft: 16,
  },

  attendanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceRow: {
    flexDirection: 'column',
  },

  attendanceLabel: {
    fontSize: 14,
    marginRight: 8,
    color: 'black',
    marginBottom: 4,
  },

  attendancePercentage: {
    fontSize: 14,
    marginLeft: 13,
    color: '#27ae60',
    fontWeight: 'bold',
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },


  attendanceCircleText: {
    color: '#3557FF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Survey Section
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    flexDirection: 'column',
    width: windowWidth - 32,
    marginBottom: 8,
  },
  surveyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  surveyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  feedbackLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },


  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  timeIcon: {
    color: 'white',
    fontSize: 10,
  },
  timeText: {
    color: '#3557FF',
    fontSize: 14,
    fontWeight: '500',
  },
  startNowButton: {
    backgroundColor: '#3557FF',
    paddingVertical: 8,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  startNowText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#3557FF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Homework Section
  homeworkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeworkCardCol1: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelBadge: {
    backgroundColor: '#E6F9E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  levelText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: 'bold',
  },
  homeworkCardCol2: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#E55048',
    fontSize: 14,
    fontWeight: '500',
    marginVertical:'auto'
  },
  homeworkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeworkDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  durationIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  durationIcon: {
    color: '#666',
    fontSize: 10,
  },
  durationText: {
    color: '#666',
    fontSize: 14,
  },
  viewButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButton: {
    color: '#3557FF',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  homeworkCardCol3: {

    marginTop: 4,
  },

  // Performance Details Screen
  detailsContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  detailsScrollView: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 16,

  },
  performanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  performanceDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#323F49',
    marginBottom: 4,
  },
  performanceBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    color: '#F7A325',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  ClassTypeText: {
    color: '#6750A4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  performanceStats: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },

  assessmentDetails: {
    marginBottom: 12,
  },
  MaterialLink: {
    color: '#3557FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  assessmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assessmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  assessmentLabel: {
    fontSize: 14,
    color: '#555',
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C36FF',
  },
  assessmentTotal: {
    fontWeight: 'normal',
    color: '#666',
  },


});

export default styles;