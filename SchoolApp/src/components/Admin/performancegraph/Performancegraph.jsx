import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import styles from './Performancegraphsty';
import { API_URL } from '../../../utils/env.js'

const PerformanceGraph = ({ student }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({
    student: null,
    subjects: [],
    max_level: 0
  });

  // Fetch performance data when student prop changes
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/admin/students/${student.roll}/performance`);
        const data = response

        if (data.success) {
          setGraphData(data.data);
        } else {
          setError(data.message || 'Failed to fetch performance data');
        }
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Error fetching performance data');
      } finally {
        setLoading(false);
      }
    };

    if (student && student.roll) {
      fetchPerformanceData();
    }
  }, [student]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C36FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Calculate bar heights and segments
  const getPerformanceSegments = (subject) => {
    const scaleFactor = 180 / graphData.max_level;

    if (!subject.levels || subject.levels.length === 0) {
      return { segments: [], scaleFactor };
    }

    const segments = subject.levels.map(lvl => {
      let color = 'rgba(153, 153, 153, 0.22)'; // default gray for pending

      if (lvl.status === 'completed') color = '#0C36FF'; // blue
      if (lvl.status === 'early') color = '#27AE60';     // green
      if (lvl.status === 'overdue') color = '#EB4B42';   // red
      if (lvl.status === 'onGoing') color = '#B0B0B0';   // grey

      return {
        value: 1,
        color,
        label: `L${lvl.level}`,
      };
    });

    return { segments: segments.reverse(), scaleFactor };
  };

  // Generate y-axis labels dynamically based on max level
  const generateYAxisLabels = () => {
  const max = graphData.max_level;
  let divisions = 2;

  // Cap minimum steps to 1
  const rawStep = Math.ceil(max / divisions);
  const step = rawStep < 1 ? 1 : rawStep;

  const labels = [];
  for (let i = 0; i <= max; i += step) {
    labels.push(`L${i}`);
  }

  // Always ensure L{max} is included as the top label
  if (labels[labels.length - 1] !== `L${max}`) {
    labels.push(`L${max}`);
  }

  return labels;
};


  const yAxisLabels = generateYAxisLabels();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Performance Graph</Text>

      <View style={styles.graphContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {yAxisLabels.map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>{label}</Text>
          ))}
        </View>

        {/* Bars container */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsScroll}>
          <View style={styles.barsContainer}>
            {graphData.subjects.map((subject, index) => {
              const { segments, scaleFactor } = getPerformanceSegments(subject);

              return (
                <View key={index} style={styles.barColumn}>
                  {segments.length === 0 ? (
                    <Text style={{ fontSize: 18, color: '#ccc' }}>-</Text>
                  ) : (
                    <View style={styles.barWrapper}>
                      {segments.map((segment, segIndex) => {
                        const segmentHeight = segment.value * scaleFactor;
                        const heightBelow = segments.slice(segIndex + 1).reduce(
                          (total, seg) => total + (seg.value * scaleFactor), 0
                        );

                        const isTopSegment = segIndex === 0;

                        return (
                          <View
                            key={segIndex}
                            style={[
                              styles.barSegment,
                              {
                                height: segmentHeight,
                                backgroundColor: segment.color,
                                bottom: heightBelow,
                                borderTopLeftRadius: isTopSegment ? 6 : 0,
                                borderTopRightRadius: isTopSegment ? 6 : 0,
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                  )}
                  <Text style={styles.barLabel}>{subject.subject_name}</Text>
                </View>
              );
            })}

          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#0C36FF' }]} />
          <Text style={styles.legendText}>Current Level</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
          <Text style={styles.legendText}>Beyond Target</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(153, 153, 153, 0.22)' }]} />
          <Text style={styles.legendText}>Total Levels</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#B0B0B0' }]} />
          <Text style={styles.legendText}>On Going</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#EB4B42' }]} />
          <Text style={styles.legendText}>Overdue</Text>
        </View>
      </View>
    </View>
  );
};

// Add some additional styles
const localStyles = StyleSheet.create({
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
});

export default PerformanceGraph;