import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  // Header
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingTop: 30,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  activityText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },



  // Section Titles
  sectionTitle1: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 5,
    color: '#333',
    paddingLeft: 5,
  },
  sectionTitle2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    color: '#333',
    paddingLeft: 5,
  },


  // Attention Box
  attentionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    width: 330,
    height: 65,
    marginLeft: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // position: "relative",
    // flex: 1,
  },
  attentionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attentionAvatar: {
    width: 45,
    height: 45,
    borderRadius: 999,
  },
  attentionNameIdWrapper: {
    justifyContent: 'center',
  },
  attentionName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  attentionId: {
    color: '#999',
    fontSize: 13,
  },
  attentionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  attentionSubject: {
    fontWeight: '500',
    fontSize: 13,
    color: '#444',
  },
  attentionPending: {
    color: '#EC6058',
    fontSize: 13,
  },


  // Date navigation
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
    gap: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#000',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92A5B5',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 5,
  },

  // Schedule Card
  scheduleBox: {
    marginBottom: 1,
    maxHeight: 'auto',
    marginTop: 10,
  },
  scheduleCard: {
    flexDirection: 'row',
    // marginTop: 14,
    borderRadius: 10,
    // width: 270,
    marginLeft: 8,
    // paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
    // marginBottom: 5,
    paddingVertical: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
  },
  scheduleTime: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  editBody: {
    flexDirection: 'row',
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  sideLine: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  scheduleInfo: {
    flexDirection: 'column',
    marginVertical: 'auto',
    gap: 5,
  },
  starttimeText: {
    width: 60,
    fontWeight: '500',
    // color: '#595959',
    color: '#3A6BFF',
    fontSize: 13,
    // marginTop: 17,
  },
  endtimeText: {
    width: 60,
    fontWeight: '500',
    // color: '#595959',
    color: '#3A6BFF',
    fontSize: 13,
    // marginTop: 50,
  },
  // durationText: {
  //   marginLeft: 100,
  //   marginTop: 10,
  //   fontSize: 5,
  // },
  activityStyle: {
    flexDirection: 'row',
    gap: 120
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  gradeText: {
    fontSize: 15,
    color: '#666',
    marginTop: 2,
    marginLeft: 10,
  },
  typeText: {
    fontSize: 14,
    marginTop: 2,
    marginLeft: 10,
  },
  durationText: {
    fontSize: 14,
    // color: '#777',
    color: '#000000ff',
    flexWrap: 'wrap',
    textAlign: 'center',
    width: 62,
    right: 15,
    marginBottom: 10,
    backgroundColor: '#e4e2e2ff',
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '500',
  },
  scheduleHeader: {
    marginBottom: 10,
  },


  //Attentionlist
  attentionNotification: {
    backgroundColor: '#3A6BFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -10,
    right: -5,
  },
  attentionNotificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },





  //Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 10,
    marginVertical: 'auto',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    color: "#333",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  subLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    height: 50,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  iconContainer: {
    padding: 10,
    backgroundColor: "#E8F0FE",
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#0C36FF",
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },



  attentionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 15,
    width: 300,
    position: 'relative',
  },
  attentionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attentionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  attentionName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  attentionId: {
    color: '#6B7280',
    fontSize: 14,
  },
  attentionSubject: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  attentionPending: {
    color: '#F97316',
    fontSize: 14,
  },
  attentionNotification: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attentionNotificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Add these new styles or update existing ones in Dashboardsty.jsx

  // Attention Card styles
  attentionCardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attentionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attentionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attentionCardDate: {
    fontSize: 12,
    color: '#666',
  },
  attentionCardSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  attentionCardStatus: {
    fontSize: 12,
    color: '#EC6058',
  },
  attentionCardCompleted: {
    fontSize: 12,
    color: '#4CAF50',
  },
  attentionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attentionCheckboxChecked: {
    backgroundColor: '#3A6BFF',
    borderColor: '#3A6BFF',
  },
  attentionCheckboxInner: {
    color: 'white',
    fontSize: 12,
  },
  attentionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attentionRightContent: {
    alignItems: 'flex-end',
  },

  // Loading and No Data Components
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  shimmerContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  shimmerCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  shimmerLine: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  shimmerLineShort: {
    width: '60%',
    height: 12,
  },
  shimmerLineMedium: {
    width: '80%',
    height: 16,
  },
  shimmerLineLong: {
    width: '100%',
    height: 14,
  },
  shimmerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  shimmerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  shimmerScheduleCard: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 10,
  },
  shimmerTime: {
    width: 60,
    marginRight: 10,
  },
  shimmerTimeSlot: {
    backgroundColor: '#e0e0e0',
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  shimmerScheduleMain: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    height: 80,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 80,
  },
  noDataIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.5,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLoadingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  attentionLoadingContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  attentionShimmerCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    width: 320,
    height: 65,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },


});

export default styles;
