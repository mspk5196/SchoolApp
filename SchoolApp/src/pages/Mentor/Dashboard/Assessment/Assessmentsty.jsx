import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
     borderBottomColor: '#E5E5E5',
     
  },
  materialsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    width: wp('92%'),
    maxHeight: hp('80%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.5%'),
    },
    shadowOpacity: 0.25,
    shadowRadius: wp('2%'),
    elevation: 10,
  },
   
  headerText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    marginLeft: wp('3%'),
    color: '#1A1A1A',
  },
  backButton: {
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F5F5F5',
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: wp('4%'),
    marginTop: hp('1%'),
  },

  // Session Card Styles
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginVertical: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sessionHeader: {
    marginBottom: hp('2%'),
  },
  subjectContainer: {
    marginBottom: hp('1%'),
  },
  subject: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp('0.5%'),
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  gradeText: {
    fontSize: wp('3.5%'),
    fontWeight: '400',
    color: '#666666',
    marginRight: wp('3%'),
  },
  academicBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('2%'),
  },
  academicText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#666666',
  },
  timeContainer: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
  },
  timeText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333333',
  },
  durationText: {
    fontSize: wp('3%'),
    fontWeight: '400',
    color: '#666666',
    marginTop: hp('0.2%'),
  },

  // Status Indicator Styles
  statusIndicator: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  
  // Topic and Materials Styles
  topicContainer: {
    marginTop: hp('1.5%'),
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  topicLabel: {
    fontSize: wp('3.2%'),
    fontWeight: '500',
    color: '#666666',
    marginBottom: hp('0.5%'),
  },
  topicHierarchy: {
    fontSize: wp('3.5%'),
    fontWeight: '400',
    color: '#333333',
    lineHeight: wp('4.5%'),
  },
  materialsContainer: {
    marginTop: hp('1.5%'),
  },
  materialsButton: {
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    backgroundColor: '#F5F5F5',
    borderRadius: wp('2%'),
  },
  materialsButtonText: {
    color: '#333333',
    fontSize: wp('3.2%'),
    fontWeight: '500',
  },
  
  // Progress Bar Styles
  progressContainer: {
    height: hp('0.8%'),
    backgroundColor: '#E5E5E5',
    borderRadius: hp('0.4%'),
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: hp('0.4%'),
  },
  progressText: {
    fontSize: wp('3.2%'),
    color: '#666666',
    fontWeight: '400',
  },
  
  // Students Section Styles
  studentsContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  studentCount: {
    fontSize: wp('3.2%'),
    fontWeight: '400',
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('2%'),
  },
  scrollContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('2%'),
  },

  // Student Profile Card Styles
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    padding: wp('3.5%'),
    marginBottom: hp('1.2%'),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  profileCardOnLeave: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
  },
  profileImg: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  studentInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: hp('0.2%'),
  },
  profileId: {
    fontSize: wp('3%'),
    color: '#666666',
    fontWeight: '400',
    marginBottom: hp('0.2%'),
  },
  leaveIndicator: {
    fontSize: wp('2.8%'),
    color: '#FF8C00',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // Performance and Action Styles
  performanceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: wp('25%'),
  },
  performanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F0',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('2%'),
  },
  performanceText: {
    fontSize: wp('3.2%'),
    fontWeight: '500',
    marginRight: wp('1.5%'),
  },
  editButton: {
    padding: wp('1%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#F5F5F5',
  },
  performanceButtons: {
    alignItems: 'flex-end',
    gap: hp('0.8%'),
  },
  markInputButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('2%'),
  },
  markInputButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3%'),
    fontWeight: '500',
  },
  absentButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  absentButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  absentButtonText: {
    color: '#666666',
    fontSize: wp('2.8%'),
    fontWeight: '400',
  },
  absentButtonTextActive: {
    color: '#FF4444',
    fontWeight: '500',
  },

  // Action Button Styles
  actionButtonContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '500',
  },

  // Batch Styles
  batchContainer: {
    marginBottom: hp('1.5%'),
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  batchTitle: {
    flex: 1,
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333333',
  },
  batchCount: {
    fontSize: wp('3%'),
    color: '#666666',
    marginRight: wp('2%'),
  },
  expandIcon: {
    fontSize: wp('3.5%'),
    color: '#999999',
  },
  batchStudents: {
    paddingLeft: wp('1%'),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(214, 214, 214, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('3%'),
  },
  feedbackModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('6%'),
    width: wp('85%'),
    maxHeight: hp('65%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('1%'),
    },
    shadowOpacity: 0.3,
    shadowRadius: wp('3%'),
    elevation: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: hp('1%'),
    marginBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalHandle: {
    width: wp('12%'),
    height: hp('0.6%'),
    backgroundColor: '#E5E5E5',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.2%'),
    },
    shadowOpacity: 0.1,
    shadowRadius: wp('0.5%'),
    elevation: 2,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
  },
  modalQuestion: {
    fontSize: wp('3.8%'),
    color: '#666666',
    textAlign: 'center',
    lineHeight: wp('5%'),
    fontWeight: '400',
  },
  markInputContainer: {
    alignItems: 'center',
    marginVertical: hp('3%'),
    paddingHorizontal: wp('2%'),
  },
  markInputField: {
    // borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    fontSize: wp('3.5%'),
    fontWeight: '500',
    textAlign: 'center',
    minWidth: wp('50%'),
    backgroundColor: '#FAFAFA',
    color: '#1A1A1A',
    // shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.3%'),
    },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 1,
  },
  markInputFieldFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  totalMarksText: {
    fontSize: wp('3.5%'),
    color: '#888888',
    marginTop: hp('1%'),
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('10%'),
    alignItems: 'center',
    marginTop: hp('2%'),
    // shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: hp('0.4%'),
    },
    shadowOpacity: 0.3,
    shadowRadius: wp('1.5%'),
    elevation: 1,
    // borderWidth: 1,
    // borderColor: '#45A049',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    borderColor: '#BBBBBB',
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Additional Modal Styles
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('3%'),
    gap: wp('3%'),
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: wp('4%'),
    fontWeight: '600',
  },

  // Materials Modal Styles
  materialsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    width: wp('92%'),
    maxHeight: hp('80%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.5%'),
    },
    shadowOpacity: 0.25,
    shadowRadius: wp('2%'),
    elevation: 10,
  },
  materialsContent: {
    // flex: 1,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
    // height: 80,
  },
  closeButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('2%'),
  },
  closeButtonText: {
    fontSize: wp('5%'),
    color: '#666666',
    fontWeight: '600',
  },
  topicInfo: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: hp('1%'),
  },
  topicInfoText: {
    fontSize: wp('3.5%'),
    color: '#2196F3',
    fontWeight: '500',
    textAlign: 'center',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    marginVertical: hp('0.5%'),
    backgroundColor: '#FAFAFA',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.2%'),
    },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 2,
  },
  materialInfo: {
    flex: 1,
    marginRight: wp('3%'),
  },
  materialTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp('0.5%'),
  },
  materialType: {
    fontSize: wp('3%'),
    color: '#666666',
    fontWeight: '400',
    marginBottom: hp('0.2%'),
  },
  materialFileName: {
    fontSize: wp('3.2%'),
    color: '#333333',
    fontWeight: '500',
    marginBottom: hp('0.2%'),
  },
  materialDate: {
    fontSize: wp('2.8%'),
    color: '#999999',
    fontWeight: '400',
  },
  materialHierarchy: {
    fontSize: wp('2.8%'),
    color: '#666666',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp('20%'),
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('6%'),
  },
  emptyStateText: {
    fontSize: wp('3.5%'),
    color: '#999999',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: wp('4.5%'),
    marginTop: hp('1%'),
  },

  // Additional utility styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: '700',
  },
  textMuted: {
    color: '#6B7280',
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6B7280',
    marginTop: hp('2%'),
    textAlign: 'center',
  },
});
