import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as DocumentPicker from '@react-native-documents/picker';
import ApiService from '../../../../utils/ApiService';
import Header from '../../../../components/General/Header/Header';

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const AcademicCalendar = ({ navigation }) => {
    const [calendar, setCalendar] = useState([]);
    const [stats, setStats] = useState([]);
    const [dayTypes, setDayTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [academicYearId, setAcademicYearId] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [selectedDayTypeId, setSelectedDayTypeId] = useState(null);
    const [reasonInput, setReasonInput] = useState('');

    useEffect(() => {
        fetchAcademicYearId();
        fetchDayTypes();
    }, []);

    useEffect(() => {
        if (academicYearId) {
            fetchCalendar();
            fetchStats();
        }
    }, [academicYearId, selectedMonth, selectedYear]);

    const fetchAcademicYearId = async () => {
        try {
            const resp = await ApiService.makeRequest('/general/active-academic-year', { method: 'GET' });
            const data = await resp.json();
            if (data?.success && data?.academicYear?.id) {
                setAcademicYearId(data.academicYear.id);
            }
        } catch (error) {
            console.error('Error fetching academic year:', error);
        }
    };

    const fetchDayTypes = async () => {
        try {
            const resp = await ApiService.makeRequest('/coordinator/academic-calendar/day-types', { method: 'GET' });
            const data = await resp.json();
            if (data?.success && Array.isArray(data.dayTypes)) {
                setDayTypes(data.dayTypes);
                if (data.dayTypes.length > 0) {
                    setSelectedDayTypeId(data.dayTypes[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching day types:', error);
        }
    };

    const fetchCalendar = async () => {
        if (!academicYearId) return;
        setLoading(true);
        try {
            const resp = await ApiService.makeRequest('/coordinator/academic-calendar/get', {
                method: 'POST',
                body: JSON.stringify({
                    academic_year_id: academicYearId,
                    month: selectedMonth,
                    year: selectedYear,
                }),
            });
            const data = await resp.json();
            if (data?.success) {
                setCalendar(data.calendar || []);
                // console.log(data);

            }
        } catch (error) {
            console.error('Error fetching calendar:', error);
            Alert.alert('Error', 'Failed to fetch academic calendar');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!academicYearId) return;
        try {
            const resp = await ApiService.makeRequest('/coordinator/academic-calendar/stats', {
                method: 'POST',
                body: JSON.stringify({ academic_year_id: academicYearId }),
            });
            const data = await resp.json();
            if (data?.success) {
                setStats(data.stats || []);
                // console.log(data);

            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchCalendar();
        await fetchStats();
        setRefreshing(false);
    }, [academicYearId, selectedMonth, selectedYear]);

    const clearSelection = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
        setReasonInput('');
    };

    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const result = await ApiService.downloadFile(
                '/coordinator/academic-calendar/generate-template',
                'academic_calendar_template.xlsx',
                {
                    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    title: 'Academic Calendar Template',
                    description: 'Template to upload academic calendar',
                },
            );
            Alert.alert('Success', result.message || 'Template downloaded successfully.');
        } catch (error) {
            console.error('Error downloading template:', error);
            Alert.alert('Error', error.message || 'Failed to download template');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadFile = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.xlsx, DocumentPicker.types.allFiles],
                copyTo: 'cachesDirectory',
            });
            const picked = result[0];
            setLoading(true);
            const uploadResult = await ApiService.uploadFile('/coordinator/academic-calendar/upload', picked);
            if (uploadResult.data?.success) {
                const data = uploadResult.data.data;
                Alert.alert(
                    'Upload Complete',
                    `Processed: ${data.processed}\nSucceeded: ${data.succeeded}\nFailed: ${data.failed.length}`,
                    [{ text: 'OK', onPress: () => fetchCalendar() }]
                );
            } else {
                Alert.alert('Error', uploadResult.data?.message || 'Upload failed');
            }
        } catch (error) {
            if (DocumentPicker.isCancel && DocumentPicker.isCancel(error)) {
                return;
            }
            console.error('Error uploading file:', error);
            Alert.alert('Error', error.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            if (next.size === 0) {
                setSelectionMode(false);
            }
            return next;
        });
    };

    const handleLongPress = (id) => {
        setSelectionMode(true);
        toggleSelect(id);
    };

    const handlePress = (id) => {
        if (selectionMode) {
            toggleSelect(id);
        }
    };

    const applyBulkUpdate = async () => {
        if (!selectedDayTypeId) {
            Alert.alert('Select day type', 'Please choose a day type.');
            return;
        }
        if (selectedIds.size === 0) return;

        try {
            const resp = await ApiService.makeRequest('/coordinator/academic-calendar/bulk-update', {
                method: 'POST',
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    day_type_id: selectedDayTypeId,
                    reason: reasonInput,
                }),
            });
            const data = await resp.json();
            if (data?.success) {
                Alert.alert('Updated', `Updated ${data.updated || 0} entries`);
                clearSelection();
                fetchCalendar();
                fetchStats();
            } else {
                Alert.alert('Error', data?.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Bulk update error:', error);
            Alert.alert('Error', 'Failed to update entries');
        }
    };

    const getDayTypeColor = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'working_day':
                return '#4caf50';
            case 'holiday':
                return '#f44336';
            case 'faculty_working_only':
                return '#3f51b5';
            case 'half_day':
                return '#ff9800';
            default:
                return '#757575';
        }
    };

    const changeMonth = (delta) => {
        let newMonth = selectedMonth + delta;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Header navigation={navigation} title="Academic Calendar" backBtn />
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {selectionMode && (
                    <View style={styles.selectionBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dayTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.dayTypeChip,
                                        selectedDayTypeId === type.id && styles.dayTypeChipSelected,
                                    ]}
                                    onPress={() => setSelectedDayTypeId(type.id)}
                                >
                                    <Text
                                        style={[
                                            styles.dayTypeChipText,
                                            selectedDayTypeId === type.id && styles.dayTypeChipTextSelected,
                                        ]}
                                    >
                                        {type.day_type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Reason (optional)"
                            value={reasonInput}
                            onChangeText={setReasonInput}
                            placeholderTextColor="#777"
                        />
                        <View style={styles.selectionActions}>
                            <TouchableOpacity style={styles.applyButton} onPress={applyBulkUpdate}>
                                <Text style={styles.applyText}>Apply ({selectedIds.size})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleDownloadTemplate} disabled={loading}>
                        <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                        <Text style={styles.actionText}>Download Template</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleUploadFile} disabled={loading}>
                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                        <Text style={styles.actionText}>Upload File</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Day Stats</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {stats.map((item, index) => (
                            <View
                                key={`${item.day_type || 'unknown'}-${index}`}
                                style={[styles.statCard, { backgroundColor: getDayTypeColor(item.day_type) }]}
                            >
                                <Text style={styles.statLabel}>{item.day_type || 'Unknown'}</Text>
                                <Text style={styles.statValue}>{item.count || 0}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.monthRow}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
                        <Ionicons name="chevron-back" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {monthNames[selectedMonth - 1]} {selectedYear}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
                        <Ionicons name="chevron-forward" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
                ) : calendar.length === 0 ? (
                    <Text style={styles.emptyText}>No entries for this month.</Text>
                ) : (
                    calendar.map((entry) => {
                        const isSelected = selectedIds.has(entry.id);
                        return (
                            <TouchableOpacity
                                key={entry.id}
                                style={[styles.card, isSelected && styles.cardSelected]}
                                onLongPress={() => handleLongPress(entry.id)}
                                onPress={() => handlePress(entry.id)}
                                delayLongPress={200}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.dateText}>
                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Day Type:</Text>
                                    <View style={[styles.tag, { backgroundColor: getDayTypeColor(entry.day_type) }]}>
                                        <Text style={styles.tagText}>{entry.day_type || 'N/A'}</Text>
                                    </View>
                                </View>

                                {entry.reason ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.label}>Reason:</Text>
                                        <Text style={styles.value}>{entry.reason}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Source:</Text>
                                    <Text style={styles.value}>{entry.from_file ? 'Uploaded' : 'Manual'}</Text>
                                </View>

                                {entry.is_editable === 1 ? (
                                    <View style={styles.footer}>
                                        <View style={styles.footerTextRow}>
                                            <Text style={styles.footerText}>Editable Entry</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.footer}>
                                        <View style={styles.footerTextRow}>
                                            <Text style={styles.footerText}>Non-Editable Entry</Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    selectionBar: {
        backgroundColor: '#eef2ff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    dayTypeChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#b2b7ff',
        marginRight: 8,
    },
    dayTypeChipSelected: {
        backgroundColor: '#4b5bff',
        borderColor: '#4b5bff',
    },
    dayTypeChipText: {
        color: '#1f2937',
        fontWeight: '600',
    },
    dayTypeChipTextSelected: {
        color: '#fff',
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        color: '#111827',
    },
    selectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#4caf50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyText: {
        color: '#fff',
        fontWeight: '700',
    },
    clearButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    clearText: {
        color: '#111827',
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#1976D2',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        gap: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: '700',
    },
    statsContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#111827',
    },
    statCard: {
        padding: 12,
        borderRadius: 12,
        marginRight: 10,
        minWidth: 120,
    },
    statLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    monthRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    monthButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#e5e7eb',
    },
    monthText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 20,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    cardSelected: {
        borderColor: '#4b5bff',
        borderWidth: 2,
    },
    cardHeader: {
        marginBottom: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    label: {
        fontWeight: '700',
        marginRight: 6,
        color: '#374151',
    },
    value: {
        color: '#1f2937',
        flexShrink: 1,
    },
    tag: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    tagText: {
        color: '#fff',
        fontWeight: '700',
    },
    footer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
    },
    footerTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        color: '#6b7280',
        fontWeight: '600',
    },
});

export default AcademicCalendar;

