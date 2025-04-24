import React, { useState } from "react";
import { View, Text, FlatList, Pressable, TouchableOpacity, Alert } from "react-native";
import styles from "./Materialssty";
import Home from "../../assets/entypo_home.svg";

const Materials = ({ navigation }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const subjects = [
    { id: 1, title: "Tamil", textColor: "#0FBEB3", backgroundColor: "#C9F7F5" },
    { id: 2, title: "English", textColor: "#65558F", backgroundColor: "#65558F1F" },
    { id: 3, title: "Maths", textColor: "#EEAA16", backgroundColor: "#FFF3DC" },
    { id: 4, title: "Science", textColor: "#0FBEB3", backgroundColor: "#C9F7F5" },
    { id: 5, title: "Social", textColor: "#65558F", backgroundColor: "#65558F1F" },
  ];

  const grades = [
    { id: 1, title: "Grade 1" },
    { id: 2, title: "Grade 2" },
    { id: 3, title: "Grade 3" },
    { id: 4, title: "Grade 4" },
  ];

  const handleGradePress = (item) => {
    setSelectedGrade(item.title);
    setSelectedId(item.id);
  };

  const handleSubjectPress = (subject) => {
    if (!selectedGrade) {
      Alert.alert("Please select a grade first.");
      return;
    }

    const grade = selectedGrade;

    switch (grade) {
      case "Grade 1":
        switch (subject.title) {
          case "Tamil":
            navigation.navigate("MaterialsUpdatedTamil1");
            break;
          case "English":
            navigation.navigate("MaterialsUpdatedEnglish1");
            break;
          case "Maths":
            navigation.navigate("MaterialsUpdatedMaths1");
            break;
          case "Science":
            navigation.navigate("MaterialsUpdatedScience1");
            break;
          case "Social":
            navigation.navigate("MaterialsUpdatedSocial1");
            break;
          default:
            break;
        }
        break;

      case "Grade 2":
        switch (subject.title) {
          case "Tamil":
            navigation.navigate("MaterialsUpdatedTamil2");
            break;
          case "English":
            navigation.navigate("MaterialsUpdatedEnglish2");
            break;
          case "Maths":
            navigation.navigate("MaterialsUpdatedMaths2");
            break;
          case "Science":
            navigation.navigate("MaterialsUpdatedScience2");
            break;
          case "Social":
            navigation.navigate("MaterialsUpdatedSocial2");
            break;
          default:
            break;
        }
        break;

      case "Grade 3":
        switch (subject.title) {
          case "Tamil":
            navigation.navigate("MaterialsUpdatedTamil3");
            break;
          case "English":
            navigation.navigate("MaterialsUpdatedEnglish3");
            break;
          case "Maths":
            navigation.navigate("MaterialsUpdatedMaths3");
            break;
          case "Science":
            navigation.navigate("MaterialsUpdatedScience3");
            break;
          case "Social":
            navigation.navigate("MaterialsUpdatedSocial3");
            break;
          default:
            break;
        }
        break;

      case "Grade 4":
        switch (subject.title) {
          case "Tamil":
            navigation.navigate("MaterialsUpdatedTamil4");
            break;
          case "English":
            navigation.navigate("MaterialsUpdatedEnglish4");
            break;
          case "Maths":
            navigation.navigate("MaterialsUpdatedMaths4");
            break;
          case "Science":
            navigation.navigate("MaterialsUpdatedScience4");
            break;
          case "Social":
            navigation.navigate("MaterialsUpdatedSocial4");
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Home height={28} width={28} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Materials</Text>
      </View>

      <View style={styles.underline} />

      <View style={styles.activityList}>
        <FlatList
          data={grades}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.gradeItem, selectedId === item.id && styles.selectedGrade]}
              onPress={() => handleGradePress(item)}
            >
              <Text
                style={[styles.gradeText, selectedId === item.id && styles.selectedGradeText]}
              >
                {item.title}
              </Text>
            </Pressable>
          )}
        />

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.item, { backgroundColor: item.backgroundColor }]}
              onPress={() => handleSubjectPress(item)}
            >
              <Text style={[styles.itemText, { color: item.textColor }]}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
};

export default Materials;
