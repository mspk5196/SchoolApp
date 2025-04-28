import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom:10,
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
    color:'#333'
  },
  sectionTitle2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 55,
    color:'#333'
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
    height:65,
    marginLeft:8,
    marginVertical: 10,
    position: "relative",
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
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 17  ,
    color: '#000',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92A5B5',
  },

  // Schedule Card
  scheduleBox:{
    marginBottom:1,
    maxHeight:'auto',
    marginTop:10,
  },
  scheduleCard: {
    flexDirection: 'row',
    marginBottom: 5,
    marginTop:15,
    borderRadius: 10,
    width:270,
    marginLeft:10,
    alignItems: 'center',
    paddingRight: 16,
  },
  scheduleItem:{
    flexDirection: 'row',
  },
  scheduleTime:{
    flexDirection:'column',
  },
  editBody:{
    flexDirection:'row',
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 1,
    zIndex: 1,
    color:'#1857C0',
  },
  sideLine: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingLeft: 12,
  },
  starttimeText: {
    width: 60,
    fontWeight: '500',
    color: '#595959',
    fontSize: 13,
    marginTop:17,
  },
  endtimeText: {
    width: 60,
    fontWeight: '500',
    color: '#595959',
    fontSize: 13,
    marginTop:50,
  },
  durationText:{
    marginLeft:100,
    marginTop:10,
    fontSize:5,
  },
  activityStyle:{
    flexDirection:'row',
    gap:120
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft:10,
  },
  gradeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginLeft:10,
  },
  typeText: {
    fontSize: 14,
    marginTop: 2,
    marginLeft:10,
  },
  durationText: {
    fontSize: 14,
    color: '#777',
  },
  scheduleHeader:{
    marginBottom:10,
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
    marginTop: 70,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop:10,
    color: "#333",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight:'bold',
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
    height:50,
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
  
  
});

export default styles;
