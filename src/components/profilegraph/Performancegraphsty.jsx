import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
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
    textAlign: 'center',
  },
  levelIndicator: {
    position: 'absolute',
    top: -25,
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  deadlineIndicator: {
    position: 'absolute',
    top: -25,
    right: -5,
    backgroundColor: '#EB4B42',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
})

export default styles;