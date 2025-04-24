import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import styles from "./Surveysty";
import Back from "../../assets/backarrow.svg";
import Add from "../../assets/Add.svg";
import Home from "../../assets/Home2.svg";

const Survey = ({navigation}) => {
  const data = [
    { id: 1, grade: "6", task: "Collect Fee", noofstd: 8, time: "Ends in 30min", status: "Active" },
    { id: 2, grade: "6", task: "Collect Fee", noofstd: 8, time: "3 days ago", status: "Inactive" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Survey</Text>
      </View>

      <View style={styles.underline} />

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <View style={styles.header}>
              <Text style={styles.title}>{item.task} - 1000</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: item.status === "Active" ? "#34C300" : "#EB4B42" }]} />
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
                <Text style={styles.gradeText}>Grade {item.grade}</Text>
                <Text style={[styles.time,item.status === "Active" ? styles.activeTime : styles.inactiveTime]}>
                {item.time}
                </Text>
            </View>

            <Text style={styles.studentCount}>{item.noofstd} Students</Text>

            {item.status === "Active" && (
              <TouchableOpacity style={styles.surveyButton}>
                <Text style={styles.surveyButtonText}>End Survey now</Text>
              </TouchableOpacity>
            )}

          </View>
        )}
      />

      <View style={styles.activityIcons}>
        <TouchableOpacity style={styles.addIcon} onPress={()=>navigation.navigate("surveyfolder")}>
          <Add />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeIcon} onPress={()=>navigation.navigate("MentorHomepage")}>
          <Home />
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default Survey;
