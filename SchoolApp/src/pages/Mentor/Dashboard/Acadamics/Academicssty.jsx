import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: wp('2%'),
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: wp('3%'),
  },
  headerText: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    // flex: 1,
    // flexWrap:'nowrap'
  },
  statusIndicator: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 20,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: wp('3%'),
    fontWeight: '600',
    flexWrap: 'wrap',
    // flex: 1,
  },

  // Simplified Status Section
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshIcon: {
    fontSize: wp('4%'),
    marginRight: wp('1.5%'),
  },
  refreshText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#374151',
  },

  // Simplified Session Card
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sessionInfo: {
    flex: 1,
  },
  subject: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
  },
  sessionDetails: {
    fontSize: wp('3.2%'),
    color: '#64748B',
    fontWeight: '500',
    marginTop: hp('0.3%'),
  },
  sessionTime: {
    fontSize: wp('3%'),
    color: '#94A3B8',
    marginTop: hp('0.2%'),
  },
  materialsButton: {
    padding: wp('2%'),
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginLeft: wp('2%'),
  },
  materialsButtonText: {
    fontSize: wp('4%'),
  },
  topicText: {
    fontSize: wp('3.2%'),
    color: '#475569',
    fontWeight: '500',
    marginTop: hp('1%'),
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  gradeText: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    fontWeight: '500',
  },
  academicBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.2%'),
    borderRadius: 8,
    marginLeft: wp('2%'),
  },
  academicText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: wp('3%'),
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#475569',
  },
  durationText: {
    fontSize: wp('3%'),
    color: '#94A3B8',
    marginTop: hp('0.2%'),
  },

  // Level Selection
  levelContainer: {
    marginTop: hp('2%'),
  },
  levelLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp('1%'),
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  levelBtn: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 24,
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  levelBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  levelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: wp('3.5%'),
  },
  levelTextActive: {
    color: '#FFFFFF',
  },

  // Students List
  studentsContainer: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    flex: 1,
  },

  scrollContainer: {
    paddingBottom: hp('12%'),
  },

  // Simplified Student Card Styles
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  studentCardOnLeave: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
  },
  studentCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  checkboxContainer: {
    marginRight: wp('3%'),
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImg: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  studentDetails: {
    flex: 1,
  },
  studentHeader: {
    marginBottom: hp('0.5%'),
  },
  studentName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1E293B',
  },
  studentRoll: {
    fontSize: wp('3.2%'),
    color: '#64748B',
    fontWeight: '500',
  },
  performanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  performanceText: {
    fontSize: wp('3%'),
    fontWeight: '600',
    color: '#374151',
  },
  leaveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.2%'),
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    marginTop: hp('0.3%'),
  },
  leaveText: {
    fontSize: wp('2.8%'),
    color: '#D97706',
    fontWeight: '600',
  },
  performanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickPerfButtons: {
    flexDirection: 'row',
  },
  quickPerfButton: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.4%'),
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: wp('1%'),
    minWidth: wp('8%'),
    alignItems: 'center',
  },
  selectedQuickPerfButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  quickPerfButtonText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#64748B',
  },
  selectedQuickPerfButtonText: {
    color: '#FFFFFF',
  },

  // Simplified Students Header
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    marginLeft: wp('1.5%'),
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#374151',
  },
  selectedCount: {
    marginLeft: wp('2%'),
    fontSize: wp('3%'),
    color: '#3B82F6',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 12,
  },

  // Bulk actions panel
  bulkActionsPanel: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginBottom: hp('1%'),
  },
  bulkActionsTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: hp('1%'),
  },
  selectedStudentsPreview: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  selectedStudentsText: {
    fontSize: wp('3.2%'),
    color: '#1E40AF',
    fontWeight: '500',
  },
  bulkPerformanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('1.5%'),
  },
  bulkPerfButton: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  selectedBulkPerfButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  bulkPerfButtonText: {
    fontSize: wp('3.2%'),
    fontWeight: '500',
    color: '#374151',
  },
  selectedBulkPerfButtonText: {
    color: '#FFFFFF',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBulkButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: wp('2%'),
  },
  cancelBulkButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#6B7280',
  },
  applyBulkButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  applyBulkButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  applyBulkButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Action Buttons
  actionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '700',
  },

  // Progress Bar
  progressContainer: {
    height: hp('1%'),
    backgroundColor: '#E2E8F0',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 50,
  },
  progressText: {
    textAlign: 'center',
    fontSize: wp('3.5%'),
    color: '#64748B',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: wp('6%'),
  },

  // Modal Styles (Enhanced)
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },

  feedbackModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wp('6%'),
    paddingBottom: hp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  modalHandle: {
    width: wp('12%'),
    height: hp('0.5%'),
    backgroundColor: '#CBD5E0',
    borderRadius: 3,
    marginBottom: hp('2%'),
  },
  modalTitle: {
    fontSize: wp('4%'),
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalQuestion: {
    fontSize: wp('5%'),
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },

  // Radio Options (Enhanced)
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 12,
    marginBottom: hp('1%'),
    backgroundColor: '#F8FAFC',
  },
  radioOptionActive: {
    backgroundColor: '#EBF4FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  radioCircle: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    borderWidth: 2,
    marginRight: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#3B82F6',
  },
  radioText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    flex: 1,
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: hp('2%'),
    marginTop: hp('2%'),
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '700',
  },

  // Centered Modal
  centeredModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  centeredModal: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: wp('6%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 25,
  },

  feedbackModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    elevation: 5,
  },

  // Utility Classes
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Color variants for performance status
  performanceHighlyAttentive: { color: '#059669' },
  performanceModeratelyAttentive: { color: '#0369A1' },
  performanceNotAttentive: { color: '#D97706' },
  performanceAbsent: { color: '#DC2626' },

  // Topic Hierarchy Styles
  topicContainer: {
    backgroundColor: '#F8FAFC',
    padding: wp('3%'),
    borderRadius: 8,
    marginTop: hp('1%'),
  },
  topicLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#475569',
    marginBottom: hp('0.5%'),
  },
  topicHierarchy: {
    fontSize: wp('3.8%'),
    color: '#1E293B',
    fontWeight: '500',
  },

  // Materials Button Styles
  materialsContainer: {
    marginTop: hp('1.5%'),
  },
  materialsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    alignItems: 'center',
  },
  materialsButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.8%'),
    fontWeight: '600',
  },

  // Progress Bar Styles
  progressSection: {
    marginTop: hp('2%'),
  },
  progressContainer: {
    height: hp('0.8%'),
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: wp('3.2%'),
    color: '#64748B',
    fontWeight: '500',
  },
  timeLeftText: {
    fontSize: wp('3.2%'),
    color: '#3B82F6',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 8,
  },

  // Batch Organization Styles
  batchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  batchTitle: {
    flex: 1,
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1E293B',
  },
  batchCount: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    marginRight: wp('2%'),
  },
  expandIcon: {
    fontSize: wp('4%'),
    color: '#64748B',
  },
  batchStudents: {
    padding: wp('2%'),
  },

  // Materials Modal Styles
  materialsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp('80%'),
    marginTop: hp('20%'),
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('1%'),
    padding: wp('2%'),
  },
  closeButtonText: {
    fontSize: wp('5%'),
    color: '#64748B',
    fontWeight: 'bold',
  },
  topicInfo: {
    backgroundColor: '#F8FAFC',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topicInfoText: {
    fontSize: wp('3.8%'),
    color: '#475569',
    fontWeight: '500',
  },
  materialsContent: {
    flex: 1,
    padding: wp('4%'),
  },
  materialLevelGroup: {
    marginBottom: hp('2%'),
  },
  materialLevelTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('1%'),
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: hp('0.5%'),
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: wp('3%'),
    borderRadius: 8,
    marginBottom: hp('1%'),
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: hp('0.3%'),
  },
  materialType: {
    fontSize: wp('3.2%'),
    color: '#64748B',
    marginBottom: hp('0.2%'),
  },
  materialDate: {
    fontSize: wp('3%'),
    color: '#9CA3AF',
  },
  downloadButton: {
    backgroundColor: '#10B981',
    padding: wp('2.5%'),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: wp('4%'),
  },
});

export default styles;