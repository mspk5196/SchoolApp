import React, { useState } from "react";
import { View, Text, FlatList, Pressable, TouchableOpacity } from "react-native";
import Home from "../../../../assets/MentorPage/entypo_home.svg";
import Buffer from "../../../../assets/MentorPage/bufferActivity.svg";
import General from "../../../../assets/MentorPage/generalActivity.svg";
import Discipline from "../../../../assets/MentorPage/disciplineLog.svg";
import Emergency from "../../../../assets/MentorPage/emergencyLeave.svg";
import Survey from "../../../../assets/MentorPage/survey.svg";
import styles from "./Activitysty";

const MentorActivity = ({ navigation, route }) => {
  const [selectedId, setSelectedId] = useState(null);

  const {mentorData} = route.params;
  

  const data = [
    { id: 1, icon: <Buffer style={styles.icon} />, title: "Buffer Activity", textColor: "#0FBEB3", backgroundColor: '#C9F7F5' },
    { id: 2, icon: <General style={styles.icon} />, title: "General Activity", textColor: "#65558F", backgroundColor: '#65558F1F' },
    { id: 3, icon: <Discipline style={styles.icon} />, title: "Discipline Log", textColor: "#EEAA16", backgroundColor: '#FFF3DC' },
    { id: 4, icon: <Emergency style={styles.icon} />, title: "Emergency Leave", textColor: "#0FBEB3", backgroundColor: '#C9F7F5' },
    { id: 5, icon: <Survey style={styles.icon} />, title: "Survey", textColor: "#65558F", backgroundColor: '#65558F1F' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Home height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Activity</Text>
      </View>

      <View style={styles.activityList}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const handlePress = () => {
              switch (item.title) {
                case "Buffer Activity":
                  navigation.navigate("MentorBufferActivity",{mentorData});
                  break;
                case "General Activity":
                  navigation.navigate("MentorGeneralActivity",{mentorData});
                  break;
                case "Discipline Log":
                  navigation.navigate("MentorDisciplineLog",{mentorData});
                  break;
                case "Emergency Leave":
                  navigation.navigate("MentorEmergencyLeave",{mentorData});
                  break;
                case "Survey":
                  navigation.navigate("MentorSurvey",{mentorData});
                  break;
                default:
                  break;
              }
            };

            return (
              <Pressable
                style={[styles.item, { backgroundColor: item.backgroundColor }]}
                onPress={handlePress}>
                {item.icon}
                <Text style={[styles.itemText, { color: item.textColor }]}>
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />

      </View>
    </View>
  );
};

export default MentorActivity;
