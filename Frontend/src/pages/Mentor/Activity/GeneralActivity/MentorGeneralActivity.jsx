import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "./GeneralActivitysty";
import Back from      "../../../../assets/MentorPage/backarrow.svg";
import Add from       "../../../../assets/MentorPage/Add.svg";
import Home from      "../../../../assets/MentorPage/Home2.svg";
import DownArrow from "../../../../assets/MentorPage/down.svg";

const mockData = [
  {
    id: '1',
    name: 'Faculty',
    code: '2024VI023',
    date: '29/10/23',
    tags: ['Fee Payment', 'Academic fee'],
    amount: '22,000',
    description: 'Nil',
  },
  {
    id: '2',
    name: 'Faculty',
    code: '2024VI023',
    date: '29/10/23',
    tags: ['Stationery collection'],
    amount: '1,200',
    description: 'Purchased pens and sheets',
  },
  {
    id: '3',
    name: 'Faculty',
    code: '2024VI023',
    date: '29/10/23',
    tags: ['Other'],
    amount: '-',
    description: 'Nil',
  },
];


const MentorGeneralActivity = ({ navigation, route }) => {
  const {mentorData} =route.params;
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const renderTags = (tags) => {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {tags.map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              tag === 'Fee Payment'
                ? styles.feeTag
                : tag === 'Academic fee'
                  ? styles.academicTag
                  : tag === 'Other'
                    ? styles.otherTag
                    : styles.defaultTag,
            ]}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.profileSection}>
          <View style={styles.profilePic} />
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.code}>{item.code}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.date}>{item.date}</Text>
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <DownArrow style={styles.arrowicon} />
          </TouchableOpacity>
        </View>
      </View>

      {renderTags(item.tags)}

      {expanded === item.id && (
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownLabel}>
            Amount : <Text style={styles.amountText}>{item.amount}</Text>
          </Text>
          <Text style={styles.dropdownLabel}>Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        </View>
      )}
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>General Activity</Text>
      </View>

      <View style={styles.underline} />

      <FlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.activityIcons}>
        <View style={styles.AddIcon}>
          <TouchableOpacity onPress={() => navigation.navigate("MentorGenrealActivityRegister",{mentorData})}><Add /></TouchableOpacity>
        </View>
        <View style={styles.HomeIcon}>
          <TouchableOpacity onPress={() => navigation.navigate("MentorMain",{mentorData})}><Home /></TouchableOpacity>
        </View>
      </View>


    </View>
  );
};

export default MentorGeneralActivity;
