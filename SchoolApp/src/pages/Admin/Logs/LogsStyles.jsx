import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  assesscontainer:{
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 12,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // Game Card Styles
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gameCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  gameCardSubtitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  activeText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  endsInText: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 4,
  },
  
  // Class Not Started Card Styles
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  classCardSubtitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  notStartedText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  bellTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#333333',
    right:3
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
    justifyContent:'flex-end',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Biology Lab Card Styles
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  idText: {
    fontSize: 12,
    color: '#757575',
  },
  dateText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  labDetails: {
    marginTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 2,
  },
  greenText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Leave Application Card Styles
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  leaveTimeContainer: {
    alignItems: 'flex-end',
  },
  timeWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  appliedByText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 12,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  descriptionBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
    paddingLeft: 8,
    marginTop: 4,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  
  // Assessment Request Card Styles
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  requestedText: {
    color: '#FFA000',
    fontSize: 14,
    fontWeight: '500',
  },
  gradeInfo: {
    marginTop: 12,
    marginLeft: 52,
  },
  classTimeRow: {
    flexDirection: 'column',
    marginTop: 11,
    marginLeft: 72,
    alignItems: 'center',
  },
  timeWithIconAssessment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsText: {
    fontSize: 14,
    color: '#757575',
  },
  levelContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
  },
  levelButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3557FF',
    marginRight: 10,
  },
  levelButtonText: {
    color: '#3557FF',
    fontSize: 14,
  },
  assessmentRequestText: {
    color: '#FFA000',
    fontSize: 14,
    marginBottom: 12,
  },
  
  // Academic Card Styles
  academicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  academicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  subjectText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 4,
  },
  gradeWithAcademic: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#757575',
    marginHorizontal: 8,
  },
  academicText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  incompleteText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
  },
  
  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EBEEFF',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#3557FF',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  rejectButtonText: {
    color: '#3557FF',
    fontWeight: '500',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  // Home Button
  homeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#AEBCFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});


export default styles;