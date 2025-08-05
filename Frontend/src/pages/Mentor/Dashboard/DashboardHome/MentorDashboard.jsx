import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import styles from "./Dashboardsty";
import Home from "../../../../assets/MentorPage/entypo_home.svg";
import RightArrow from "../../../../assets/MentorPage/rightarrow.svg";
import LeftArrow from "../../../../assets/MentorPage/leftarrow.svg";
import User from "../../../../assets/MentorPage/User.svg";
import Edit from "../../../../assets/MentorPage/edit.svg";
import VenueIcon from "../../../../assets/MentorPage/venue.svg";
import FacultyIcon from "../../../../assets/MentorPage/faculty2.svg";
import SubjectIcon from "../../../../assets/MentorPage/subject.svg";
import ActivityIcon from "../../../../assets/MentorPage/activity2.svg";
import { API_URL } from "../../../../utils/env.js";

const MentorDashboard = ({ route }) => {
  const { mentorData } = route.params;

  const navigation = useNavigation();
  const subjectOptions = ["Tamil", "English", "Maths", "Science"];
  const activityOptions = ["Assessment", "Academic", "Outdoor Activity"];

  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [subjectDropdownVisible, setSubjectDropdownVisible] = useState(false);
  const [activityDropdownVisible, setActivityDropdownVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAttentionLoading, setIsAttentionLoading] = useState(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [overdueStudents, setOverdueStudents] = useState([]);
  const [coordinatorTasks, setCoordinatorTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch subjects and activities when section is available
  useEffect(() => {
    // console.log("Selected Schedule:", selectedSchedule);

    if (selectedSchedule && selectedSchedule.section_id) {
      setSelectedSection(selectedSchedule.section_id);
      fetchSectionSubjects(selectedSchedule.section_id);
    }
  }, [selectedSchedule]);

  useEffect(() => {
    fetch(`${API_URL}/api/mentor/createTodayAssessmentSessions`, { method: 'POST' });
  }, [])

  useEffect(() => {
    fetchOverdueStudents();
    fetchCoordinatorTasks();
  }, []);

  const fetchOverdueStudents = async () => {
    try {
      setIsAttentionLoading(true);
      const response = await fetch(`${API_URL}/api/mentor/getOverdueStudents?mentorId=${mentorData[0].id}`);
      const data = await response.json();
      if (data.success) {
        setOverdueStudents(data.overdueStudents);
      }
    } catch (error) {
      console.error('Error fetching overdue students:', error);
    } finally {
      setIsAttentionLoading(false);
    }
  };

  const fetchCoordinatorTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getCoordinatorTasks?mentorId=${mentorData[0].id}`);
      const data = await response.json();
      if (data.success) {
        setCoordinatorTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching coordinator tasks:', error);
    }
  };

  // const attentionList = [
  //   {
  //     id: "1",
  //     name: "Prakash Raj",
  //     studentId: "2024VI023",
  //     subject: "Science",
  //     pending: "4 days",
  //     count: 2,
  //   },
  //   {
  //     id: "2",
  //     name: "Asha Rani",
  //     studentId: "2024VI011",
  //     subject: "Maths",
  //     pending: "2 days",
  //     count: 1,
  //   },
  //   {
  //     id: "3",
  //     name: "Prakash Raj",
  //     studentId: "2024VI023",
  //     subject: "Science",
  //     pending: "4 days",
  //     count: 2,
  //   },
  //   {
  //     id: "4",
  //     name: "Asha Rani",
  //     studentId: "2024VI011",
  //     subject: "Maths",
  //     pending: "2 days",
  //     count: 1,
  //   },
  // ];

  // Fetch schedule data when date changes
  
  useEffect(() => {
    fetchScheduleData();
  }, [date]);

  const fetchScheduleData = async () => {
    setIsScheduleLoading(true);
    try {
      const formattedDate = formatDateForAPI(date);
      const response = await fetch(`${API_URL}/api/mentor/daily-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId: mentorData[0].id,
          date: formattedDate
        }),
      });

      const data = await response.json();
      if (data.success) {
        setScheduleData(data.scheduleData);
        // console.log("Schedule Data:", data.scheduleData);

      } else {
        console.error('Failed to fetch schedule data');
        setScheduleData([]);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setScheduleData([]);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const formatDateForAPI = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const changeDate = (direction) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    setDate(newDate);
  };

  const formatDate = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  function convertDateFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const getDayLabel = (dateObj) => {
    const today = new Date();
    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    return isToday ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  function parseTimeWithAmPmToDate(timeStr, targetDate = new Date()) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const date = new Date(targetDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchOverdueStudents(),
        fetchCoordinatorTasks(),
        fetchScheduleData()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openEditModal = async (item) => {
    const now = new Date();
    const sessionDate = new Date(date); // item.date should be "YYYY-MM-DD"
    // console.log("Session Date:", date);
    // console.log("Current Date:", now);

    // CASE 1: Prevent for past dates
    const isPastDate = sessionDate < new Date(now.toDateString());
    if (isPastDate) {
      Alert.alert("You cannot edit past sessions");
      return;
    }

    // CASE 2: For today's sessions, check if session end time is within 5 mins
    const todayStr = now.toISOString().split("T")[0];
    if (item.date === todayStr) {
      const endDateTime = parseTimeWithAmPmToDate(item.end_time, sessionDate);
      const fiveMinBeforeEnd = new Date(endDateTime.getTime() - 5 * 60000);

      if (now >= fiveMinBeforeEnd) {
        Alert.alert("Too late to edit this session");
        return;
      }
    }

    // Allowed — open modal
    setSelectedSchedule(item);
    setModalVisible(true);
    setSelectedSubject(null);
    setSelectedActivity(null);
  };


  const fetchSectionSubjects = async (sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getSectionSubjectsforSchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
      } else {
        console.error('Failed to fetch section subjects');
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching section subjects:', error);
      setSubjects([]);
    }
  };

  const fetchMentorForSubject = async (subjectId, sectionId) => {
    try {
      const response = await fetch(`${API_URL}/api/mentor/getMentorForSubject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_id: subjectId,
          section_id: sectionId
        }),
      });

      const data = await response.json();
      return data.success ? data.mentor : null;
    } catch (error) {
      console.error('Error fetching mentor:', error);
      return null;
    }
  };

  const handleUpdateSubject = async () => {
    if (!selectedSubject || !selectedActivity) {
      Alert.alert('Please select both subject and activity');
      return;
    }

    try {
      // Find the selected subject from our subjects list
      const subject = subjects.find(s => s.subject_id === selectedSubject);
      if (!subject) {
        Alert.alert('Invalid subject selection');
        return;
      }

      // Find the selected activity in the subject's activities
      const activity = subject.activities.find(a => a.activity_type === selectedActivity);
      if (!activity) {
        Alert.alert('Invalid activity selection');
        return;
      }

      // Get the mentor for this subject and section
      const mentor = await fetchMentorForSubject(selectedSubject, selectedSection);
      if (!mentor) {
        Alert.alert('No mentor assigned for this subject');
        return;
      }

      // Update the schedule
      const updateResponse = await fetch(`${API_URL}/api/mentor/updateDailySchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_schedule_id: selectedSchedule.id,
          date: formatDateForAPI(date),
          mentor_id: mentor.mentor_id,
          subject_id: selectedSubject,
          activity_type: selectedActivity
        }),
      });

      const updateData = await updateResponse.json();
      if (updateData.success) {
        Alert.alert('Schedule updated successfully');
        fetchScheduleData(); // Refresh the schedule
        setModalVisible(false);
      } else {
        Alert.alert('Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      Alert.alert('Error updating schedule');
    }
  };

  const handleUpdateActivity = async () => {
    if (!selectedActivity) {
      Alert.alert('Please select an activity');
      return;
    }

    try {
      // Update the activity
      const updateResponse = await fetch(`${API_URL}/api/mentor/updateDailyScheduleActivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_schedule_id: selectedSchedule.id,
          date: formatDateForAPI(date),
          activity_type: selectedActivity
        }),
      });

      const updateData = await updateResponse.json();
      if (updateData.success) {
        Alert.alert('Activity updated successfully');
        fetchScheduleData(); // Refresh the schedule
        setModalVisible(false);
      } else {
        Alert.alert('Failed to update activity');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      Alert.alert('Error updating activity');
    }
  };

  const handleConfirm = () => {
    if (selectedAction === "Subject") {
      handleUpdateSubject();
    } else if (selectedAction === "Activity") {
      handleUpdateActivity();
    }
  };

  const renderEditModal = () => {
    return (
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose the action to change schedule</Text>

            {/* Action selection */}
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
                onPress={() => {
                  setSelectedAction("Subject");
                  setSubjectDropdownVisible(false);
                  setActivityDropdownVisible(false);
                }}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: selectedAction === "Subject" ? "#6366F1" : "#D1D5DB",
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8
                }}>
                  {selectedAction === "Subject" && (
                    <View style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: "#6366F1"
                    }} />
                  )}
                </View>
                <Text style={{ color: selectedAction === "Subject" ? "#6366F1" : "#9CA3AF" }}>Subject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
                onPress={() => {
                  setSelectedAction("Activity");
                  setSubjectDropdownVisible(false);
                  setActivityDropdownVisible(false);
                }}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: selectedAction === "Activity" ? "#6366F1" : "#D1D5DB",
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8
                }}>
                  {selectedAction === "Activity" && (
                    <View style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: "#6366F1"
                    }} />
                  )}
                </View>
                <Text style={{ color: selectedAction === "Activity" ? "#6366F1" : "#9CA3AF" }}>Activity</Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic content based on selection */}
            {selectedAction === "Subject" && (
              <>
                <Text style={styles.label}>Choose the subject for this class</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSubjectDropdownVisible(!subjectDropdownVisible);
                    setActivityDropdownVisible(false);
                  }}
                  style={styles.input}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>
                      {selectedSubject
                        ? subjects.find(s => s.subject_id === selectedSubject)?.subject_name
                        : "Select Subject"}
                    </Text>
                    <Text>▼</Text>
                  </View>
                </TouchableOpacity>

                {subjectDropdownVisible && (
                  <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, maxHeight: 150 }}>
                    <FlatList
                      data={subjects}
                      keyExtractor={(item) => item.subject_id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                          onPress={() => {
                            setSelectedSubject(item.subject_id);
                            setSubjectDropdownVisible(false);
                            setSelectedActivity(''); // Reset activity when subject changes
                          }}
                        >
                          <Text>{item.subject_name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                <Text style={styles.label}>Choose the activity for this class</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!selectedSubject) {
                      Alert.alert('Please select a subject first');
                      return;
                    }
                    setActivityDropdownVisible(!activityDropdownVisible);
                    setSubjectDropdownVisible(false);
                  }}
                  style={styles.input}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>
                      {selectedActivity
                        ? subjects.find(s => s.subject_id === selectedSubject)
                          ?.activities.find(a => a.activity_type === selectedActivity)?.activity_name
                        : "Select Activity"}
                    </Text>
                    <Text>▼</Text>
                  </View>
                </TouchableOpacity>

                {activityDropdownVisible && selectedSubject && (
                  <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, maxHeight: 150 }}>
                    <FlatList
                      data={subjects.find(s => s.subject_id === selectedSubject)?.activities || []}
                      keyExtractor={(item) => item.activity_type.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                          onPress={() => {
                            setSelectedActivity(item.activity_type);
                            setActivityDropdownVisible(false);
                          }}
                        >
                          <Text>{item.activity_name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </>
            )}

            {selectedAction === "Activity" && selectedSchedule && (
              <>
                <Text style={styles.label}>Current Subject: {selectedSchedule.subject}</Text>
                <Text style={styles.label}>Choose the activity for this class</Text>
                <TouchableOpacity
                  onPress={() => {
                    setActivityDropdownVisible(!activityDropdownVisible);
                  }}
                  style={styles.input}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>
                      {selectedActivity
                        ? subjects.find(s => s.subject_id === selectedSchedule.subject_id)
                          ?.activities.find(a => a.activity_type === selectedActivity)?.activity_name
                        : "Select Activity"}
                    </Text>
                    <Text>▼</Text>
                  </View>
                </TouchableOpacity>

                {activityDropdownVisible && (
                  <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, maxHeight: 150 }}>
                    <FlatList
                      data={subjects.find(s => s.subject_id === selectedSchedule.subject_id)?.activities || []}
                      keyExtractor={(item) => item.activity_type.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                          onPress={() => {
                            setSelectedActivity(item.activity_type);
                            setActivityDropdownVisible(false);
                          }}
                        >
                          <Text>{item.activity_name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </>
            )}

            {/* Confirm button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#4F46E5',
                borderRadius: 8,
                padding: 15,
                alignItems: 'center',
                marginTop: 20,
              }}
              onPress={handleConfirm}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return User;
    }
  };

  // Shimmer Loading Components
  const AttentionShimmer = React.memo(() => (
    <View style={styles.attentionLoadingContainer}>
      {[1, 2].map((item) => (
        <View key={item} style={styles.attentionShimmerCard}>
          <View style={styles.shimmerAvatar} />
          <View style={styles.shimmerContent}>
            <View style={[styles.shimmerLine, styles.shimmerLineMedium]} />
            <View style={[styles.shimmerLine, styles.shimmerLineShort]} />
          </View>
        </View>
      ))}
    </View>
  ));

  const ScheduleShimmer = React.memo(() => (
    <View style={styles.sectionLoadingContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.shimmerScheduleCard}>
          <View style={styles.shimmerTime}>
            <View style={styles.shimmerTimeSlot} />
            <View style={styles.shimmerTimeSlot} />
          </View>
          <View style={styles.shimmerScheduleMain}>
            <View style={[styles.shimmerLine, styles.shimmerLineLong]} />
            <View style={[styles.shimmerLine, styles.shimmerLineMedium]} />
            <View style={[styles.shimmerLine, styles.shimmerLineShort]} />
          </View>
        </View>
      ))}
    </View>
  ));

  const NoDataComponent = React.memo(({ title, subtitle, onRetry, showRetry = false }) => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataTitle}>{title}</Text>
      <Text style={styles.noDataSubtitle}>{subtitle}</Text>
      {showRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  ));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Home height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Dashboard</Text>
      </View>

      {/* Attention Section */}
      <View style={{ flex: 4 }}>
        <Text style={styles.sectionTitle1}>Attentions</Text>
        {isAttentionLoading ? (
          <AttentionShimmer />
        ) : (
          <FlatList
            horizontal
            data={[...overdueStudents, ...coordinatorTasks]}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            contentContainerStyle={{ 
              paddingTop: 10, 
              paddingBottom: 10,
              flexGrow: 1
            }}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ width: 350, height: 100 }}>
                <NoDataComponent 
                  title="No Attentions Available"
                  subtitle="All tasks are up to date. Great work!"
                />
              </View>
            }
            renderItem={({ item, index }) => (
              <Pressable onPress={() => navigation.navigate("MentorDashboardAttentions", { mentorData })}>
                <View style={[
                  styles.attentionBox,
                  {
                    marginRight: 10,
                    backgroundColor: item.days_overdue >= 10 ? '#FFE4E6' : '#FFF7ED'
                  }
                ]}>
                  {index === 0 && (overdueStudents.length + coordinatorTasks.length) > 0 && (
                    <View style={styles.attentionNotification}>
                      <Text style={styles.attentionNotificationText}>
                        {overdueStudents.length + coordinatorTasks.length}
                      </Text>
                    </View>
                  )}
                  <View style={styles.attentionLeft}>
                    {/* <User width={50} height={50} /> */}
                    {item.profile_photo ? (
                      <Image
                        source={getProfileImageSource(item.profile_photo)}
                        style={{borderRadius:50}}
                        width={50} height={50}
                      />
                    ) : (
                      <Image source={User} style={{borderRadius:50}} width={50} height={50} />
                    )}
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.attentionName}>{item.student_name}</Text>
                      <Text style={styles.attentionId}>{item.student_roll}</Text>
                    </View>
                  </View>
                  <View style={styles.attentionRight}>
                    <Text style={styles.attentionSubject}>{item.subject_name}</Text>
                    <Text style={[
                      styles.attentionPending,
                      { color: item.days_overdue >= 10 ? '#EF4444' : '#F97316' }
                    ]}>
                      {item.days_overdue} days
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* Schedule Header */}
      <View style={{ flex: 15 }}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionTitle2}>Schedule</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dayText}>{getDayLabel(date)}</Text>
            <TouchableOpacity onPress={() => changeDate("prev")}>
              <LeftArrow width={27} height={27} style={{ marginHorizontal: 10 }} />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <TouchableOpacity onPress={() => changeDate("next")}>
              <RightArrow width={20} height={20} style={{ marginHorizontal: 10 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Cards */}
        {isScheduleLoading ? (
          <ScheduleShimmer />
        ) : (
          <FlatList
            data={scheduleData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 50 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4F46E5']}
                tintColor={'#4F46E5'}
              />
            }
            ListEmptyComponent={
              <NoDataComponent 
                title="No Schedule Available"
                subtitle="There are no classes scheduled for this date."
                onRetry={fetchScheduleData}
                showRetry={true}
              />
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => {
                if (item.activity === 'Academic') {
                  console.log("Hi", convertDateFormat(formatDate(date)));
                  // console.log(item.subject_id),
                  navigation.navigate("MentorDashboardAcademics", {
                    sessionId: item.dsa_id, // You'll need to pass the actual session ID
                    subject: item.subject,
                    subject_id: item.subject_id,
                    grade: item.grade,
                    section: item.section_id,
                    section_name: item.section,
                    duration: item.duration,
                    startTime: item.starttime,
                    endTime: item.endtime,
                    date: convertDateFormat(formatDate(date)),
                  });
                } else {
                  // Handle other activity types
                  navigation.navigate("MentorDashboardAssessment", {
                    sessionId: item.dsa_id, // You'll need to pass the actual session ID
                    subject: item.subject,
                    subject_id: item.subject_id,
                    grade: item.grade,
                    section: item.section_id,
                    section_name: item.section,
                    duration: item.duration,
                    startTime: item.starttime,
                    endTime: item.endtime,
                    date: convertDateFormat(formatDate(date)),
                  })
                }
              }}>
                <View style={styles.scheduleBox}>
                  <View style={styles.scheduleItem}>
                    <View style={styles.scheduleTime}>
                      <Text style={styles.starttimeText}>{item.starttime}</Text>
                      <Text style={styles.endtimeText}>{item.endtime}</Text>
                    </View>
                    <View style={[styles.scheduleCard, { backgroundColor: item.bgColor }]}>
                      {/* Edit icon absolutely positioned in left corner */}
                      <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => openEditModal(item)}
                      >
                        <Edit width={20} height={20} />
                      </TouchableOpacity>

                      <View style={[styles.sideLine, { backgroundColor: item.sideColor }]} />
                      <View style={styles.scheduleInfo}>
                        <Text style={styles.subjectText}>{item.subject}</Text>
                        <Text style={styles.gradeText}>Grade {item.grade} - {item.section}</Text>
                        <View style={styles.activityStyle}>
                          <Text style={[styles.typeText, { color: item.fontColor }]}>
                            {item.activity}
                          </Text>
                          <Text style={styles.durationText}>{item.duration}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}

      </View>

      {/* Render the Edit Modal */}
      {renderEditModal()}
    </View>
  );
};

export default MentorDashboard;