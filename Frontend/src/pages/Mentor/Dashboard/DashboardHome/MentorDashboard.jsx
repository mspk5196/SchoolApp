import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
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

const MentorDashboard = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [fieldModalVisible, setFieldModalVisible] = useState(null); // subject, faculty, activity, venue
  const [fieldValues, setFieldValues] = useState({
    subject: "",
    faculty: "",
    activity: "",
    venue: "",
  });

  const options = {
    subject: ["Mathematics", "Science", "English"],
    faculty: ["John Smith", "Priya Mehta", "Arun Sharma"],
    activity: ["Academic", "Sports", "Arts"],
    venue: ["Room A1", "Lab 2", "Ground"],
  };

  const scheduleData = [
    {
      id: "1",
      subject: "Mathematics",
      grade: "Grade VI - A",
      activity: "Academic",
      starttime: "09:30 AM",
      endtime: "10:30 AM",
      duration: "60 min",
      bgColor: "#F8ECD2A8",
      sideColor: "#EF7B0E",
      fontColor: "#EF7B0E",
    },
    {
      id: "2",
      subject: "Science",
      grade: "Grade VI - A",
      activity: "Academic",
      starttime: "10:30 AM",
      endtime: "11:30 AM",
      duration: "60 min",
      bgColor: "#9BD6EE3B",
      sideColor: "#1857C0",
      fontColor: "#1857C0",
    },
    {
      id: "3",
      subject: "Mathematics",
      grade: "Grade VI - A",
      activity: "Academic",
      starttime: "09:30 AM",
      endtime: "10:30 AM",
      duration: "60 min",
      bgColor: "#F8ECD2A8",
      sideColor: "#EF7B0E",
      fontColor: "#EF7B0E",
    },
    {
      id: "4",
      subject: "Science",
      grade: "Grade VI - A",
      activity: "Academic",
      starttime: "10:30 AM",
      endtime: "11:30 AM",
      duration: "60 min",
      bgColor: "#9BD6EE3B",
      sideColor: "#1857C0",
      fontColor: "#1857C0",
    },
  ];

  const attentionList = [
    {
      id: "1",
      name: "Prakash Raj",
      studentId: "2024VI023",
      subject: "Science",
      pending: "4 days",
      count: 2,
    },
    {
      id: "2",
      name: "Asha Rani",
      studentId: "2024VI011",
      subject: "Maths",
      pending: "2 days",
      count: 1,
    },
    {
      id: "3",
      name: "Prakash Raj",
      studentId: "2024VI023",
      subject: "Science",
      pending: "4 days",
      count: 2,
    },
    {
      id: "4",
      name: "Asha Rani",
      studentId: "2024VI011",
      subject: "Maths",
      pending: "2 days",
      count: 1,
    },
  ];

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

  const getDayLabel = (dateObj) => {
    const today = new Date();
    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    return isToday ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  const openEditModal = (item) => {
    setSelectedSchedule(item);
    setFieldValues({
      subject: item.subject,
      faculty: "",
      activity: item.activity,
      venue: "",
    });
    setModalVisible(true);
  };

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
      <Text style={styles.sectionTitle1}>Attentions</Text>
      <FlatList
        horizontal
        data={attentionList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => navigation.navigate("MentorDashboardAttentions")}>
            <View style={[styles.attentionBox, { marginRight: 10 }]}>
              {index === 0 && (
                <View style={styles.attentionNotification}>
                  <Text style={styles.attentionNotificationText}>{attentionList.length}</Text>
                </View>
              )}
              <View style={styles.attentionLeft}>
                <User width={50} height={50} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.attentionName}>{item.name}</Text>
                  <Text style={styles.attentionId}>{item.studentId}</Text>
                </View>
              </View>
              <View style={styles.attentionRight}>
                <Text style={styles.attentionSubject}>{item.subject}</Text>
                <Text style={styles.attentionPending}>{item.pending}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Schedule Header */}
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
      <FlatList
        data={scheduleData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("MentorDashboardAcadamics")}>
            <View style={styles.scheduleBox}>
              <View style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.starttimeText}>{item.starttime}</Text>
                  <Text style={styles.endtimeText}>{item.endtime}</Text>
                </View>
                <View style={[styles.scheduleCard, { backgroundColor: item.bgColor }]}>
                  <View style={[styles.sideLine, { backgroundColor: item.sideColor }]} />
                  <View style={styles.scheduleInfo}>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.subjectText}>{item.subject}</Text>
                        <TouchableOpacity
                          style={styles.editIcon}
                          onPress={() => openEditModal(item)}
                        >
                          <Edit width={20} height={20} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.gradeText}>{item.grade}</Text>
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
            </View>
          </Pressable>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Activity</Text>

            {["subject", "faculty", "activity", "venue"].map((field) => (
              <View key={field}>
                <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                <TouchableOpacity onPress={() => setFieldModalVisible(field)}>
                  <View style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                    <Text style={{ color: "#333" }}>{fieldValues[field] || `Select ${field}`}</Text>
                    <View style={{ backgroundColor: "#E8F0FE", padding: 6, borderRadius: 4 }}>
                      {field === "subject" && <SubjectIcon />}
                      {field === "faculty" && <FacultyIcon />}
                      {field === "activity" && <ActivityIcon />}
                      {field === "venue" && <VenueIcon />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.buttonRow, { marginTop: 30 }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: "#F5F5F5", flex: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: "#333" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#0C36FF", flex: 1 }]}
                onPress={() => {
                  // Save logic can be added here
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.saveButtonText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Field Select Modal */}
      <Modal visible={!!fieldModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: 300 }]}>
            <Text style={styles.modalTitle}>Select {fieldModalVisible}</Text>
            <FlatList
              data={options[fieldModalVisible] || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" }}
                  onPress={() => {
                    setFieldValues({ ...fieldValues, [fieldModalVisible]: item });
                    setFieldModalVisible(null);
                  }}
                >
                  <Text style={{ color: "#333" }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MentorDashboard;
