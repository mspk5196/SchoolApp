import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../../../../utils/ApiService';
import { AuthContext } from '../../../../utils/AuthContext';

const StudentScheduleView = () => {
  const { userDetails } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, viewMode]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const response = await ApiService.makeRequest('/coordinator/schedule/student/get-schedule', {
        method: 'GET',
        params: {
          studentId: userDetails.studentId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      if (response.success) {
        setSchedules(response.schedules || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    if (viewMode === 'day') {
      return {
        startDate: selectedDate,
        endDate: selectedDate,
      };
    } else {
      // Week view
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return { startDate: startOfWeek, endDate: endOfWeek };
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else {
      newDate.setDate(newDate.getDate() + direction * 7);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'scheduled':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      case 'postponed':
        return '#FFC107';
      default:
        return '#999';
    }
  };

  const getAttendanceIcon = (attendance) => {
    switch (attendance) {
      case 'present':
        return 'check-circle';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'clock-alert';
      default:
        return 'help-circle';
    }
  };

  const renderScheduleItem = ({ item }) => (
    <View style={[styles.scheduleCard, { borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <Icon name="clock-outline" size={16} color="#666" />
          <Text style={styles.timeText}>
            {item.start_time} - {item.end_time}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.subjectName}>{item.subject_name}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="school" size={16} color="#666" />
          <Text style={styles.detailText}>
            Grade {item.grade_name}, Section {item.section_name}
          </Text>
        </View>

        {item.batch_name && (
          <View style={styles.detailRow}>
            <Icon name="account-group" size={16} color="#666" />
            <Text style={styles.detailText}>Batch: {item.batch_name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="account" size={16} color="#666" />
          <Text style={styles.detailText}>{item.mentor_name}</Text>
        </View>

        {item.venue_name && (
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text style={styles.detailText}>{item.venue_name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="clipboard-text" size={16} color="#666" />
          <Text style={styles.detailText}>Type: {item.session_type}</Text>
        </View>
      </View>

      {item.status === 'completed' && (
        <View style={styles.evaluationSection}>
          <View style={styles.divider} />

          {item.attendance && (
            <View style={styles.evaluationRow}>
              <Icon
                name={getAttendanceIcon(item.attendance)}
                size={20}
                color={item.attendance === 'present' ? '#4CAF50' : '#F44336'}
              />
              <Text style={styles.evaluationLabel}>Attendance:</Text>
              <Text style={[styles.evaluationValue, { textTransform: 'capitalize' }]}>
                {item.attendance}
              </Text>
            </View>
          )}

          {item.evaluation_mode === 'marks' && item.marks_obtained !== null && (
            <View style={styles.evaluationRow}>
              <Icon name="numeric" size={20} color="#6200EE" />
              <Text style={styles.evaluationLabel}>Marks:</Text>
              <Text style={styles.evaluationValue}>
                {item.marks_obtained} / {item.total_marks}
              </Text>
            </View>
          )}

          {item.evaluation_mode === 'attentiveness' && item.performance_level && (
            <View style={styles.evaluationRow}>
              <Icon name="chart-line" size={20} color="#FF9800" />
              <Text style={styles.evaluationLabel}>Performance:</Text>
              <Text style={[styles.evaluationValue, { textTransform: 'capitalize' }]}>
                {item.performance_level}
              </Text>
            </View>
          )}

          {item.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Remarks:</Text>
              <Text style={styles.remarksText}>{item.remarks}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      const { startDate, endDate } = getDateRange();
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'day' && styles.toggleButtonActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => navigateDate(-1)}>
          <Icon name="chevron-left" size={32} color="#6200EE" />
        </TouchableOpacity>

        <Text style={styles.dateText}>{formatDateHeader()}</Text>

        <TouchableOpacity onPress={() => navigateDate(1)}>
          <Icon name="chevron-right" size={32} color="#6200EE" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={styles.loader} />
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-blank" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No classes scheduled</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#6200EE',
  },
  toggleText: {
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6200EE',
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  loader: {
    marginTop: 32,
  },
  listContent: {
    padding: 16,
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  evaluationSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  evaluationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evaluationLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  evaluationValue: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  remarksContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  remarksLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});

export default StudentScheduleView;
