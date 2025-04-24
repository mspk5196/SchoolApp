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
    height: 180,
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
    height: 180,
  },
  barColumn: {
    alignItems: 'center',
    width: 40,
  },
  barWrapper: {
    height: 180,
    width: 30,
    marginBottom: 5,
    position: 'relative',
  },
  barSegment: {
    position: 'absolute',
    width: '100%',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
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
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
})

export default styles;