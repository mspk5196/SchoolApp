// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Modal,
//   TextInput,
//   Pressable,
//   Alert
// } from 'react-native';
// import Arrow from '../../../../assets/MentorPage/arrow.svg';
// import Checkbox from '../../../../assets/MentorPage/checkbox2.svg';
// import Pencil from '../../../../assets/MentorPage/edit.svg';
// import styles from './Assessmentsty';
// import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import { API_URL } from '../../../../utils/env.js';
// const Staff = require('../../../../assets/MentorPage/User.svg');

// const MentorDashboardAssessment = ({ navigation, route }) => {
//   const { sessionId, subject, subject_id, grade, section, section_name, duration, startTime, endTime, date } = route.params;

//   const [selectedLevel, setSelectedLevel] = useState('level1');
//   const [showCheckboxes, setShowCheckboxes] = useState(false);
//   const [checkedItems, setCheckedItems] = useState({});
//   const [sessionStarted, setSessionStarted] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(0);
//   const [studentsByLevel, setStudentsByLevel] = useState({});
//   const [sessionDetails, setSessionDetails] = useState(null);
//   const [marks, setMarks] = useState({});
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [markInput, setMarkInput] = useState('');
//   const [totalMarks, setTotalMarks] = useState('');
//   const [materials, setMaterials] = useState([]);
//   const [selectedMaterial, setSelectedMaterial] = useState(null);
//   const [sessionOver, setSessionOver] = useState(false);
//   const [canComplete, setCanComplete] = useState(false);
//   const [absentStudents, setAbsentStudents] = useState([]);
//   const [bulkUpdate, setBulkUpdate] = useState(false);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [readyToSave, setReadyToSave] = useState(false);
//   const [sessionCompleted, setSessionCompleted] = useState(false);
//   const [passPercentage, setPassPercentage] = useState(null);

//   const [selectedMaterials, setSelectedMaterials] = useState({});
//   const [materialsByLevel, setMaterialsByLevel] = useState({});
//   const [totalMarksByLevel, setTotalMarksByLevel] = useState({});

//   // Store original student levels for completed assessments
//   const [originalLevels, setOriginalLevels] = useState({});

//   const [studentMarks, setStudentMarks] = useState(null);

//   // Parse time strings to Date objects
//   const parseTimeToDate = (timeStr) => {
//     const [time, modifier] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
//     if (modifier === 'PM' && hours < 12) hours += 12;
//     if (modifier === 'AM' && hours === 12) hours = 0;
//     const dateObj = new Date(date);
//     dateObj.setHours(hours, minutes, 0, 0);
//     return dateObj;
//   };

//   const sessionStart = parseTimeToDate(startTime);
//   const sessionEnd = parseTimeToDate(endTime);

//   // Fetch session details and students
//   useEffect(() => {
//     fetchSessionDetails();
//     fetchAbsentStudents();
//     fetchPassPercentage();
//   }, []);

//   // Fetch students after we know if the session is completed and have the original levels
//   useEffect(() => {
//     if (sessionDetails) {
//       fetchStudents();
//     }
//   }, [sessionDetails]);

//   //   useEffect(() => {
//   //   console.log('🕒 Now:', new Date());
//   //   console.log('🕓 Session Start:', sessionStart);
//   //   console.log('🕔 Session End:', sessionEnd);
//   // }, [sessionStart, sessionEnd]);

//   // Session timer effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       if (now < sessionStart) {
//         setSessionStarted(false);
//         setLoadingProgress(0);
//       }
//       else if (now >= sessionStart && now > sessionEnd && sessionDetails?.status === 'In Progress') {
//         setSessionOver(true);
//         setSessionStarted(true);
//       }
//       else if (now >= sessionStart && now < sessionEnd && sessionDetails?.status === 'In Progress') {
//         setSessionStarted(true);
//         const totalDuration = sessionEnd - sessionStart;
//         const elapsed = now - sessionStart;
//         setLoadingProgress(Math.min((elapsed / totalDuration) * 100, 100));
//       }
//       else {
//         setLoadingProgress(100);
//         setSessionOver(true);
//         setSessionStarted(false); // Change to true to show mark update buttons
//         clearInterval(interval);
//         // if (!materials.length) {
//         fetchMaterials(); // Load materials once session is over
//         // }
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [sessionStart, sessionEnd, materials.length]);

//   // Check if all students have marks when session is over
//   useEffect(() => {
//     if (sessionOver && Object.keys(studentsByLevel).length > 0) {
//       const allStudents = Object.values(studentsByLevel).flat();
//       const allMarked = allStudents.every(student =>
//         marks[student.student_roll] !== undefined ||
//         isStudentAbsent(student.student_roll)
//       );

//       // Check if at least one material and total marks are set for each level
//       const levelsWithStudents = Object.keys(studentsByLevel);
//       const materialsReady = levelsWithStudents.every(
//         level =>
//           selectedMaterials[level] &&
//           selectedMaterials[level].length > 0 &&
//           totalMarksByLevel[level] &&
//           !isNaN(totalMarksByLevel[level]) &&
//           totalMarksByLevel[level] > 0
//       );

//       setCanComplete(allMarked && materialsReady);
//       setReadyToSave(allMarked);
//     }
//   }, [sessionOver, marks, studentsByLevel, absentStudents, selectedMaterials, totalMarksByLevel]);

//   useEffect(() => {
//     if (sessionOver && readyToSave && !sessionCompleted && Object.keys(materialsByLevel).length === 0) {
//       fetchMaterials();
//     }
//   }, [sessionOver, readyToSave, sessionCompleted, materialsByLevel]);

//   const fetchSessionDetails = async () => {
//     console.log('Fetching session details for sessionId:', sessionId);

//     try {
//       const response = await fetch(`${API_URL}/api/mentor/getAssessmentSession`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: sessionId
//         }),
//       });

//       const data = await response.json();
//       console.log('Session Details:', data.session);
//       if (data.success) {
//         setSessionDetails(data.session);

//         if (data.session.status === 'Completed') {
//           setSessionStarted(true);
//           setSessionOver(true);
//           setSessionCompleted(true);
//           setTotalMarks(data.session.total_marks?.toString() || '');
//           setSelectedMaterial(data.session.material_id);

//           // Store original levels from session data
//           if (data.session.student_levels) {
//             setOriginalLevels(data.session.student_levels);
//             // console.log('Original Levels:', data.session.student_levels);
//           }

//           fetchMaterials();
//         }
//         else {
//           setSessionStarted(false);
//           setSessionOver(false);
//           setSessionCompleted(false);
//         }
//       }
//       // fetchStudents()
//     } catch (error) {
//       console.error('Error fetching session details:', error);
//       Alert.alert('Error', 'Failed to fetch session details');
//     }
//   };

//   const fetchStudents = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/getAssessmentStudents`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sectionId: section,
//           subjectId: subject_id,
//           sessionId: sessionDetails.id,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         // Check if session is completed and we have original levels
//         if (sessionCompleted && data.originalLevels) {
//           // Organize students by their original levels
//           const studentsByOriginalLevel = {};

//           // Initialize the levels we'll need based on original levels values
//           const uniqueLevels = [...new Set(Object.values(data.originalLevels))];
//           uniqueLevels.forEach(level => {
//             studentsByOriginalLevel[level] = [];
//           });

//           // Place each student in their original level group
//           Object.values(data.studentsByLevel).flat().forEach(student => {
//             const roll = student.student_roll;
//             const originalLevel = data.originalLevels[roll];

//             if (originalLevel) {
//               if (!studentsByOriginalLevel[originalLevel]) {
//                 studentsByOriginalLevel[originalLevel] = [];
//               }
//               studentsByOriginalLevel[originalLevel].push(student);
//             } else {
//               // If no original level found, use current level
//               const currentLevel = Object.keys(data.studentsByLevel).find(
//                 level => data.studentsByLevel[level].some(s => s.student_roll === roll)
//               );
//               if (currentLevel && !studentsByOriginalLevel[currentLevel]) {
//                 studentsByOriginalLevel[currentLevel] = [];
//               }
//               if (currentLevel) {
//                 studentsByOriginalLevel[currentLevel].push(student);
//               }
//             }
//           });


//           setStudentsByLevel(studentsByOriginalLevel);
//           setOriginalLevels(data.originalLevels);
//           // console.log('Student Marks:', data.studentMarks["S1004"].mark);

//           // Set default level to the first available level
//           const levels = Object.keys(studentsByOriginalLevel);
//           if (levels.length > 0) {
//             setSelectedLevel(`level${levels[0]}`);
//           }

//         } else {
//           // For non-completed sessions, use current levels
//           setStudentsByLevel(data.studentsByLevel);
//           setStudentMarks(data.studentMarks);
//           // Set default level if there are levels available
//           const levels = Object.keys(data.studentsByLevel);
//           if (levels.length > 0) {
//             setSelectedLevel(`level${levels[0]}`);
//           }
//         }
//         // // Initialize marks with undefined for each student if not already set
//         if (Object.keys(marks).length === 0) {
//           const initialMarks = {};
//           Object.values(data.studentsByLevel).flat().forEach(student => {
//             if (data.studentMarks && data.studentMarks[student.student_roll]) {
//               initialMarks[student.student_roll] = data.studentMarks[student.student_roll].mark;
//             } else if (sessionCompleted) {
//               // In a completed session, treat missing marks as 0 or 'N/A'
//               initialMarks[student.student_roll] = 'N/A';
//             } else {
//               initialMarks[student.student_roll] = undefined;
//             }
//           });
//           setMarks(initialMarks);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching students:', error);
//       Alert.alert('Error', 'Failed to fetch students');
//     }
//   };

//   const fetchAbsentStudents = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/getAbsentees`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           date: date
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         const absentRolls = data.results.map(s => s.student_roll);
//         setAbsentStudents(absentRolls);

//         // Set marks to 0 for absent students if not in completed mode
//         if (!sessionCompleted) {
//           setMarks(prevMarks => {
//             const updated = { ...prevMarks };
//             absentRolls.forEach(roll => {
//               updated[roll] = 0;
//             });
//             return updated;
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching absent students:', error);
//       Alert.alert('Error', 'Failed to fetch absent students');
//     }
//   };

//   const fetchMaterials = async () => {
//     try {
//       const materialsByLevelResult = {};

//       // Fetch materials for each level
//       for (const level of Object.keys(studentsByLevel)) {
//         const response = await fetch(`${API_URL}/api/mentor/getAssessmentMaterials`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             subjectId: subject_id,
//             sectionId: section,
//             level: level
//           }),
//         });

//         const data = await response.json();
//         if (data.success) {
//           materialsByLevelResult[level] = data.materials;
//         }
//       }

//       setMaterialsByLevel(materialsByLevelResult);

//       // Initialize selected materials with empty arrays for each level
//       const initialSelected = {};
//       Object.keys(materialsByLevelResult).forEach(level => {
//         initialSelected[level] = [];
//       });
//       setSelectedMaterials(initialSelected);

//     } catch (error) {
//       console.error('Error fetching materials:', error);
//       Alert.alert('Error', 'Failed to fetch assessment materials');
//     }
//   };


//   const fetchPassPercentage = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/getPassPercentage`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           subjectId: subject_id,
//           gradeId: grade
//         }),
//       });

//       const data = await response.json();
//       if (data.success && data.passPercent) {
//         setPassPercentage(data.passPercent);
//       }
//     } catch (error) {
//       console.error('Error fetching pass percentage:', error);
//       // Keep default pass percentage
//     }
//   };

//   const handleStartSession = async () => {
//     const now = new Date();
//     if (now < sessionStart) {
//       Alert.alert('Cannot Start', 'You cannot start the session before the scheduled start time.');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/mentor/assessmentSessionStart`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: sessionId
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         // Set frontend state
//         setSessionStarted(true);
//         setLoadingProgress(0); // reset
//         fetchSessionDetails(); // update sessionDetails.status = 'In Progress'
//         // fetchMaterials();      // preload materials if needed

//         // Start live progress
//         const totalDuration = sessionEnd - sessionStart;

//         const interval = setInterval(() => {
//           const now = new Date();
//           if (now < sessionEnd) {
//             const elapsed = now - sessionStart;
//             setLoadingProgress(Math.min((elapsed / totalDuration) * 100, 100));
//           } else {
//             setLoadingProgress(100);
//             setSessionOver(true);
//             clearInterval(interval);
//           }
//         }, 1000);
//       }
//     } catch (error) {
//       console.error('Error starting session:', error);
//       Alert.alert('Error', 'Failed to start assessment session');
//     }
//   };

//   const toggleMaterialSelection = (level, materialId) => {
//     setSelectedMaterials(prev => {
//       const newSelection = { ...prev };
//       if (!newSelection[level]) newSelection[level] = [];

//       const index = newSelection[level].indexOf(materialId);
//       if (index === -1) {
//         newSelection[level].push(materialId);
//       } else {
//         newSelection[level].splice(index, 1);
//       }
//       return newSelection;
//     });
//   };


//   const toggleCheckbox = (studentRoll) => {
//     if (isStudentAbsent(studentRoll)) return; // Don't allow selection of absent students

//     const newCheckedItems = { ...checkedItems };
//     newCheckedItems[studentRoll] = !newCheckedItems[studentRoll];
//     setCheckedItems(newCheckedItems);

//     // Update selectedStudents array
//     const selected = Object.keys(newCheckedItems).filter(key => newCheckedItems[key]);
//     setSelectedStudents(selected);
//   };

//   // Long press handler for students
//   const handleLongPress = (student) => {
//     if (!sessionOver || isStudentAbsent(student.student_roll) || sessionCompleted) return;

//     setShowCheckboxes(true);
//     setBulkUpdate(true);
//     // Clear any previous selections
//     setCheckedItems({});
//     setSelectedStudents([]);
//   };

//   const openMarkModal = (student = null, bulkMode = false) => {
//     if (sessionCompleted) return;

//     if (bulkMode) {
//       // For bulk update
//       setBulkUpdate(true);
//       setShowMarkModal(true);
//       setMarkInput('');
//     } else {
//       // For single student update
//       setBulkUpdate(false);
//       setSelectedStudent(student);
//       setShowMarkModal(true);
//       setMarkInput(marks[student.student_roll] !== undefined ? marks[student.student_roll].toString() : '');
//     }
//   };

//   const updateMark = () => {
//     if (!markInput.trim()) {
//       Alert.alert('Invalid Mark', 'Please enter a valid mark');
//       return;
//     }

//     const markValue = parseInt(markInput, 10);

//     if (isNaN(markValue) || markValue < 0) {
//       Alert.alert('Invalid Mark', 'Please enter a valid non-negative number');
//       return;
//     }

//     const newMarks = { ...marks };

//     if (bulkUpdate) {
//       // Update marks for all selected students
//       selectedStudents.forEach(studentRoll => {
//         newMarks[studentRoll] = markValue;
//       });

//       // Close checkboxes after bulk update
//       setShowCheckboxes(false);
//       setCheckedItems({});
//       setSelectedStudents([]);
//     } else if (selectedStudent) {
//       // Update mark for single student
//       newMarks[selectedStudent.student_roll] = markValue;
//     }

//     setMarks(newMarks);
//     setShowMarkModal(false);
//     setMarkInput('');
//   };

//   // Update the handleCompleteSession function
//   const handleCompleteSession = async () => {
//     // Validate that all levels have total marks and at least one material
//     const levelsWithStudents = Object.keys(studentsByLevel);
//     for (const level of levelsWithStudents) {
//       if (!totalMarksByLevel[level] || isNaN(totalMarksByLevel[level]) || totalMarksByLevel[level] <= 0) {
//         Alert.alert('Invalid Input', `Please enter valid total marks for Level ${level}`);
//         return;
//       }
//       if (!selectedMaterials[level] || selectedMaterials[level].length === 0) {
//         Alert.alert('Missing Selection', `Please select at least one material for Level ${level}`);
//         return;
//       }
//     }

//     if (!readyToSave) {
//       Alert.alert('Incomplete Marks', 'Please update marks for all students before saving');
//       return;
//     }

//     setSaving(true);

//     // Prepare student data for submission
//     const studentsData = [];
//     const studentLevels = {};

//     Object.keys(studentsByLevel).forEach(level => {
//       const levelTotalMarks = totalMarksByLevel[level] || 0;

//       studentsByLevel[level].forEach(student => {
//         const studentMark = marks[student.student_roll] !== undefined ? marks[student.student_roll] : 0;
//         const isAbsent = isStudentAbsent(student.student_roll);

//         // Store original level for each student
//         studentLevels[student.student_roll] = level;

//         studentsData.push({
//           student_roll: student.student_roll,
//           mark: studentMark,
//           status: isAbsent ? 'Absent' : 'Present',
//           current_level: level,
//           passed: (studentMark / levelTotalMarks * 100) >= passPercentage,
//           material_ids: JSON.stringify(selectedMaterials[level]),
//           total_marks: levelTotalMarks
//         });
//       });
//     });

//     try {
//       const response = await fetch(`${API_URL}/api/mentor/updateAssessmentMarks`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: sessionDetails.id,
//           students: studentsData,
//           student_levels: studentLevels
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         Alert.alert(
//           'Success',
//           'Assessment marks updated successfully',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//       } else {
//         Alert.alert('Error', 'Failed to update assessment marks');
//       }
//     } catch (error) {
//       console.error('Error updating assessment marks:', error);
//       Alert.alert('Error', 'Failed to update assessment marks');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isStudentAbsent = (studentRoll) => {
//     return absentStudents.includes(studentRoll);
//   };

//   const getProfileImageSource = (profilePath) => {
//     if (profilePath) {
//       // 1. Replace backslashes with forward slashes
//       const normalizedPath = profilePath.replace(/\\/g, '/');
//       // 2. Construct the full URL
//       const fullImageUrl = `${API_URL}/${normalizedPath}`;
//       return { uri: fullImageUrl };
//     } else {
//       return Staff;
//     }
//   };

//   // Cancel bulk update mode
//   const cancelBulkMode = () => {
//     setShowCheckboxes(false);
//     setCheckedItems({});
//     setSelectedStudents([]);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Arrow width={wp('9%')} height={wp('9%')} />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Assessment</Text>
//       </View>
//       <View style={styles.headerBorder} />

//       <View style={styles.sessionBox}>
//         <View style={styles.sessionTextRow}>
//           <Text style={styles.subject}>{subject} · {duration}</Text>
//           <Text style={styles.time}>{startTime} - {endTime}</Text>
//         </View>
//         <Text style={styles.gradeText}>
//           Grade {grade}-{section_name} · <Text style={styles.academicText}>Assessment</Text>
//         </Text>

//         {/* Level tabs */}
//         <View style={styles.levelRow}>
//           {Object.keys(studentsByLevel).map((level, index) => (
//             <TouchableOpacity
//               key={level}
//               style={selectedLevel === `level${level}` ? styles.level1Btn : styles.level2Btn}
//               onPress={() => setSelectedLevel(`level${level}`)}>
//               <Text style={selectedLevel === `level${level}` ? styles.level1Text : styles.level2Text}>
//                 Level {level}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Status message when in checkbox mode */}
//       {showCheckboxes && (
//         <View style={styles.bulkModeBar}>
//           <Text style={styles.bulkModeText}>
//             Select students for bulk mark update ({selectedStudents.length} selected)
//           </Text>
//           <TouchableOpacity onPress={cancelBulkMode} style={styles.cancelBulkBtn}>
//             <Text style={styles.cancelBulkText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <ScrollView style={styles.scrollBox} contentContainerStyle={{ paddingBottom: 100 }}>
//         {studentsByLevel[selectedLevel.replace('level', '')]?.map((student, index) => (
//           <TouchableOpacity
//             key={index}
//             activeOpacity={0.7}
//             onLongPress={sessionCompleted ? null : () => handleLongPress(student)}
//             disabled={isStudentAbsent(student.student_roll)}
//           >
//             <View style={styles.profileCard}>
//               {student.profile_photo ? (
//                 <Image
//                   source={getProfileImageSource(student.profile_photo)}
//                   style={[styles.profileImg, { opacity: isStudentAbsent(student.student_roll) ? 0.4 : 1 }]}
//                 />
//               ) : (
//                 <Image
//                   source={Staff}
//                   style={[styles.profileImg, { opacity: isStudentAbsent(student.student_roll) ? 0.4 : 1 }]}
//                 />
//               )}
//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.profileName, isStudentAbsent(student.student_roll) && styles.absentText]}>
//                   {student.name}
//                 </Text>
//                 <Text style={styles.profileId}>{student.student_roll}</Text>

//                 {/* Show mark if already entered or if session is completed */}
//                 {(studentMarks !== undefined || sessionCompleted) && !showCheckboxes && (
//                   <View style={styles.markInfoContainer}>
//                     <Text style={styles.markDisplay}>
//                       Mark: {studentMarks?.[student.student_roll].mark}
//                       {/* {console.log('Student Marks:', studentMarks?.[student.student_roll].mark)}; */}

//                     </Text>
//                     {sessionCompleted && totalMarks && (
//                       <Text style={styles.percentageDisplay}>
//                         ({studentMarks?.[student.student_roll].percentage}%)
//                       </Text>
//                     )}
//                   </View>
//                 )}
//               </View>

//               {sessionStarted && sessionOver ? (
//                 showCheckboxes ? (
//                   <TouchableOpacity
//                     disabled={isStudentAbsent(student.student_roll)}
//                     onPress={() => toggleCheckbox(student.student_roll)}
//                     style={{
//                       marginLeft: 'auto',
//                       padding: 5,
//                       opacity: isStudentAbsent(student.student_roll) ? 0.4 : 1,
//                     }}>
//                     {checkedItems[student.student_roll] ? (
//                       <Checkbox width={wp('6%')} height={wp('6%')} />
//                     ) : (
//                       <View
//                         style={{
//                           width: wp('6%'),
//                           height: wp('6%'),
//                           borderWidth: 2,
//                           borderColor: '#ccc',
//                           borderRadius: 4,
//                         }}
//                       />
//                     )}
//                   </TouchableOpacity>
//                 ) : (
//                   <TouchableOpacity
//                     disabled={isStudentAbsent(student.student_roll) || sessionCompleted || !sessionStarted}
//                     onPress={() => openMarkModal(student, false)}
//                     style={{
//                       backgroundColor: sessionCompleted ? '#95a5a6' : '#3498db',
//                       paddingHorizontal: 12,
//                       paddingVertical: 6,
//                       borderRadius: 4,
//                       width: wp('30%'),
//                       opacity: isStudentAbsent(student.student_roll) ? 0.4 : 1,
//                     }}
//                   >
//                     <Text style={{ color: '#fff', fontWeight: '500', textAlign: 'center' }}>
//                       {isStudentAbsent(student.student_roll) ? 'Absent' :
//                         marks[student.student_roll] !== undefined ? `Mark: ${marks[student.student_roll]}` :
//                           sessionCompleted ? `${studentMarks?.[student.student_roll].passed_status}` : 'Update Mark'}
//                       {/* {console.log('Student Marks:', studentMarks?.[student.student_roll].passed_status)} */}

//                     </Text>
//                   </TouchableOpacity>
//                 )
//               ) : null}
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Bulk action button when checkboxes are shown */}
//       {showCheckboxes && selectedStudents.length > 0 && (
//         <TouchableOpacity
//           style={styles.bulkActionBtn}
//           onPress={() => openMarkModal(null, true)}>
//           <Text style={styles.bulkActionText}>Update {selectedStudents.length} Students</Text>
//         </TouchableOpacity>
//       )}

//       {/* Material selection (only shown after session ends and all marks are entered) */}
//       {sessionOver && readyToSave && !sessionCompleted && (
//         Object.keys(materialsByLevel).map(level => (
//           <View key={level} style={styles.levelMaterialContainer}>
//             <Text style={styles.levelHeader}>Level {level} Materials</Text>

//             <Text style={styles.materialLabel}>Total Marks for Level {level}:</Text>
//             <TextInput
//               style={styles.totalMarksInput}
//               placeholder={`Enter total marks for Level ${level}`}
//               keyboardType="numeric"
//               value={totalMarksByLevel[level]?.toString() || ''}
//               onChangeText={(text) => setTotalMarksByLevel(prev => ({
//                 ...prev,
//                 [level]: text ? parseInt(text, 10) : 0
//               }))}
//             />

//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={styles.materialScroll}
//             >
//               {materialsByLevel[level]?.map((material, index) => (
//                 <TouchableOpacity
//                   key={`${level}-${index}`}
//                   style={[
//                     styles.materialItem,
//                     selectedMaterials[level]?.includes(material.id) && styles.selectedMaterial
//                   ]}
//                   onPress={() => toggleMaterialSelection(level, material.id)}>
//                   <Text style={
//                     selectedMaterials[level]?.includes(material.id) ?
//                       styles.selectedMaterialText :
//                       styles.materialItemText
//                   }>
//                     {material.file_name}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         ))
//       )}

//       {/* Display selected material for completed sessions */}
//       {sessionCompleted && selectedMaterial && (
//         <View style={styles.materialContainer}>
//           <Text style={styles.materialTitle}>Assessment Information</Text>
//           <Text style={styles.completedSessionInfo}>Total Marks: {totalMarks}</Text>
//           <Text style={styles.completedSessionInfo}>
//             Material: {materials.find(m => m.id === selectedMaterial)?.file_name || 'Selected Material'}
//           </Text>
//           <Text style={styles.completedSessionInfo}>
//             <Text style={{ fontWeight: 'bold' }}>Note:</Text> Students are shown in their original assessment levels
//           </Text>
//         </View>
//       )}

//       {/* Action Button (Start Session, Progress Bar, or Complete) */}
//       {(() => {
//         const now = new Date();

//         if (sessionCompleted) {
//           return null;
//         }

//         if (sessionDetails?.status === 'Scheduled') {
//           if (now < sessionStart) {
//             return (
//               <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#ccc' }]} disabled>
//                 <Text style={styles.completeText}>Can't Start Session Earlier</Text>
//               </TouchableOpacity>
//             );
//           } else if (now >= sessionStart && now < sessionEnd) {
//             return (
//               <TouchableOpacity style={styles.completeBtn} onPress={handleStartSession}>
//                 <Text style={styles.completeText}>Start Session</Text>
//               </TouchableOpacity>
//             );
//           } else {
//             return (
//               <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#ccc' }]} disabled>
//                 <Text style={styles.completeText}>Session Time Over</Text>
//               </TouchableOpacity>
//             );
//           }
//         }

//         if (sessionDetails?.status === 'In Progress') {
//           if (now < sessionEnd) {
//             return (
//               <View style={[styles.completeBtn, { paddingHorizontal: 0, paddingVertical: 0 }]}>
//                 <View style={styles.progressContainer}>
//                   <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
//                 </View>
//               </View>
//             );
//           } else if (canComplete && !sessionCompleted) {
//             return (
//               <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession} disabled={saving}>
//                 <Text style={styles.completeText}>{saving ? 'Saving...' : 'Save Marks'}</Text>
//               </TouchableOpacity>
//             );
//           }
//         }

//         return null;
//       })()}



//       {/* Mark Input Modal */}
//       <Modal visible={showMarkModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.markModalContainer}>
//             <Text style={styles.modalTitle}>
//               {bulkUpdate
//                 ? `Enter Mark for ${selectedStudents.length} Students`
//                 : `Enter Mark for ${selectedStudent?.name}`}
//             </Text>
//             <TextInput
//               style={styles.markInput}
//               keyboardType="numeric"
//               placeholder="Enter mark"
//               value={markInput}
//               onChangeText={setMarkInput}
//               autoFocus
//             />
//             <View style={styles.modalButtonRow}>
//               <Pressable
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => setShowMarkModal(false)}>
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 style={[styles.modalButton, styles.confirmButton]}
//                 onPress={updateMark}>
//                 <Text style={styles.modalButtonText}>Update</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default MentorDashboardAssessment;


import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, TextInput } from 'react-native';
import styles from './Assessmentsty'; // Assume styles are similar
import { API_URL } from '../../../../utils/env';

const MentorDashboardAssessment = ({ navigation, route }) => {
  const { activityId, subject, grade, section_name, startTime, endTime } = route.params;
  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  useEffect(() => {
    if (students.length > 0) {
      const initialSubs = students.reduce((acc, student) => {
        acc[student.roll] = {
          marks_obtained: '',
          total_marks: activity?.total_marks || '100',
          is_absent: student.has_approved_leave,
        };
        return acc;
      }, {});
      setSubmissions(initialSubs);
    }
  }, [students, activity]);

  const fetchActivityDetails = async () => {
    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/assessment`);
    const data = await response.json();
    if (data.success) {
      setActivity(data.activity);
      setStudents(data.students);
      const initialSubs = data.students.reduce((acc, s) => {
        acc[s.roll] = { marks_obtained: '', total_marks: '100' }; // Default total marks
        return acc;
      }, {});
      setSubmissions(initialSubs);
    } else {
      Alert.alert('Error', 'Failed to load session details.');
    }
  };

  const handleStartSession = async () => {
    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/start`, { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      setActivity(prev => ({ ...prev, status: 'In Progress' }));
    } else {
      Alert.alert('Error', data.message);
    }
  };

  const handleMarkChange = (roll, marks) => {
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], marks_obtained: marks, is_absent: false }
    }));
  };

  const handleToggleAbsent = (roll) => {
    const isCurrentlyAbsent = submissions[roll].is_absent;
    setSubmissions(s => ({
      ...s,
      [roll]: { ...s[roll], is_absent: !isCurrentlyAbsent, marks_obtained: '' }
    }));
  };

  const handleCompleteSession = async () => {
    const studentSubmissions = Object.keys(submissions).map(roll => ({
      student_roll: roll,
      ...submissions[roll]
    }));

    if (studentSubmissions.some(s => !s.is_absent && s.marks_obtained === '')) {
      Alert.alert('Incomplete', 'Please enter marks for all present students.');
      return;
    }

    const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/assessment/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentSubmissions }),
    });
    const data = await response.json();

    if (data.success) {
      Alert.alert('Success', 'Assessment marks saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      Alert.alert('Error', 'Failed to save marks.');
    }
  };

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sessionBox}>
        <Text style={styles.subject}>{subject} ({startTime} - {endTime})</Text>
        <Text style={styles.gradeText}>Grade {grade} - {section_name} | Assessment</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {students.map(student => (
          <View key={student.roll} style={[styles.profileCard, submissions[student.roll]?.is_absent && { backgroundColor: '#f0f0f0' }]}>
            <Image source={{ uri: `${API_URL}/${student.profile_photo}`.replace(/\\/g, '/') }} style={styles.profileImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{student.name}</Text>
              <Text style={styles.profileId}>{student.roll}</Text>
            </View>
            <TextInput
              style={[styles.markInput, submissions[student.roll]?.is_absent && styles.disabledInput]}
              placeholder="Marks"
              keyboardType="numeric"
              value={submissions[student.roll]?.marks_obtained}
              editable={!submissions[student.roll]?.is_absent}
              onChangeText={text => handleMarkChange(student.roll, text)}
            />
            <TouchableOpacity style={styles.absentToggle} onPress={() => handleToggleAbsent(student.roll)}>
              <Text style={{ color: submissions[student.roll]?.is_absent ? 'red' : 'grey' }}>Absent</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {activity?.status === 'Not Started' && <TouchableOpacity style={styles.completeBtn} onPress={handleStartSession}><Text style={styles.completeText}>Start Session</Text></TouchableOpacity>}
      {activity?.status === 'In Progress' && <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession}><Text style={styles.completeText}>Complete & Save</Text></TouchableOpacity>}
      {activity?.status === 'Completed' && <View style={styles.disabledBtn}><Text style={styles.completeText}>Session Completed</Text></View>}

    </SafeAreaView>
  );
};

export default MentorDashboardAssessment;