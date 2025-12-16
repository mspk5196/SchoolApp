import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Modal,
	ActivityIndicator,
	Alert,
	Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header } from '../../../../components';
import ApiService from '../../../../utils/ApiService';
import { getBatches as fetchBatchesApi } from '../../../../utils/materialApi';
import { StyleSheet } from 'react-native';

const FREQUENCIES = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'term', label: 'Term' },
	{ value: 'custom', label: 'Custom' },
];

const AssessmentCycles = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [cycles, setCycles] = useState([]);

	const [formVisible, setFormVisible] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	const [name, setName] = useState('');
	const [frequency, setFrequency] = useState('custom');
	const [periodStart, setPeriodStart] = useState(''); // formatted YYYY-MM-DD
	const [periodEnd, setPeriodEnd] = useState(''); // formatted YYYY-MM-DD
	const [defaultMarks, setDefaultMarks] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [freqModalVisible, setFreqModalVisible] = useState(false);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);

	// Hierarchical academic context selection
	const [grades, setGrades] = useState([]);
	const [sections, setSections] = useState([]);
	const [subjects, setSubjects] = useState([]); // subjects for selected section
	const [batches, setBatches] = useState([]); // batches for selected section+subject
	const [subjectActivities, setSubjectActivities] = useState([]); // raw subject+activities tree from backend
	const [activities, setActivities] = useState([]); // flattened activities for selected subject

	const [selectedGradeId, setSelectedGradeId] = useState(null);
	const [selectedSectionId, setSelectedSectionId] = useState(null);
	const [selectedSubjectId, setSelectedSubjectId] = useState(null);
	const [selectedBatchId, setSelectedBatchId] = useState(null);
	const [selectedContextActivityId, setSelectedContextActivityId] = useState(null);

	// Generic picker modal for grade/section/subject/batch/activity
	const [pickerVisible, setPickerVisible] = useState(false);
	const [pickerType, setPickerType] = useState(null);

	// Helper: format date string to show only the date part
	const formatDateOnly = (value) => {
		if (!value) return '';
		// Handle typical MySQL/ISO formats: 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', 'YYYY-MM-DDTHH:MM:SSZ'
		if (typeof value === 'string') {
			const firstPart = value.split('T')[0];
			return firstPart.split(' ')[0] || firstPart;
		}
		try {
			const d = new Date(value);
			if (!isNaN(d)) {
				return d.toISOString().slice(0, 10); // YYYY-MM-DD
			}
		} catch (e) {}
		return String(value);
	};

	const resetForm = () => {
		setEditingItem(null);
		setName('');
		setFrequency('custom');
		setPeriodStart('');
		setPeriodEnd('');
		setDefaultMarks('');
		setIsActive(true);
		setSelectedGradeId(null);
		setSelectedSectionId(null);
		setSelectedSubjectId(null);
		setSelectedBatchId(null);
		setSelectedContextActivityId(null);
	};

	const openCreateForm = () => {
		resetForm();
		setFormVisible(true);
	};

	const openEditForm = (item) => {
		setEditingItem(item);
		setName(item.name || '');
		setFrequency(item.frequency || 'custom');
		setPeriodStart(item.period_start || '');
		setPeriodEnd(item.period_end || '');
		setDefaultMarks(item.default_total_marks ? String(item.default_total_marks) : '');
		setIsActive(item.is_active !== undefined ? !!item.is_active : true);
		setSelectedGradeId(item.grade_id || null);
		setSelectedSectionId(item.section_id || null);
		setSelectedSubjectId(item.subject_id || null);
		setSelectedBatchId(item.batch_id || null);
		setSelectedContextActivityId(item.context_activity_id || null);
		setFormVisible(true);
	};

	// ---------- Data fetching helpers for hierarchy ----------

	const fetchGrades = async () => {
		try {
			const resp = await ApiService.get('/general/getGrades');
			if (resp?.success) {
				setGrades(resp.data || []);
			} else {
				console.error('Failed to fetch grades:', resp?.message);
			}
		} catch (error) {
			console.error('Error fetching grades:', error);
		}
	};

	const fetchSectionsForGrade = async (gradeId) => {
		if (!gradeId) {
			setSections([]);
			return;
		}
		try {
			const resp = await ApiService.post('/general/getGradeSections', { gradeID: gradeId });
			if (resp?.success && (resp.data || resp.result)) {
				const raw = resp.data || resp.result || [];
				const normalized = raw.map((s) => ({
					id: s.section_id ?? s.id,
					name: s.section_name ?? s.section ?? s.name,
					grade_id: s.grade_id ?? gradeId,
				}));
				setSections(normalized);
			} else {
				console.error('Failed to fetch sections:', resp?.message);
				setSections([]);
			}
		} catch (error) {
			console.error('Error fetching sections:', error);
			setSections([]);
		}
	};

	const fetchSubjectActivitiesForSection = async (sectionId) => {
		if (!sectionId) {
			setSubjectActivities([]);
			setSubjects([]);
			return;
		}
		try {
			const resp = await ApiService.post('/coordinator/getSubjectActivities', { sectionID: sectionId });
			if (resp?.success) {
				const subjectsRaw = resp.subjects || [];
				setSubjectActivities(subjectsRaw);
				setSubjects(subjectsRaw.map((s) => ({ id: s.subject_id, name: s.subject_name })));
			} else {
				setSubjectActivities([]);
				setSubjects([]);
			}
		} catch (error) {
			console.error('Error fetching subject activities:', error);
			setSubjectActivities([]);
			setSubjects([]);
		}
	};

	const fetchBatchesForSectionSubject = async (sectionId, subjectId) => {
		if (!sectionId || !subjectId) {
			setBatches([]);
			return;
		}
		try {
			const resp = await fetchBatchesApi(sectionId, subjectId);
			if (resp?.success) {
				setBatches(resp.batches || []);
			} else {
				setBatches([]);
			}
		} catch (error) {
			console.error('Error fetching batches:', error);
			setBatches([]);
		}
	};

	// Flatten activity tree for selected subject to show as a simple list
	const rebuildActivityOptions = () => {
		if (!selectedSubjectId || !subjectActivities || !Array.isArray(subjectActivities)) {
			setActivities([]);
			return;
		}
		const subjectNode = subjectActivities.find((s) => s.subject_id === selectedSubjectId);
		if (!subjectNode || !subjectNode.activities) {
			setActivities([]);
			return;
		}

		const flat = [];
		const walk = (node, path) => {
			const newPath = [...path, node.activity_name];
			flat.push({ id: node.context_id, label: newPath.join(' > ') });
			if (node.children && node.children.length) {
				node.children.forEach((child) => walk(child, newPath));
			}
		};

		subjectNode.activities.forEach((root) => walk(root, []));
		setActivities(flat);
	};

	const fetchCycles = async () => {
		setLoading(true);
		try {
			const resp = await ApiService.post('/coordinator/schedule/assessment-cycles', {});
			const data = Array.isArray(resp) ? resp : resp?.data || [];
			setCycles(data);
		} catch (error) {
			console.error('Error fetching assessment cycles:', error);
			Alert.alert('Error', 'Failed to load assessment cycles');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCycles();
		fetchGrades();
	}, []);

	// React to hierarchy selections
	useEffect(() => {
		fetchSectionsForGrade(selectedGradeId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGradeId]);

	useEffect(() => {
		fetchSubjectActivitiesForSection(selectedSectionId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSectionId]);

	useEffect(() => {
		// When subject changes, fetch batches and rebuild activities
		fetchBatchesForSectionSubject(selectedSectionId, selectedSubjectId);
		rebuildActivityOptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSubjectId]);

	useEffect(() => {
		// When subject activities data changes (e.g. on edit), rebuild activities
		rebuildActivityOptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectActivities]);

	const handleSave = async () => {
		if (!name.trim()) {
			Alert.alert('Validation', 'Name is required');
			return;
		}

		const payload = {
			name: name.trim(),
			frequency,
			periodStart: periodStart || null,
			periodEnd: periodEnd || null,
			defaultTotalMarks: defaultMarks ? parseInt(defaultMarks, 10) : null,
			isActive,
			gradeId: selectedGradeId || null,
			sectionId: selectedSectionId || null,
			subjectId: selectedSubjectId || null,
			batchId: selectedBatchId || null,
			contextActivityId: selectedContextActivityId || null,
		};

		if (editingItem) {
			payload.id = editingItem.id;
		}

		try {
			setLoading(true);
			const url = editingItem
				? '/coordinator/schedule/assessment-cycles/update'
				: '/coordinator/schedule/assessment-cycles/create';
			const resp = await ApiService.post(url, payload);
			if (resp?.success) {
				Alert.alert('Success', editingItem ? 'Assessment cycle updated' : 'Assessment cycle created');
				setFormVisible(false);
				await fetchCycles();
			} else {
				Alert.alert('Error', resp?.message || 'Failed to save assessment cycle');
			}
		} catch (error) {
			console.error('Save assessment cycle error:', error);
			Alert.alert('Error', error?.message || 'Failed to save assessment cycle');
		} finally {
			setLoading(false);
		}
	};

	const handleToggleActive = async (item) => {
		try {
			setLoading(true);
			const resp = await ApiService.post('/coordinator/schedule/assessment-cycles/update', {
				id: item.id,
				isActive: !item.is_active,
			});
			if (resp?.success) {
				await fetchCycles();
			} else {
				Alert.alert('Error', resp?.message || 'Failed to update status');
			}
		} catch (error) {
			console.error('Toggle active error (assessment cycle):', error);
			Alert.alert('Error', error?.message || 'Failed to update status');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (item) => {
		Alert.alert(
			'Delete Assessment Cycle',
			`Are you sure you want to delete "${item.name}"?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							setLoading(true);
							const resp = await ApiService.post('/coordinator/schedule/assessment-cycles/delete', { id: item.id });
							if (resp?.success) {
								await fetchCycles();
							} else {
								Alert.alert('Error', resp?.message || 'Failed to delete assessment cycle');
							}
						} catch (error) {
							console.error('Delete assessment cycle error:', error);
							Alert.alert('Error', error?.message || 'Failed to delete assessment cycle');
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const renderCycle = (item) => {
		const freqLabel = FREQUENCIES.find(f => f.value === item.frequency)?.label || item.frequency || 'Custom';
		const startDate = item.period_start ? formatDateOnly(item.period_start) : '';
		const endDate = item.period_end ? formatDateOnly(item.period_end) : '';
		const periodText = startDate && endDate
			? `${startDate} → ${endDate}`
			: 'No fixed period';
		const contextParts = [];
		if (item.grade_name) contextParts.push(item.grade_name);
		if (item.section_name) contextParts.push(`Sec ${item.section_name}`);
		if (item.subject_name) contextParts.push(item.subject_name);
		if (item.batch_name) contextParts.push(`Batch ${item.batch_name}`);
		if (item.activity_name) contextParts.push(item.activity_name);

		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
						<MaterialCommunityIcons
							name="calendar-multiselect"
							size={22}
							color={item.is_active ? '#2563EB' : '#999'}
						/>
						<View style={{ marginLeft: 10, flex: 1 }}>
							<Text style={styles.cardTitle}>{item.name}</Text>
							<Text style={styles.cardSubtitle}>{freqLabel} • {periodText}</Text>
							{item.default_total_marks ? (
								<Text style={styles.cardSubtitle}>Default Marks: {item.default_total_marks}</Text>
							) : null}
							{contextParts.length > 0 ? (
								<Text style={styles.cardSubtitle}>{contextParts.join(' • ')}</Text>
							) : null}
						</View>
					</View>
					<View style={styles.statusContainer}>
						<Text style={[styles.statusText, { color: item.is_active ? '#4CAF50' : '#F44336' }]}>
							{item.is_active ? 'Active' : 'Inactive'}
						</Text>
						<Switch
							value={!!item.is_active}
							onValueChange={() => handleToggleActive(item)}
						/>
					</View>
				</View>

				<View style={styles.cardActions}>
					<TouchableOpacity style={styles.editButton} onPress={() => openEditForm(item)}>
						<MaterialCommunityIcons name="pencil" size={18} color="#3557FF" />
						<Text style={styles.editButtonText}>Edit</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
						<MaterialCommunityIcons name="delete" size={18} color="#F44336" />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const renderFrequencySelector = () => (
		<Modal visible={freqModalVisible} transparent animationType="fade">
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Select Frequency</Text>
						<TouchableOpacity onPress={() => setFreqModalVisible(false)}>
							<Ionicons name="close" size={22} color="#333" />
						</TouchableOpacity>
					</View>
					<ScrollView style={{ maxHeight: 300 }}>
						{FREQUENCIES.map((f) => (
							<TouchableOpacity
								key={f.value}
								style={styles.modalItem}
								onPress={() => {
									setFrequency(f.value);
									setFreqModalVisible(false);
								}}
							>
								<Text style={styles.modalItemText}>{f.label}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);

	const renderForm = () => (
		<Modal visible={formVisible} transparent animationType="slide">
			<View style={styles.modalOverlay}>
				<View style={styles.formContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{editingItem ? 'Edit Assessment Cycle' : 'New Assessment Cycle'}</Text>
						<TouchableOpacity
							onPress={() => {
								setFormVisible(false);
								resetForm();
							}}
						>
							<Ionicons name="close" size={22} color="#333" />
						</TouchableOpacity>
					</View>

					<ScrollView style={{ maxHeight: 420 }}>
						<Text style={styles.label}>Name *</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="Cycle name (e.g. Unit Test 1)"
						/>

						{/* Hierarchical academic context */}
						<Text style={styles.label}>Grade</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => {
								setPickerType('grade');
								setPickerVisible(true);
							}}
						>
							<Text style={styles.selectorText}>
								{grades.find((g) => g.id === selectedGradeId)?.grade_name || 'Select grade (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

						<Text style={styles.label}>Section</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => {
								if (!selectedGradeId) {
									Alert.alert('Select Grade', 'Please select a grade first');
									return;
								}
								setPickerType('section');
								setPickerVisible(true);
							}}
						>
							<Text style={styles.selectorText}>
								{sections.find((s) => s.id === selectedSectionId)?.name || 'Select section (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

						<Text style={styles.label}>Subject</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => {
								if (!selectedSectionId) {
									Alert.alert('Select Section', 'Please select a section first');
									return;
								}
								setPickerType('subject');
								setPickerVisible(true);
							}}
						>
							<Text style={styles.selectorText}>
								{subjects.find((s) => s.id === selectedSubjectId)?.name || 'Select subject (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

						<Text style={styles.label}>Batch</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => {
								if (!selectedSectionId || !selectedSubjectId) {
									Alert.alert('Select Subject', 'Please select section and subject first');
									return;
								}
								setPickerType('batch');
								setPickerVisible(true);
							}}
						>
							<Text style={styles.selectorText}>
								{batches.find((b) => b.id === selectedBatchId)?.batch_name || 'Select batch (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

						<Text style={styles.label}>Activity</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => {
								if (!selectedSectionId || !selectedSubjectId) {
									Alert.alert('Select Subject', 'Please select section and subject first');
									return;
								}
								setPickerType('activity');
								setPickerVisible(true);
							}}
						>
							<Text style={styles.selectorText}>
								{activities.find((a) => a.id === selectedContextActivityId)?.label || 'Select activity (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

							<Text style={styles.label}>Frequency</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => setFreqModalVisible(true)}
						>
							<Text style={styles.selectorText}>
								{FREQUENCIES.find(f => f.value === frequency)?.label || 'Custom'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
						</TouchableOpacity>

							<Text style={styles.label}>Period Start (YYYY-MM-DD)</Text>
							<TouchableOpacity
								style={styles.selector}
								onPress={() => setShowStartPicker(true)}
							>
								<Text style={styles.selectorText}>
									{periodStart || 'Select start date'}
								</Text>
								<MaterialCommunityIcons name="calendar" size={20} color="#555" />
							</TouchableOpacity>
							{showStartPicker && (
								<DateTimePicker
									value={periodStart ? new Date(periodStart) : new Date()}
									mode="date"
									display="default"
									onChange={(event, selectedDate) => {
										setShowStartPicker(false);
										if (selectedDate) {
											const iso = selectedDate.toISOString().slice(0, 10);
											setPeriodStart(iso);
										}
									}}
								/>
							)}

							<Text style={styles.label}>Period End (YYYY-MM-DD)</Text>
							<TouchableOpacity
								style={styles.selector}
								onPress={() => setShowEndPicker(true)}
							>
								<Text style={styles.selectorText}>
									{periodEnd || 'Select end date'}
								</Text>
								<MaterialCommunityIcons name="calendar" size={20} color="#555" />
							</TouchableOpacity>
							{showEndPicker && (
								<DateTimePicker
									value={periodEnd ? new Date(periodEnd) : new Date()}
									mode="date"
									display="default"
									onChange={(event, selectedDate) => {
										setShowEndPicker(false);
										if (selectedDate) {
											const iso = selectedDate.toISOString().slice(0, 10);
											setPeriodEnd(iso);
										}
									}}
								/>
							)}

						<Text style={styles.label}>Default Total Marks</Text>
						<TextInput
							style={styles.input}
							value={defaultMarks}
							onChangeText={setDefaultMarks}
							placeholder="e.g. 50"
							keyboardType="numeric"
						/>

						<View style={styles.switchRow}>
							<Text style={styles.label}>Active</Text>
							<Switch value={isActive} onValueChange={setIsActive} />
						</View>
					</ScrollView>

					<View style={styles.formActions}>
						<TouchableOpacity
							style={[styles.saveButton, { backgroundColor: '#6B7280' }]}
							onPress={() => {
								setFormVisible(false);
								resetForm();
							}}
						>
							<Text style={styles.saveButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
							<Text style={styles.saveButtonText}>Save</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);

	// Generic picker modal for hierarchy selections
	const renderHierarchyPicker = () => {
		if (!pickerVisible || !pickerType) return null;

		let title = '';
		let items = [];
		switch (pickerType) {
			case 'grade':
				title = 'Select Grade';
				items = grades.map((g) => ({ id: g.id, label: g.grade_name }));
				break;
			case 'section':
				title = 'Select Section';
				items = sections.map((s) => ({ id: s.id, label: s.name }));
				break;
			case 'subject':
				title = 'Select Subject';
				items = subjects.map((s) => ({ id: s.id, label: s.name }));
				break;
			case 'batch':
				title = 'Select Batch';
				items = batches.map((b) => ({ id: b.id, label: b.batch_name }));
				break;
			case 'activity':
				title = 'Select Activity';
				items = activities.map((a) => ({ id: a.id, label: a.label }));
				break;
			default:
				break;
		}

		const handleSelect = (id) => {
			switch (pickerType) {
				case 'grade':
					setSelectedGradeId(id);
					// Changing grade invalidates all lower levels
					setSelectedSectionId(null);
					setSelectedSubjectId(null);
					setSelectedBatchId(null);
					setSelectedContextActivityId(null);
					setSubjectActivities([]);
					setSubjects([]);
					setBatches([]);
					setActivities([]);
					break;
				case 'section':
					setSelectedSectionId(id);
					// Changing section invalidates subject/batch/activity
					setSelectedSubjectId(null);
					setSelectedBatchId(null);
					setSelectedContextActivityId(null);
					setBatches([]);
					setActivities([]);
					break;
				case 'subject':
					setSelectedSubjectId(id);
					// Changing subject invalidates batch/activity
					setSelectedBatchId(null);
					setSelectedContextActivityId(null);
					break;
				case 'batch':
					setSelectedBatchId(id);
					break;
				case 'activity':
					setSelectedContextActivityId(id);
					break;
				default:
					break;
			}
			setPickerVisible(false);
			setPickerType(null);
		};

		return (
			<Modal visible={pickerVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{title}</Text>
							<TouchableOpacity
								onPress={() => {
									setPickerVisible(false);
									setPickerType(null);
								}}
							>
								<Ionicons name="close" size={22} color="#333" />
							</TouchableOpacity>
						</View>
						<ScrollView style={{ maxHeight: 300 }}>
							{items.map((item) => (
								<TouchableOpacity
										key={item.id}
										style={styles.modalItem}
										onPress={() => handleSelect(item.id)}
								>
									<Text style={styles.modalItemText}>{item.label}</Text>
								</TouchableOpacity>
							))}
							{items.length === 0 && (
								<View style={{ paddingVertical: 12 }}>
									<Text style={styles.modalItemText}>No options available</Text>
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		);
	};

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
			<Header title="Assessment Cycles" navigation={navigation} />
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#3557FF" />
				</View>
			)}
			<View style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.container}>
					{cycles.map((item) => (
						<View key={item.id}>{renderCycle(item)}</View>
					))}
					{cycles.length === 0 && !loading && (
						<View style={{ marginTop: 40, alignItems: 'center' }}>
							<Text style={{ color: '#6B7280' }}>No assessment cycles defined yet.</Text>
						</View>
					)}
				</ScrollView>

				<TouchableOpacity style={styles.fab} onPress={openCreateForm}>
					<MaterialCommunityIcons name="plus" size={28} color="#fff" />
				</TouchableOpacity>
			</View>

			{renderForm()}
			{renderFrequencySelector()}
			{renderHierarchyPicker()}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		paddingBottom: 80,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 14,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	cardSubtitle: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 2,
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusText: {
		fontSize: 12,
		marginRight: 6,
	},
	cardActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 10,
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: '#EEF2FF',
		marginRight: 8,
	},
	editButtonText: {
		marginLeft: 4,
		color: '#3557FF',
		fontSize: 13,
		fontWeight: '500',
	},
	deleteButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: '#FEE2E2',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	formContainer: {
		width: '90%',
		borderRadius: 12,
		backgroundColor: '#fff',
		padding: 16,
	},
	modalContainer: {
		width: '80%',
		borderRadius: 12,
		backgroundColor: '#fff',
		padding: 16,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	label: {
		fontSize: 13,
		color: '#374151',
		marginBottom: 4,
		marginTop: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
		fontSize: 14,
		color: '#111827',
	},
	selector: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	selectorText: {
		fontSize: 14,
		color: '#111827',
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 16,
	},
	formActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
	},
	saveButton: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		backgroundColor: '#3557FF',
		marginLeft: 8,
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '500',
	},
	modalItem: {
		paddingVertical: 10,
	},
	modalItemText: {
		fontSize: 14,
		color: '#111827',
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255,255,255,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#3557FF',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
	},
});

export default AssessmentCycles;
