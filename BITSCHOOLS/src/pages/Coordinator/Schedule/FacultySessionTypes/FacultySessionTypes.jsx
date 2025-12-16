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
import { Header } from '../../../../components';
import ApiService from '../../../../utils/ApiService';
import { StyleSheet } from 'react-native';

const FacultySessionTypes = ({ navigation }) => { 
	const [loading, setLoading] = useState(false);
	const [sessionTypes, setSessionTypes] = useState([]);
	const [evaluationModes, setEvaluationModes] = useState([]);

	const [formVisible, setFormVisible] = useState(false);
	const [editingItem, setEditingItem] = useState(null); // null => create

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isStudentFacing, setIsStudentFacing] = useState(true);
	const [requiresContextActivity, setRequiresContextActivity] = useState(true);
	const [isActive, setIsActive] = useState(true);
	const [selectedEvalMode, setSelectedEvalMode] = useState(null);
	const [evalModeModalVisible, setEvalModeModalVisible] = useState(false);

	const resetForm = () => {
		setEditingItem(null);
		setName('');
		setDescription('');
		setIsStudentFacing(true);
		setRequiresContextActivity(true);
		setIsActive(true);
		setSelectedEvalMode(null);
	};

	const openCreateForm = () => {
		resetForm();
		setFormVisible(true);
	};

	const openEditForm = (item) => {
		setEditingItem(item);
		setName(item.name || '');
		setDescription(item.description || '');
		setIsStudentFacing(!!item.is_student_facing);
		setRequiresContextActivity(!!item.requires_context_activity);
		setIsActive(!!item.is_active);
		if (item.evaluation_mode) {
			const mode = evaluationModes.find((em) => em.id === item.evaluation_mode);
			setSelectedEvalMode(mode || null);
		} else {
			setSelectedEvalMode(null);
		}
		setFormVisible(true);
	};

	const fetchEvaluationModes = async () => {
		try {
			const resp = await ApiService.get('/coordinator/schedule/evaluation-modes');
			const data = Array.isArray(resp) ? resp : resp?.data || [];
			setEvaluationModes(data);
		} catch (error) {
			console.error('Error fetching evaluation modes:', error);
			Alert.alert('Error', 'Failed to load evaluation modes');
		}
	};

	const fetchSessionTypes = async () => {
		setLoading(true);
		try {
			const resp = await ApiService.get('/coordinator/schedule/session-types');
			const data = Array.isArray(resp) ? resp : resp?.data || [];
			setSessionTypes(data);
		} catch (error) {
			console.error('Error fetching session types:', error);
			Alert.alert('Error', 'Failed to load session types');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvaluationModes();
		fetchSessionTypes();
	}, []);

	const handleSave = async () => {
		if (!name.trim()) {
			Alert.alert('Validation', 'Name is required');
			return;
		}

		const payload = {
			name: name.trim(),
			description: description.trim() || null,
			isStudentFacing,
			requiresContextActivity,
			evaluationModeId: selectedEvalMode ? selectedEvalMode.id : null,
			isActive,
		};

		if (editingItem) {
			payload.id = editingItem.id;
		}

		try {
			setLoading(true);
			const url = editingItem
				? '/coordinator/schedule/session-types/update'
				: '/coordinator/schedule/session-types/create';
			const resp = await ApiService.post(url, payload);
			if (resp?.success) {
				Alert.alert('Success', editingItem ? 'Session type updated' : 'Session type created');
				setFormVisible(false);
				await fetchSessionTypes();
			} else {
				Alert.alert('Error', resp?.message || 'Failed to save session type');
			}
		} catch (error) {
			console.error('Save session type error:', error);
			Alert.alert('Error', error?.message || 'Failed to save session type');
		} finally {
			setLoading(false);
		}
	};

	const handleToggleActive = async (item) => {
		try {
			setLoading(true);
			const resp = await ApiService.post('/coordinator/schedule/session-types/update', {
				id: item.id,
				isActive: !item.is_active,
			});
			if (resp?.success) {
				await fetchSessionTypes();
			} else {
				Alert.alert('Error', resp?.message || 'Failed to update status');
			}
		} catch (error) {
			console.error('Toggle active error:', error);
			Alert.alert('Error', error?.message || 'Failed to update status');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (item) => {
		Alert.alert(
			'Delete Session Type',
			`Are you sure you want to delete "${item.name}"?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							setLoading(true);
							const resp = await ApiService.post('/coordinator/schedule/session-types/delete', { id: item.id });
							if (resp?.success) {
								await fetchSessionTypes();
							} else {
								Alert.alert('Error', resp?.message || 'Failed to delete session type');
							}
						} catch (error) {
							console.error('Delete session type error:', error);
							Alert.alert('Error', error?.message || 'Failed to delete session type');
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const renderSessionType = (item) => {
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
						<MaterialCommunityIcons
							name="clipboard-text-outline"
							size={22}
							color={item.is_active ? '#3557FF' : '#999'}
						/>
						<View style={{ marginLeft: 10, flex: 1 }}>
							<Text style={styles.cardTitle}>{item.name}</Text>
							<Text style={styles.cardSubtitle}>
								{item.evaluation_mode_name ? `Eval: ${item.evaluation_mode_name}` : 'No evaluation mode'}
							</Text>
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

				{item.description ? (
					<Text style={styles.descriptionText}>{item.description}</Text>
				) : null}

				<View style={styles.chipRow}>
					<View style={[styles.chip, item.is_student_facing ? styles.chipOn : styles.chipOff]}>
						<Text style={[styles.chipText, item.is_student_facing ? styles.chipTextOn : styles.chipTextOff]}>
							Student Facing
						</Text>
					</View>
					<View style={[styles.chip, item.requires_context_activity ? styles.chipOn : styles.chipOff]}>
						<Text style={[styles.chipText, item.requires_context_activity ? styles.chipTextOn : styles.chipTextOff]}>
							Requires Context Activity
						</Text>
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

	const renderEvalModeSelector = () => (
		<Modal visible={evalModeModalVisible} transparent animationType="fade">
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Select Evaluation Mode</Text>
						<TouchableOpacity onPress={() => setEvalModeModalVisible(false)}>
							<Ionicons name="close" size={22} color="#333" />
						</TouchableOpacity>
					</View>
					<ScrollView style={{ maxHeight: 300 }}>
						{evaluationModes.map((mode) => (
							<TouchableOpacity
								key={mode.id}
								style={styles.modalItem}
								onPress={() => {
									setSelectedEvalMode(mode);
									setEvalModeModalVisible(false);
								}}
							>
								<Text style={styles.modalItemText}>{mode.name}</Text>
								{mode.description ? (
									<Text style={styles.modalItemSubText}>{mode.description}</Text>
								) : null}
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);

	const renderFormModal = () => (
		<Modal visible={formVisible} transparent animationType="slide" onRequestClose={() => setFormVisible(false)}>
			<View style={styles.modalOverlay}>
				<View style={styles.formContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{editingItem ? 'Edit Session Type' : 'Add Session Type'}</Text>
						<TouchableOpacity
							onPress={() => {
								setFormVisible(false);
							}}
						>
							<Ionicons name="close" size={22} color="#333" />
						</TouchableOpacity>
					</View>

					<ScrollView style={{ maxHeight: 420 }}>
						<Text style={styles.inputLabel}>Name</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="Enter session type name"
						/>

						<Text style={styles.inputLabel}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder="Optional description"
							multiline
						/>

						<View style={styles.switchRow}>
							<Text style={styles.switchLabel}>Student Facing</Text>
							<Switch value={isStudentFacing} onValueChange={setIsStudentFacing} />
						</View>

						<View style={styles.switchRow}>
							<Text style={styles.switchLabel}>Requires Context Activity</Text>
							<Switch value={requiresContextActivity} onValueChange={setRequiresContextActivity} />
						</View>

						<View style={styles.switchRow}>
							<Text style={styles.switchLabel}>Active</Text>
							<Switch value={isActive} onValueChange={setIsActive} />
						</View>

						<Text style={styles.inputLabel}>Evaluation Mode</Text>
						<TouchableOpacity
							style={styles.selector}
							onPress={() => setEvalModeModalVisible(true)}
						>
							<Text style={styles.selectorText}>
								{selectedEvalMode ? selectedEvalMode.name : 'Select evaluation mode (optional)'}
							</Text>
							<MaterialCommunityIcons name="chevron-down" size={22} color="#555" />
						</TouchableOpacity>
					</ScrollView>

					<View style={styles.formActions}>
						<TouchableOpacity
							style={[styles.saveButton, { backgroundColor: '#E5E7EB' }]}
							onPress={() => setFormVisible(false)}
						>
							<Text style={[styles.saveButtonText, { color: '#111827' }]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
							<Text style={styles.saveButtonText}>{editingItem ? 'Update' : 'Save'}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			{renderEvalModeSelector()}
		</Modal>
	);

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
			<Header title="Faculty Session Types" navigation={navigation} />

			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#3557FF" />
				</View>
			)}

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.headerRow}>
					<Text style={styles.pageTitle}>Session Types</Text>
					<TouchableOpacity style={styles.addButton} onPress={openCreateForm}>
						<MaterialCommunityIcons name="plus" size={20} color="#fff" />
						<Text style={styles.addButtonText}>Add</Text>
					</TouchableOpacity>
				</View>

				{sessionTypes.length === 0 ? (
					<Text style={styles.emptyText}>No session types configured yet.</Text>
				) : (
					sessionTypes.map((item) => (
						<View key={item.id}>{renderSessionType(item)}</View>
					))
				)}
			</ScrollView>

			{renderFormModal()}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F3F4F6',
	},
	content: {
		padding: 16,
		paddingBottom: 24,
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.5)',
		zIndex: 10,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	pageTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#3557FF',
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	addButtonText: {
		color: '#fff',
		fontWeight: '600',
		marginLeft: 6,
	},
	emptyText: {
		color: '#6B7280',
		fontStyle: 'italic',
		marginTop: 24,
		textAlign: 'center',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 14,
		marginTop: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 1,
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
	descriptionText: {
		fontSize: 13,
		color: '#4B5563',
		marginTop: 8,
	},
	chipRow: {
		flexDirection: 'row',
		marginTop: 10,
	},
	chip: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		marginRight: 8,
		borderWidth: 1,
	},
	chipOn: {
		backgroundColor: '#DCFCE7',
		borderColor: '#16A34A',
	},
	chipOff: {
		backgroundColor: '#F3F4F6',
		borderColor: '#D1D5DB',
	},
	chipText: {
		fontSize: 11,
	},
	chipTextOn: {
		color: '#166534',
		fontWeight: '600',
	},
	chipTextOff: {
		color: '#4B5563',
	},
	statusContainer: {
		alignItems: 'flex-end',
	},
	statusText: {
		fontSize: 12,
		marginBottom: 4,
		fontWeight: '600',
	},
	cardActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#3557FF',
	},
	editButtonText: {
		marginLeft: 4,
		fontSize: 13,
		color: '#3557FF',
		fontWeight: '600',
	},
	deleteButton: {
		padding: 6,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	formContainer: {
		width: '90%',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 12,
	},
	modalContainer: {
		width: '90%',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingBottom: 8,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	modalItem: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	modalItemText: {
		fontSize: 14,
		color: '#111827',
	},
	modalItemSubText: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 2,
	},
	inputLabel: {
		fontSize: 13,
		fontWeight: '500',
		color: '#4B5563',
		marginTop: 12,
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
		fontSize: 14,
		backgroundColor: '#F9FAFB',
	},
	textArea: {
		minHeight: 70,
		textAlignVertical: 'top',
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	},
	switchLabel: {
		fontSize: 14,
		color: '#111827',
	},
	selector: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 10,
		backgroundColor: '#F9FAFB',
		marginTop: 4,
	},
	selectorText: {
		fontSize: 14,
		color: '#111827',
		flex: 1,
	},
	formActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
	},
	saveButton: {
		backgroundColor: '#3557FF',
		borderRadius: 999,
		paddingHorizontal: 18,
		paddingVertical: 10,
		marginLeft: 10,
	},
	saveButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 14,
	},
});

export default FacultySessionTypes;

