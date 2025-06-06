import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,

  },
  Subcard: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  nameSection: {
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 16,
    paddingRight: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  id: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  performanceTag: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
  moreOptions: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  // Achievement Card Styles
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C36FF',
  },
  progressBarContainer: {
    marginVertical: 6,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFilled: {
    height: '100%',
    backgroundColor: '#0C36FF',
    borderRadius: 5,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLeftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C36FF',
  },
  progressRightText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    color: '#0C36FF',
    fontWeight: '700',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFilled: {
    width: '30%',
    height: '100%',
    backgroundColor: '#0C36FF',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#0C36FF',
    fontWeight: '700',
  },
  // Add these styles to your StyleSheet
  graphContainer: {
    flexDirection: 'row',
    height: 220,
    marginTop: 10,
    paddingBottom: 20,
  },
  yAxisLabels: {
    width: 30,
    height: '90%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 10,
    height: '90%',
  },
  barColumn: {
    alignItems: 'center',
    width: '16%',
    height: '100%',
  },
  barWrapper: {
    width: '70%',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barSegment: {
    width: '100%',
    position: 'absolute',
    left: 0,
    right: 0
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  attendancePercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C36FF',

    marginVertical: 8,
  },
  attendanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  totalIcon: {
    backgroundColor: '#27AE60',
  },
  presentIcon: {
    backgroundColor: '#FF9800',
  },
  leaveIcon: {
    backgroundColor: '#EB4B42',
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  attendanceCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  issueLogItem: {
    marginBottom: 8,

  },
  issueLogText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  subjectTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  subjectTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    fontSize: 14,
    backgroundColor: '#E0E0E0',

  },
  activeSubjectTab: {
    backgroundColor: '#1857C0',
    color: '#fff',
    fontWeight: '600',
  },
  activeSubjectTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  chartLine: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    width: '80%',
    height: '50%',
    borderColor: '#0C36FF',
    borderWidth: 2,
    borderRadius: 10,
  },
  chartPoint: {
    position: 'absolute',
    bottom: '30%',
    left: '30%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0C36FF',
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  axisLabel: {
    fontSize: 10,
    color: '#666',
  },
  mentorItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  mentorContent: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,

    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1857C0'
  },
  mentorImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 12,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  mentorInfo: {
    flex: 1,
    gap: 8
  },
  mentorSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorName: {
    fontSize: 14,
    color: '#333',
  },
  refreshButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    right: 23,
    backgroundColor: '#AEBCFF',
    padding: 12,
    borderRadius: 100,
  },
  loadingContainer: {
    flex: .6,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  // Add these new styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  mentorList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  mentorOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedMentorOption: {
    backgroundColor: '#f0f7ff',
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mentorRoll: {
    fontSize: 14,
    color: '#666',
  },
  noMentorsText: {
    textAlign: 'center',
    padding: 15,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#0C36FF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
})
export default styles