import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChessCompetitionTimeline = () => {
  // Status constants
  const STATUS = {
    COMPLETED: 'completed',
    ONGOING: 'ongoing',
    UPCOMING: 'upcoming'
  };

  // Timeline data with status
  const timelineData = [
    {
      id: '1',
      title: 'Registered',
      date: '02 December 2021, 4:00PM',
      location: '',
      status: STATUS.COMPLETED
    },
    {
      id: '2',
      title: 'Round 1',
      date: '14 December 2021, 4:00PM',
      location: '36 Guild Street London, UK',
      status: STATUS.COMPLETED
    },
    {
      id: '3',
      title: 'Round 2',
      date: '15 December 2021, 4:00PM',
      location: '36 Guild Street London, UK',
      status: STATUS.ONGOING
    },
    {
      id: '4',
      title: 'Final',
      date: '16 December 2021, 4:00PM',
      location: '36 Guild Street London, UK',
      status: STATUS.UPCOMING
    }
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case STATUS.COMPLETED:
        return {
          outerDotColor: '#E8F5E9', // Light green background
          innerDotColor: '#4CAF50', // Green dot
          textColor: '#4CAF50',
          lineColor: '#4CAF50'
        };
      case STATUS.ONGOING:
        return {
          outerDotColor: '#E3F2FD', // Light blue background
          innerDotColor: '#2196F3', // Blue dot
          textColor: '#2196F3',
          lineColor: '#2196F3'
        };
      case STATUS.UPCOMING:
        return {
          outerDotColor: '#F5F5F5', // Light gray background
          innerDotColor: '#9E9E9E', // Gray dot
          textColor: '#9E9E9E',
          lineColor: '#9E9E9E'
        };
      default:
        return {
          outerDotColor: '#F5F5F5',
          innerDotColor: '#9E9E9E',
          textColor: '#9E9E9E',
          lineColor: '#9E9E9E'
        };
    }
  };

  return (
    <View style={styles.container}>
      {timelineData.map((stage, index) => {
        const statusStyles = getStatusStyles(stage.status);
        const isLastItem = index === timelineData.length - 1;
        
        return (
          <View key={stage.id} style={styles.stageContainer}>
            <View style={styles.timelineColumn}>
              {/* Dot with status color */}
              <View style={[
                styles.dotOuterContainer, 
                { backgroundColor: statusStyles.outerDotColor }
              ]}>
                <View style={[
                  styles.dotInnerContainer, 
                  { backgroundColor: statusStyles.innerDotColor }
                ]} />
              </View>
              
              {/* Connecting line (not shown for last item) */}
              {!isLastItem && (
                <View style={[
                  styles.connectingLine, 
                  styles.dashedLine, 
                  { borderColor: statusStyles.lineColor }
                ]} />
              )}
            </View>
            
            <View style={styles.detailsColumn}>
              <Text style={[styles.stageTitle, { color: statusStyles.textColor }]}>
                {stage.title}
              </Text>
              <Text style={styles.stageDate}>{stage.date}</Text>
              {stage.location ? (
                <Text style={styles.stageLocation}>{stage.location}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  stageContainer: {
    flexDirection: 'row',
    height: 90,
    marginBottom: 16,
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
  },
  dotOuterContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dotInnerContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -16,
  },
  dashedLine: {
    height: '100%',
    borderStyle: 'dashed',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stageDate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  stageLocation: {
    fontSize: 14,
    color: '#757575',
  },
});

export default ChessCompetitionTimeline;