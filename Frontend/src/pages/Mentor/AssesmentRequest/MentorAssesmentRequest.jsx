import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, Image } from "react-native";
import styles from "./AssessmentRequeststy";
import { API_URL } from "@env";
import Back from "../../../assets/MentorPage/entypo_home.svg";
import Add from "../../../assets/MentorPage/Add.svg";
import Clock from "../../../assets/MentorPage/formkit_time.svg";
const Staff = '../../../../assets/MentorPage/User.svg';

const MentorAssesmentRequest = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [assessments, setAssessments] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchAssessmentRequests();
  }, []);

  const convertToISTDate = (isoString) => {
    const date = new Date(isoString);

    // Convert to IST by adding 5.5 hours (19800000 ms)
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

    // Format as "YYYY-MM-DD"
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  };

  const fetchAssessmentRequests = () => {
    fetch(`${API_URL}/api/mentor/getAssessmentRequests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentorId: mentorData[0].id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAssessments(data.assessments);
          // console.log("Fetched assessments:", data.assessments);

        }
      })
      .catch(error => console.error('Error fetching assessments:', error));
  };

  const fetchStudentsForAssessment = (assessmentId, level) => {
    fetch(`${API_URL}/api/mentor/getAssessmentStudents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assessmentId, level }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStudents(data.students);
        }
      })
      .catch(error => console.error('Error fetching students:', error));
  };

  const toggleStudentsList = (itemId, level) => {
    if (expandedItem === itemId && selectedLevel === level) {
      setExpandedItem(null);
      setSelectedLevel(null);
    } else {
      setExpandedItem(itemId);
      setSelectedLevel(level);
      fetchStudentsForAssessment(itemId, level);
    }
  };

  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    } else {
      return Profile;
    }
  };

  const renderStudentItem = (item) => (
    <View style={styles.studentCard} key={item.id}>
      <View style={styles.studentInfo}>
        {/* <View style={styles.profileCircle}></View> */}
        {item.profile_photo ? (
          <Image source={getProfileImageSource(item.profile_photo)} style={styles.profileCircle} />
        ) : (
          <Image source={Staff} style={styles.profileCircle} />
        )}
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.roll}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Assessment Request</Text>
      </View>

      <View style={styles.underline} />

      <FlatList
        data={assessments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <>
            <View style={styles.card}>
              <View style={styles.topInfo}>
                <View style={styles.leftInfo}>
                  {/* <View style={styles.profileCircle}></View> */}
                  {item.file_path ? (
                    <Image source={getProfileImageSource(item.file_path)} style={styles.profileCircle} />
                  ) : (
                    <Image source={Staff} style={styles.profileCircle} />
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.name}>{item.subject_name}</Text>
                    <Text style={styles.staffId}>{item.grade_name} - {item.section_name}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.status,
                  item.status === 'Approved' ? styles.approvedStatus :
                    item.status === 'Rejected' ? styles.rejectedStatus :
                      styles.pendingStatus
                ]}>
                  {item.status}
                </Text>
              </View>

              <View style={styles.timerow}>
                <Text style={styles.grade}>{convertToISTDate(item.date)}</Text>
                <Clock style={styles.clockicon}></Clock>
                <Text style={styles.time}>{item.time_range}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.students}>{item.student_count} Students</Text>
              </View>

              <View style={styles.levelsRow}>

                <FlatList
                  data={item.levels}
                  keyExtractor={(level) => level.toString()}
                  horizontal
                  renderItem={({ item: level }) => (
                    <TouchableOpacity
                      style={[
                        styles.levelButton,
                        expandedItem === item.id && selectedLevel === level ? styles.activeLevel : {}
                      ]}
                      onPress={() => toggleStudentsList(item.id, level)}
                    >
                      <Text style={styles.levelText}>Level {level}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            {expandedItem === item.id && (
              <View style={styles.studentsContainer}>
                {students.map((student) => renderStudentItem(student))}
              </View>
            )}
          </>
        )}
      />

      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate("MentorAssessmentRequestRegister", { mentorId: mentorData[0].id })}
          style={styles.activityIcons}
        >
          <Add />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MentorAssesmentRequest;