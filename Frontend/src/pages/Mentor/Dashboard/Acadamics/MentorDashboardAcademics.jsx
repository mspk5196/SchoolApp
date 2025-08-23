// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Alert,
//   Pressable,
// } from 'react-native';
// import Arrow from '../../../../assets/MentorPage/arrow.svg';
// import Checkbox from '../../../../assets/MentorPage/checkbox2.svg';
// import Pencil from '../../../../assets/MentorPage/edit.svg';
// import styles from './Academicssty';
// import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import { API_URL } from '../../../../utils/env.js';
// const Staff = require('../../../../assets/MentorPage/User.svg');

// const MentorDashboardAcademics = ({ navigation, route }) => {
//   const { sessionId, subject, grade, section, duration, startTime, endTime, subject_id, section_name, date } = route.params;
//   const [selectedLevel, setSelectedLevel] = useState('Level 1');
//   const [showCheckboxes, setShowCheckboxes] = useState(false);
//   const [checkedItems, setCheckedItems] = useState({});
//   const [isChecked, setIsChecked] = useState(false);
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [selectedFeedback, setSelectedFeedback] = useState('');
//   const [showFinalModal, setShowFinalModal] = useState(false);
//   const [finalAction, setFinalAction] = useState('');
//   const [editIndex, setEditIndex] = useState(null);
//   const [sessionStarted, setSessionStarted] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(0);
//   const [students, setStudents] = useState([]);
//   const [sessionStatus, setSessionStatus] = useState('Scheduled');
//   const [sessionOver, setSessionOver] = useState(false);

//   const [allLevels, setAllLevels] = useState([]);
//   const [studentsByLevel, setStudentsByLevel] = useState({});

//   const sessionStartDate = React.useMemo(() => parseTimeWithAmPmToDate(startTime, new Date(date)), [startTime, date]);
//   const sessionEndDate = React.useMemo(() => parseTimeWithAmPmToDate(endTime, new Date(date)), [endTime, date]);
//   const totalSessionDuration = sessionEndDate - sessionStartDate;

//   const [hasApprovedLeave, setHasApprovedLeave] = useState({});

//   const [feedbackStepStarted, setFeedbackStepStarted] = useState(false);

//   const [canStartSession, setCanStartSession] = useState(true);


//   useEffect(() => {
//     checkSessionStatus();
//     fetchStudents();
//     fetch(`${API_URL}/api/mentor/create-today-sessions`, { method: 'POST' });

//     // Check for approved leaves for all students
//     checkApprovedLeaves();
//   }, []);

//   useEffect(() => {
//     const now = new Date();
//     const sessionStart = parseTimeWithAmPmToDate(startTime, new Date(date)) // optionally pass scheduled date
//     console.log("Session Start:", sessionStartDate, "Current Time:", now);

//     if (now < sessionStartDate) {
//       setCanStartSession(false);
//     } else {
//       setCanStartSession(true);
//     }
//   }, []);


//   const checkApprovedLeaves = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/check-approved-leaves?date=${date}`);
//       const data = await response.json();

//       if (data.success) {
//         const leaveMap = {};
//         data.leaves.forEach(leave => {
//           leaveMap[leave.student_roll] = true;
//         });
//         setHasApprovedLeave(leaveMap);
//       }
//     } catch (error) {
//       console.error('Error checking approved leaves:', error);
//     }
//   };

//   useEffect(() => {
//     const checkAndCompleteExpiredSessions = async () => {
//       const now = new Date();
//       const midnight = new Date();
//       midnight.setHours(24, 0, 0, 0); // Set to midnight tonight

//       // Check if we're past the session end time but before midnight
//       if (now > sessionEndDate && now < midnight && sessionStatus === 'Pending Completion') {
//         try {
//           await fetch(`${API_URL}/api/mentor/academic-session/${sessionId}/complete`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               action: 'Complete material'
//             }),
//           });
//           setSessionStatus('Completed');
//         } catch (error) {
//           console.error('Error auto-completing session:', error);
//         }
//       }
//     };

//     // Run this check every hour
//     const interval = setInterval(checkAndCompleteExpiredSessions, 3600000);
//     return () => clearInterval(interval);
//   }, [sessionStatus, sessionEndDate]);

//   useEffect(() => {
//     if (sessionStatus !== 'In Progress' || sessionOver) return;

//     const updateProgress = () => {
//       const now = new Date();
//       const sessionEnd = parseTimeWithAmPmToDate(endTime);

//       if (now >= sessionEnd) {
//         setLoadingProgress(100);
//         setSessionOver(true);
//         setSessionStarted(false);
//         // setSessionStatus('Completed');
//         return;
//       }

//       const elapsed = now - sessionStartDate;
//       let progress = (elapsed / totalSessionDuration) * 100;
//       progress = Math.min(100, Math.max(0, progress));
//       setLoadingProgress(progress);
//     };

//     // Update immediately
//     updateProgress();

//     // Then update every second
//     const interval = setInterval(updateProgress, 1000);

//     return () => clearInterval(interval);
//   }, [sessionStatus, sessionOver, startTime, endTime]);

//   useEffect(() => {
//     if (!sessionStarted || sessionOver) return;
//     const interval = setInterval(() => {
//       const now = new Date();
//       if (now > sessionEndDate) {
//         setLoadingProgress(100);
//         setSessionOver(true);
//         setSessionStarted(false);
//         clearInterval(interval);
//         return;
//       }
//       const elapsed = now - sessionStartDate;
//       let progress = (elapsed / totalSessionDuration) * 100;
//       progress = Math.min(100, Math.max(0, progress));
//       setLoadingProgress(progress);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [sessionStarted, sessionOver, startTime, endTime]);

//   useEffect(() => {
//     const now = new Date();
//     setSessionOver(now > sessionEndDate);
//   }, [endTime, sessionEndDate]);

//   const checkSessionStatus = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/academic-session/${sessionId}`);
//       if (!response.ok) {
//         console.error("Error response:", response.status);
//         return;
//       }
//       const data = await response.json();
//       console.log(data);

//       if (data.success) {
//         const now = new Date();
//         const sessionEnd = parseTimeWithAmPmToDate(endTime);
//         const isSessionOver = now > sessionEndDate;

//         setSessionOver(isSessionOver);

//         if (data.session["0"].status === 'Completed') {
//           // Session was properly completed
//           setSessionStatus('Completed');
//           setLoadingProgress(100);
//           setSessionStarted(false);
//           return;
//         }

//         if (isSessionOver) {
//           // Session time is over but not completed
//           if (data.session["0"].status === 'In Progress') {
//             // Session was in progress but not completed
//             setSessionStatus('Pending Completion');
//             setLoadingProgress(100);
//             setSessionStarted(false);
//           } else if (data.session["0"].status === 'Scheduled') {
//             // Session was never started
//             setSessionStatus('Time Over');
//             setLoadingProgress(100);
//             setSessionStarted(false);
//           }
//           return;
//         }

//         // Session is not over yet
//         setSessionStatus(data.session["0"].status);

//         if (data.session["0"].status === 'In Progress') {
//           setSessionStarted(true);
//           const elapsed = now - sessionStartDate;
//           let progress = (elapsed / totalSessionDuration) * 100;
//           progress = Math.min(100, Math.max(0, progress));
//           setLoadingProgress(progress);
//         } else {
//           setSessionStarted(false);
//           setLoadingProgress(0);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking session status:', error);
//     }
//   };

//   // Update your fetchStudents function to include performance data
//   const fetchStudents = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/students?sectionId=${section}&subjectId=${subject_id}`);
//       const data = await response.json();

//       if (data.success) {
//         const levelMap = {};
//         const levelSet = new Set();

//         // Process students and check for approved leaves
//         const processedStudents = data.assessments.map(student => {
//           // If student has approved leave, set performance to 'Absent'
//           if (hasApprovedLeave[student.student_roll]) {
//             return { ...student, performance: 'Absent' };
//           }
//           return student;
//         });

//         processedStudents.forEach(student => {
//           student.levels.forEach(level => {
//             levelSet.add(level);
//             if (!levelMap[`Level ${level}`]) {
//               levelMap[`Level ${level}`] = [];
//             }
//             levelMap[`Level ${level}`].push(student);
//           });
//         });

//         const sortedLevels = Array.from(levelSet).sort((a, b) => a - b).map(l => `Level ${l}`);
//         setAllLevels(sortedLevels);
//         setStudentsByLevel(levelMap);
//         setSelectedLevel(sortedLevels[0] || null);
//       }
//     } catch (error) {
//       console.error('Error fetching students:', error);
//     }
//   };

//   const currentStudents = studentsByLevel[selectedLevel] || [];

//   // const allFeedbackGiven = Object.values(students)
//   //   .flat()
//   //   .every(student => student.performance);

//   const allFeedbackGiven = currentStudents.every(student =>
//     student.performance || hasApprovedLeave[student.student_roll]
//   );

//   const toggleCheckbox = index => {
//     const newCheckedItems = { ...checkedItems, [index]: !checkedItems[index] };
//     setCheckedItems(newCheckedItems);
//     setIsChecked(Object.values(newCheckedItems).includes(true));
//   };

//   const getOptionColor = option => {
//     switch (option) {
//       case 'Highly Attentive':
//         return 'green';
//       case 'Moderately Attentive':
//         return 'blue';
//       case 'Not Attentive':
//         return 'orange';
//       case 'Absent':
//         return 'red';
//       default:
//         return 'gray';
//     }
//   };

//   // Update confirmFeedback to handle leave days calculation
//   const confirmFeedback = async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0];
//       const updatedStudents = currentStudents.map((student, index) => {
//         if (editIndex !== null && index === editIndex) {
//           return { ...student, performance: selectedFeedback };
//         } else if (checkedItems[index]) {
//           return { ...student, performance: selectedFeedback };
//         }
//         return student;
//       });

//       // Send updates to backend
//       const studentUpdates = updatedStudents
//         .filter((student, index) => checkedItems[index] || index === editIndex)
//         .map(student => ({
//           studentId: student.id,
//           performance: selectedFeedback
//         }));

//       await fetch(`${API_URL}/api/mentor/academic-session/${sessionId}/attendance`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ updates: studentUpdates }),
//       });

//       // ✅ Force update of studentsByLevel
//       setStudentsByLevel(prev => ({
//         ...prev,
//         [selectedLevel]: updatedStudents,
//       }));

//       // ✅ Reset modal-related state
//       setShowFeedbackModal(false);
//       setCheckedItems({});
//       setIsChecked(false);
//       setSelectedFeedback('');
//       setFeedbackStepStarted(false);
//       setEditIndex(null);
//     } catch (error) {
//       console.error('Error saving feedback:', error);
//     }
//   };


//   // Helper function to determine if session is in morning
//   const isMorningSessionTime = (timeStr) => {
//     const [time, modifier] = timeStr.split(' ');
//     const [hours] = time.split(':').map(Number);

//     // Morning session is between 8:45 AM and 12:30 PM
//     if (modifier === 'AM' && hours >= 8 && hours < 12) return true;
//     if (modifier === 'PM' && hours === 12) return true;

//     return false;
//   };

//   function parseTimeWithAmPmToDate(timeStr, targetDate = new Date()) {
//     const [time, modifier] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);

//     if (modifier === 'PM' && hours < 12) hours += 12;
//     if (modifier === 'AM' && hours === 12) hours = 0;

//     const date = new Date(targetDate);
//     date.setHours(hours, minutes, 0, 0);
//     return date;
//   }


//   const handleStartSession = async () => {
//     const now = new Date();
//     const sessionStart = parseTimeWithAmPmToDate(startTime);

//     // If today's date is not equal to the scheduled date, or current time is before session start
//     if (now < sessionStartDate) {
//       Alert.alert("Cannot start session before scheduled time.");
//       return;
//     }

//     const sessionEnd = parseTimeWithAmPmToDate(endTime);

//     if (now > sessionEnd) {
//       Alert.alert("Cannot start session - time is already over");
//       setSessionOver(true);
//       setSessionStatus('Time Over');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/mentor/academic-session/${sessionId}/start`, {
//         method: 'POST',
//       });
//       const data = await response.json();
//       if (data.success) {
//         setSessionStatus('In Progress');
//         setSessionStarted(true);

//         // Calculate initial progress
//         const elapsed = now - sessionStart;
//         let progress = (elapsed / totalSessionDuration) * 100;
//         progress = Math.min(100, Math.max(0, progress));
//         setLoadingProgress(progress);
//       }
//     } catch (error) {
//       console.error('Error starting session:', error);
//     }
//   };


//   const completeLoading = async () => {
//     setSessionStarted(true);
//     setSessionStatus('In Progress');
//   };

//   const handleCompleteSession = () => {
//     const studentsNeedingFeedback = currentStudents.filter(
//       student => !student.performance && !hasApprovedLeave[student.student_roll]
//     );

//     if (!feedbackStepStarted) {
//       if (studentsNeedingFeedback.length > 0) {
//         setShowCheckboxes(true);
//         setFeedbackStepStarted(true);
//       } else {
//         setShowFinalModal(true); // All students are fine — skip to final modal
//       }
//       return;
//     }

//     // This part runs on second click
//     const anyChecked = Object.values(checkedItems).some(val => val === true);

//     if (anyChecked) {
//       setShowFeedbackModal(true);
//     } else {
//       Alert.alert(
//         'Select at least one student',
//         'Please check at least one student before proceeding.'
//       );
//     }
//   };



//   const confirmFinalAction = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/mentor/academic-session/${sessionId}/complete`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           action: finalAction
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setSessionStatus('Completed');
//         setShowFinalModal(false);
//         setShowCheckboxes(false);
//         navigation.goBack();
//       }
//     } catch (error) {
//       console.error('Error completing session:', error);
//     }
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

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Arrow width={wp('9%')} height={wp('9%')} />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Academic</Text>
//       </View>
//       <View style={styles.headerBorder} />

//       <View style={styles.sessionBox}>
//         <View style={styles.sessionTextRow}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//             <Text style={styles.subject}>{subject}</Text>
//             <Text style={styles.time}> · {duration}</Text>
//           </View>

//           <Text style={styles.time}>{startTime} - {endTime}</Text>
//         </View>
//         <Text style={styles.gradeText}>
//           Grade {grade} - {section_name} · <Text style={styles.academicText}>Academic</Text>
//         </Text>
//         <View style={styles.levelRow}>
//           {allLevels.map(level => (
//             <TouchableOpacity
//               key={level}
//               style={selectedLevel === level ? styles.level1Btn : styles.level2Btn}
//               onPress={() => setSelectedLevel(level)}
//             >
//               <Text style={selectedLevel === level ? styles.level1Text : styles.level2Text}>
//                 {level}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <ScrollView
//         style={styles.scrollBox}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       >
//         {currentStudents.length === 0 ? (
//           <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
//             No students found for this level.
//           </Text>
//         ) : (
//           currentStudents.map((student, index) => (
//             <View key={index} style={styles.profileCard}>
//               {/* Profile image and name */}
//               {student.profile_photo ? (
//                 <Image
//                   source={getProfileImageSource(student.profile_photo)}
//                   style={styles.profileImg}
//                 />
//               ) : (
//                 <Image source={Staff} style={styles.profileImg} />
//               )}
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.profileName}>{student.name}</Text>
//                 <Text style={styles.profileId}>{student.student_roll}</Text>
//               </View>

//               {/* Attendance status */}
//               {hasApprovedLeave[student.student_roll] ? (
//                 <Text style={{ color: 'red' }}>Absent (Approved Leave)</Text>
//               ) : student.performance ? (
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <Text style={{ color: getOptionColor(student.performance), marginRight: 5 }}>
//                     {student.performance}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => {
//                       const newChecked = {};
//                       newChecked[index] = true;
//                       setCheckedItems(newChecked);
//                       setSelectedFeedback(student.performance);
//                       setEditIndex(index);
//                       setShowFeedbackModal(true);
//                     }}
//                   >
//                     <Pencil width={wp('4.5%')} height={wp('4.5%')} />
//                   </TouchableOpacity>
//                 </View>
//               ) : showCheckboxes ? (
//                 <Pressable
//                   onPress={() => toggleCheckbox(index)}
//                   style={{ marginLeft: 'auto', padding: 5 }}
//                 >
//                   {checkedItems[index] ? (
//                     <Checkbox width={wp('5%')} height={wp('5%')} />
//                   ) : (
//                     <View
//                       style={{
//                         width: wp('4%'),
//                         height: wp('4%'),
//                         borderWidth: 2,
//                         borderColor: '#ccc',
//                         borderRadius: 4,
//                       }}
//                     />
//                   )}
//                 </Pressable>
//               ) : null}
//             </View>
//           ))
//         )}
//       </ScrollView>


//       {/* Button / Loader */}
//       {sessionStatus === 'Completed' ? (
//         <View style={[styles.completeBtn, { backgroundColor: '#999' }]}>
//           <Text style={styles.completeText}>Completed</Text>
//         </View>
//       ) : sessionStatus === 'Time Over' ? (
//         <View style={[styles.completeBtn, { backgroundColor: '#999' }]}>
//           <Text style={styles.completeText}>Session Time Over</Text>
//         </View>
//       ) : sessionStatus === 'Pending Completion' ? (
//         <TouchableOpacity
//           style={[
//             styles.completeBtn,
//             showCheckboxes && !isChecked && !allFeedbackGiven
//               ? { backgroundColor: '#999' }
//               : {}
//           ]}
//           onPress={handleCompleteSession}
//           disabled={showCheckboxes && !isChecked && !allFeedbackGiven}
//         >
//           <Text style={styles.completeText}>
//             {isChecked ? 'Add Feedback' : 'Complete Session'}
//           </Text>
//         </TouchableOpacity>
//       ) : !sessionStarted ? (
//         <TouchableOpacity
//           style={[
//             styles.completeBtn,
//             !canStartSession ? { backgroundColor: '#999' } : {}
//           ]}
//           onPress={handleStartSession}
//           disabled={!canStartSession}
//         >
//           <Text style={styles.completeText}>
//             {canStartSession ? 'Start Session' : 'Cannot start session earlier'}
//           </Text>
//         </TouchableOpacity>

//       ) : (
//         <>
//           {!sessionOver ? (
//             <View style={[styles.completeBtn, { paddingHorizontal: 0, paddingVertical: 0 }]}>
//               <View style={styles.progressContainer}>
//                 <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
//               </View>
//             </View>
//           ) : (
//             sessionStatus !== 'Completed' && (
//               <TouchableOpacity
//                 style={[
//                   styles.completeBtn,
//                   showCheckboxes && !isChecked ? { backgroundColor: '#999' } : {}
//                 ]}
//                 onPress={handleCompleteSession}
//                 disabled={showCheckboxes && !isChecked}
//               >
//                 <Text style={styles.completeText}>
//                   {isChecked ? 'Add Feedback' : 'Complete Session'}
//                 </Text>
//               </TouchableOpacity>
//             )
//           )}
//         </>
//       )}

//       {/* Feedback Modal */}
//       {showFeedbackModal && (
//         <View style={styles.feedbackModal}>
//           <Text style={styles.modalTitle}>
//             Selected {Object.values(checkedItems).filter(Boolean).length}{' '}
//             students
//           </Text>
//           <Text style={styles.modalQuestion}>How was the performance?</Text>

//           {[
//             'Highly Attentive',
//             'Moderately Attentive',
//             'Not Attentive',
//             'Absent',
//           ].map((option, i) => (
//             <TouchableOpacity
//               key={i}
//               style={styles.radioOption}
//               onPress={() => setSelectedFeedback(option)}>
//               <View
//                 style={[
//                   styles.radioCircle,
//                   {
//                     borderColor: getOptionColor(option),
//                     backgroundColor:
//                       selectedFeedback === option
//                         ? getOptionColor(option)
//                         : 'transparent',
//                   },
//                 ]}
//               />
//               <Text style={[styles.radioText, { color: getOptionColor(option) }]}>
//                 {option}
//               </Text>
//             </TouchableOpacity>
//           ))}

//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={confirmFeedback}>
//             <Text style={styles.confirmButtonText}>Confirm</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Final Modal */}
//       {showFinalModal && (
//         <View style={styles.centeredModal}>
//           <Text style={styles.modalQuestion}>Select action for material</Text>

//           {['Continue material', 'Complete material'].map((action, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.radioOption}
//               onPress={() => setFinalAction(action)}>
//               <View
//                 style={[
//                   styles.radioCircle,
//                   {
//                     backgroundColor:
//                       finalAction === action ? '#0057FF' : 'transparent',
//                     borderColor: '#999',
//                   },
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.radioText,
//                   { color: finalAction === action ? '#5C2DFF' : '#888' },
//                 ]}>
//                 {action}
//               </Text>
//             </TouchableOpacity>
//           ))}

//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={confirmFinalAction}>
//             <Text style={styles.confirmButtonText}>Confirm</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default MentorDashboardAcademics;



import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import styles from './Academicssty'; // Assume styles are similar
import { API_URL } from '../../../../utils/env';

const MentorDashboardAcademics = ({ navigation, route }) => {
  const { activityId, subject, grade, section_name, startTime, endTime } = route.params;
  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);
  const [performances, setPerformances] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  // This effect runs after students are fetched to set the initial performance states
  useEffect(() => {
    if (students.length > 0) {
      const initialPerformances = students.reduce((acc, student) => {
        acc[student.roll] = student.has_approved_leave ? 'Absent' : null;
        return acc;
      }, {});
      setPerformances(initialPerformances);
    }
  }, [students]);

  const fetchActivityDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/academic`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setStudents(data.students);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch activity details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/start`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setActivity(prev => ({ ...prev, status: 'In Progress' }));
        Alert.alert('Success', 'Session has been started.');
      } else {
        Alert.alert('Error', data.message || 'Could not start the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const handleCompleteSession = async () => {

    const studentPerformances = Object.keys(performances).map(roll => ({
      student_roll: roll,
      performance: performances[roll],
    }));

    if (studentPerformances.some(p => p.performance === null)) {
      Alert.alert('Incomplete', 'Please mark the performance for all present students.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/mentor/activity/${activityId}/academic/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentPerformances }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Session completed.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', 'Could not complete the session.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving data.');
    }
  };

  const performanceOptions = ['Highly Attentive', 'Moderately Attentive', 'Not Attentive', 'Absent'];
  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sessionBox}>
        <Text style={styles.subject}>{subject} ({startTime} - {endTime})</Text>
        <Text style={styles.gradeText}>Grade {grade} - {section_name} | Academic</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {students.map(student => (
          <View key={student.roll} style={[styles.profileCard, student.has_approved_leave && { backgroundColor: '#f0f0f0' }]}>
            <Image source={{ uri: `${API_URL}/${student.profile_photo}`.replace(/\\/g, '/') }} style={styles.profileImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{student.name}</Text>
              <Text style={styles.profileId}>{student.roll}</Text>
              {student.has_approved_leave && <Text style={{ color: 'orange', fontSize: 12 }}>On Leave</Text>}
            </View>
            <View style={styles.performanceButtons}>
              {performanceOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.perfButton, performances[student.roll] === option && styles.selectedPerfButton]}
                  onPress={() => setPerformances(p => ({ ...p, [student.roll]: option }))}
                >
                  <Text style={styles.perfButtonText}>{option.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {activity?.status === 'Not Started' && <TouchableOpacity style={styles.completeBtn} onPress={handleStartSession}><Text style={styles.completeText}>Start Session</Text></TouchableOpacity>}
      {activity?.status === 'In Progress' && <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession}><Text style={styles.completeText}>Complete Session</Text></TouchableOpacity>}
      {activity?.status === 'Completed' && <View style={styles.disabledBtn}><Text style={styles.completeText}>Session Completed</Text></View>}

    </SafeAreaView>
  );
};

export default MentorDashboardAcademics;