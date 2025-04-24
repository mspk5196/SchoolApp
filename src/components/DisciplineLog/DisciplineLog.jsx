import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import styles from "./DisciplineLogsty";
import Back from "../../assets/entypo_home.svg";
import Add from "../../assets/Add.svg";
import SearchIcon from "../../assets/search.svg";
import Call from "../../assets/call.svg";
import Message from "../../assets/text.svg";

const DisciplineLog = ({navigation}) => {
  const data = [
    {
      stdid: "2024VIO23",
      title: "Faculty",
      reason:
        "Student is saying that he came along with parents to school, and he is late to school because of traffic.",
      date: "29/10/25",
      registeredBy: "Sasikumar",
    },
    {
      stdid: "2024VIO23",
      title: "Faculty",
      reason:
        "Student is saying that he came along with parents to school, and he is late to school because of traffic.",
      date: "29/10/25",
      registeredBy: "Sasikumar",
    },
    {
      stdid: "2024VIO23",
      title: "Faculty",
      reason:
        "Student is saying that he came along with parents to school, and he is late to school because of traffic.",
      date: "29/10/25",
      registeredBy: "Sasikumar",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}> 
            <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Discipline log</Text>
      </View>

      <View style={styles.searchView}>
        <View style={styles.searchBar}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#767676"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.row}>
                <View style={styles.profilePic} />
                <View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.stdid}>{item.stdid}</Text>
                </View>
              </View>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Text style={styles.reasonTitle}>Reason</Text>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Text style={styles.registeredText}>Registered by {item.registeredBy}</Text>
              <View width={40} height={40} style={styles.callButton}>
              <TouchableOpacity>
                  <Call/>
              </TouchableOpacity>
              </View>
              <View width={40} height={40} style={styles.chatButton}>
              <TouchableOpacity>
                  <Message />
              </TouchableOpacity>
              </View>
            </View>
        </View>
        )}
      />

      <View style={styles.activityIcons}>
        <View style={styles.AddIcon}>
          <TouchableOpacity onPress={() => navigation.navigate("DisciplineLogstudents")}><Add /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DisciplineLog;
