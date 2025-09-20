import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 10,
    gap: 16,
    marginBottom: 140,
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

  // Card base styles
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },

  sectionTabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    flex: 1,
    height: 65,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
    width: 110, 
    elevation: 1,
  },
  noScheduleText: {
    color: 'grey',
    alignSelf: 'center'
  },
  activeSectionTab: {
    backgroundColor: '#0C36FF',
  },
  sectionTabText: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#333333',
  },
  activeSectionTabText: {
    color: '#FFFFFF',
    paddingLeft: 5, // Added from Academic Schedule
  },
  // Alert card details
  alertCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000'
  },
  teacherId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  subjectText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  subjectLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444', // text-red-500
    marginTop: 4,
  },
  alertActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  timeDisplay: {
    fontSize: 12,
    color: '#EF4444', // text-red-500
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  // timeIcon: {
  //   width: 12,
  //   height: 12,
  //   marginRight: 4,
  //   tintColor: '#EF4444',
  // },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginLeft: 4,
  },

  actionButtons1: {
    flexDirection: 'row',
    gap: 10,
  },
  // Button styles
  actionButtons2: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButtonCall: {
    backgroundColor: '#AEBCFF',
    borderRadius: 999,
    padding: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonMsg: {
    backgroundColor: '#A4F4E7',
    borderRadius: 999,
    padding: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIcon: {
    width: 16,
    height: 16,
    tintColor: '#3B82F6', // text-blue-500
  },
  assignTaskButton: {
    backgroundColor: '#0C36FF',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '90%',
    // height:40,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 16,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#EBEEFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 16,
    borderRadius: 30,
    flex: 1,
    fontWeight: '500',

  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3557FF',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#3557FF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30,
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Student/Mentor card
  studentCardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flexDirection: 'row',
  },
  avatar: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000'
  },
  studentId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000', // text-gray-500
  },
  assessmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000', // text-gray-700
    marginTop: 4,
  },
  subjectInfo: {
    alignItems: 'flex-end',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  daysRemaining: {
    fontSize: 12,
    color: '#F97316', // text-orange-500
  },
  mentorSection: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-between'
  },
  mentorDetails: {
    flexDirection: 'column',
  },
  mentorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  mentorId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },

  // Request card
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestBadgeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EEAA16',
  },
  assessmentRequestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EEAA16',
    marginTop: 16,
    marginBottom: 16,
  },
  teacherInfo: {
    flexDirection: 'row',
  },
  requestBadge: {
    fontSize: 12,
    color: '#FBBF24', // text-yellow-500
    fontWeight: '500',
  },
  classDetails: {
    marginTop: 16,
  },
  className: {
    fontWeight: '500',
    color: '#000',
  },
  classSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000', // text-gray-700
  },
  timeAndStudents: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: '500',
    color: '#000', // text-gray-600
    marginTop: 4,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconSmall: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  studentCount: {
    color: '#000', // text-gray-600
    fontSize: 14,
    fontWeight: '500',
  },

  levelTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  levelTag: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    color: '#000', // text-gray-800
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: '700',
  },
  levelTagText: {
    color: '#3557FF',
    fontWeight: '500',
  },

  // Past assessment
  pastCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  pastCardContent: {
    marginTop: 8,
  },
  gradeText: {
    fontWeight: '500',
    color: '#000',
  },
  issueContent: {
    marginTop: 6,
    marginBottom: 5,
  },
  issueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E23F36',
  },
  issueTaskButton: {
    backgroundColor: '#0C36FF',
    borderRadius: 28,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    // borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No Data Component Styles
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  noDataIconContainer: {
    marginBottom: 24,
  },
  noDataIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  noDataMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  //Grades section styles

  // Students section styles
  batchText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginTop: 2,
  },
  sessionTypeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2,
  },
  studentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
    paddingTop: 12,
  },
  studentsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  studentsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  studentsList: {
    marginTop: 8,
    paddingLeft: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginBottom: 4,
  },
  studentRoll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 60,
  },
  studentName: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },

  // Failed Assessment Student Card Styles
  failedStudentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    paddingBottom: 10,
    paddingHorizontal : 10,
  },

  assessmentInfo: {
    alignItems: 'flex-end',
  },

  failedLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },

  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  rankText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },

  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },

  topicSection: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },

  topicLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  topicPath: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },

  failedStudentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeECAButton: {
    backgroundColor: '#3B82F6',
  },

  editScheduleButton: {
    backgroundColor: '#10B981',
  },

  changeBatchButton: {
    backgroundColor: '#F59E0B',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

});

export default styles;
