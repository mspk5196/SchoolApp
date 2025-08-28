import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Add these styles to your existing stylesheet
  graphContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    marginRight: 5,
    flexDirection: 'column-reverse',
    height: 180,
    // marginTop:-8
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
    paddingBottom:28
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  barColumn: {
    alignItems: 'center',
    width: 66, // ← was 40
  },
  barWrapper: {
    height: 180,
    width: 32,
    marginBottom: 5,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barsScroll: {
    paddingRight: 16,
  },
  barSegment: {
    position: 'absolute',
    width: '100%',
    // borderBottomLeftRadius: 0,
    // borderBottomRightRadius: 0,
  },
  levelIndicator: {
    position: 'absolute',
    top: -25,
    width: '100%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop:8
  },
  deadlineIndicator: {
    position: 'absolute',
    top: -50,
    right: -5,
    backgroundColor: '#EB4B42',
    width: 15,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap:10,
    flexWrap:'wrap'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom:10
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
  graphSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  // Add these new styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EB4B42',
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
})

export default styles;