import {StyleSheet} from 'react-native';
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
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
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
  },
  
  // Session Information Card
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  subjectContainer: {
    flex: 1,
  },
  subject: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.5%'),
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  gradeText: {
    fontSize: wp('3.8%'),
    color: '#64748B',
    fontWeight: '500',
  },
  academicBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 12,
    marginLeft: wp('2%'),
  },
  academicText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: wp('3.2%'),
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#475569',
  },
  durationText: {
    fontSize: wp('3.2%'),
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    paddingHorizontal: wp('1%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1E293B',
  },
  studentCount: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    fontWeight: '500',
  },
  
  scrollContainer: {
    paddingBottom: hp('12%'),
  },
  
  // Student Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileCardOnLeave: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
  },
  profileImg: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    marginRight: wp('4%'),
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  studentInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: hp('0.3%'),
  },
  profileId: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    fontWeight: '500',
  },
  leaveIndicator: {
    fontSize: wp('3%'),
    color: '#D97706',
    fontWeight: '600',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.2%'),
    borderRadius: 8,
    marginTop: hp('0.5%'),
    alignSelf: 'flex-start',
  },
  
  // Performance Selection
  performanceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  performanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: wp('35%'),
  },
  perfButton: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: wp('1%'),
    marginBottom: hp('0.5%'),
    minWidth: wp('12%'),
    alignItems: 'center',
  },
  selectedPerfButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  perfButtonText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#64748B',
  },
  selectedPerfButtonText: {
    color: '#FFFFFF',
  },
  
  // Performance Status Display
  performanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    marginRight: wp('2%'),
  },
  editButton: {
    padding: wp('1.5%'),
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
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
});

export default styles;