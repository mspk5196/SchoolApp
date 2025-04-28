import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    SubNavbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBlockColor: '#00000040',
      },
      heading: { 
        color: '#000',
        fontSize: 18,
       },
      Leftarrow: {
        marginRight: 10,
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
        fontWeight: 'bold',
        marginLeft: 16,
      },
      scrollView: {
        flex: 1,
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
      Subcard:{
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
        fontWeight: '500',
        color: '#333',
      },
      id: {
        fontSize: 13,
        color: '#666',
      },
      performanceTag: {
        fontSize: 14,
        color: '#27AE60',
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
        fontWeight:'500',
        color: '#333',
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
        fontWeight: 'bold',
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
      },
      attendancePercentage: {
        fontSize: 28,
        fontWeight: 'bold',
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
        color:'#333',
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
      },
      activeSubjectTab: {
        backgroundColor: '#1857C0',
        color: '#fff',
      },
      activeSubjectTabText:{
        color: '#fff',
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
     // Add these styles to the ProfileStyles.jsx file

feesProgressContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 10,
},
feesProgressBar: {
  height: 8,
  backgroundColor: '#E8EAF6',
  borderRadius: 4,
  overflow: 'hidden',
  flex: 1,
  marginHorizontal: 2,
},
feesProgressFilled: {
  height: '100%',
  borderRadius: 4,
},
feesProgressComplete: {
  backgroundColor: '#0C36FF',
},
feesProgressPartial: {
  backgroundColor: '#90CAF9',
},
feesInfoContainer: {
  marginTop: 5,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

},
feesInfoRow: {
  flexDirection: 'column',
  alignItems:'left',
  justifyContent: 'space-between',
  paddingVertical: 8,
},
feesInfoLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
feesInfoValue: {
  fontSize: 14,
  fontWeight: 'bold',
},
totalFees: {
  color: '#0C36FF',
},
paidFees: {
  color: '#27AE60',
},
pendingFees: {
  color: '#EB4B42',
},
dueDate: {
  color: '#FF9800',
},
})
export default styles