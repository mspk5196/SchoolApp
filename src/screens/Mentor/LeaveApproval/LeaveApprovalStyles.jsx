import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  
  SubNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  Leftarrow: {
    marginRight: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color:"#000"
  },
  // Search bar styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
   display:"flex",
   flexDirection:'row',
  
    
 },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width:300,
    marginRight:15,

  },
  historyIconContainer:{
    marginLeft: 20,
  },
  historyIcon:{
    marginTop:10,
    marginLeft:12
  },
  historyText:{
    color:'#7991A4'
  },
  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 2,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // Approve buttons container
  approveBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#DDFFD1',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#FBE5E5',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // No results styles
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop:50
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  // Add these to your existing styles object in LeaveApprovalStyles.js

approveAllButton: {
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  backgroundColor: '#0C36FF', // Adjust color to match your design
  borderRadius: 8,
  padding: 16,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
approveAllButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
scrollContainer: {
  flex: 1,
  paddingBottom: 80, // Add padding to account for the fixed button at bottom
},
// Add these style definitions to your existing LeaveApprovalStyles.js file

// Modal styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '80%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
  color: '#333',
},
rejectionInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 5,
  padding: 10,
  minHeight: 100,
  textAlignVertical: 'top',
  fontSize: 14,
  marginBottom: 15,
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
cancelButton: {
  backgroundColor: '#f0f0f0',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
  alignItems: 'center',
  flex: 1,
  marginRight: 10,
},
cancelButtonText: {
  color: '#333',
  fontWeight: '600',
},
confirmButton: {
  backgroundColor: '#0C36FF', // Royal blue to match your design
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
  alignItems: 'center',
  flex: 1,
  marginLeft: 10,
},
confirmButtonText: {
  color: 'white',
  fontWeight: '600',
},
// Add these styles to your existing LeaveApprovalStyles.js file

// Substitutes Modal styles
substitutesContainer: {
  marginBottom: 15,
},
substituteItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
  backgroundColor: '#f9f9f9',
  borderRadius: 10,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
substituteInfo: {
  flexDirection: 'row',
  alignItems: 'center',
},
substituteAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},
substituteName: {
  fontWeight: '600',
  fontSize: 14,
  color: '#333',
},
substituteId: {
  fontSize: 12,
  color: '#666',
  marginTop: 2,
},
checkboxContainer: {
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
},
substituteConfirmButton: {
  backgroundColor: '#0C36FF',
  paddingVertical: 12,
  borderRadius: 5,
  alignItems: 'center',
  justifyContent: 'center',
},
substituteConfirmText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},
// Add these style definitions to your LeaveApprovalStyles.js file

historyModalContent: {
  maxHeight: '80%',
  width: '90%',
},

historyHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
},

historyScrollContainer: {
  maxHeight: '90%',
},

historyItem: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

historyItemHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

historyItemLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},

historyAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},

historyName: {
  fontWeight: '700',
  color: '#333',
  fontSize: 16,
},

historyId: {
  color: '#666',
  fontWeight: '500',
  fontSize: 12,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 15,
},

approvedBadge: {
  backgroundColor: '#e1f7e1',
},

rejectedBadge: {
  backgroundColor: '#ffebee',
},

statusText: {
  fontWeight: 'bold',
  fontSize: 12,
},

historyDetails: {
  backgroundColor: '#f9f9f9',
  borderRadius: 8,
  padding: 12,
},

detailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},

detailText: {
  marginLeft: 8,
  color: '#444',
  flex: 1,
},

substitutesSection: {
  marginTop: 10,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},

substitutesTitle: {
  fontWeight: 'bold',
  marginBottom: 5,
  fontSize: 14,
},

substituteHistoryItem: {
  marginLeft: 10,
  marginBottom: 3,
  color: '#444',
},

rejectionSection: {
  marginTop: 10,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},

rejectionTitle: {
  fontWeight: 'bold',
  marginBottom: 5,
  fontSize: 14,
  color: '#d32f2f',
},

rejectionHistoryText: {
  color: '#666',
  fontStyle: 'italic',
},

actionDateText: {
  marginTop: 10,
  textAlign: 'right',
  color: '#777',
  fontSize: 12,
  fontStyle: 'italic',
},

noHistoryContainer: {
  padding: 30,
  alignItems: 'center',
  justifyContent: 'center',
},

noHistoryText: {
  color: '#777',
  fontSize: 16,
},
});

export default styles;