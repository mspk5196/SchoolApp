import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "./AssessmentRequeststy";
import Back from  "../../../assets/MentorPage/entypo_home.svg";
import Add from   "../../../assets/MentorPage/Add.svg";
import Clock from "../../../assets/MentorPage/formkit_time.svg";

const assessmentData = [
  {
    id: "1",
    name: "Prakash Raj",
    staffId: "2024VI023",
    grade: "Grade 6 – A",
    subject: "Free period",
    time: "9:00 AM – 12:00 PM",
    students: 6,
    status: "Requested",
  },
  {
    id: "2",
    name: "Prakash Raj",
    staffId: "2024VI023",
    grade: "Grade 6 – A",
    subject: "Tamil",
    time: "9:00 AM – 12:00 PM",
    students: 6,
    status: "Requested",
  },
];

const MentorAssesmentRequest = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Assessment Request</Text>
      </View>

      <View style={styles.underline} />

      <FlatList
            data={assessmentData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <View style={styles.card}>
                <View style={styles.topInfo}>
                    <View style={styles.leftInfo}>
                    <View style={styles.profileCircle}>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.staffId}>{item.staffId}</Text>
                    </View>
                    </View>
                    <Text style={styles.status}>{item.status}</Text>
                </View>

                <View style={styles.timerow}>
                    <Text style={styles.grade}>{item.grade}</Text>
                    <Clock style={styles.clockicon}></Clock>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <Text style={styles.students}>{item.students} Students</Text>
                </View>

                <View style={styles.levelsRow}>
                    <TouchableOpacity style={styles.levelButton}>
                    <Text style={styles.levelText}>Level 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.levelButton}>
                    <Text style={styles.levelText}>Level 2</Text>
                    </TouchableOpacity>
                </View>
                </View>
            )}
            />


      <View style={styles.activityIcons}>
        <View style={styles.AddIcon}>
          <TouchableOpacity onPress={()=>navigation.navigate("MentorAssessmentRequestRegister")}>
            <Add />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MentorAssesmentRequest;
