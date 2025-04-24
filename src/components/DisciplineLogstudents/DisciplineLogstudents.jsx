import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import styles from "./DisciplineLogstudentsty";
import Back from "../../assets/backarrow.svg";
import SearchIcon from "../../assets/search.svg";
import DisciplineLogRegister from "../DisciplineLogRegister/DisciplineLogRegister";

const allUsers = [
  { id:"1", name:"Prakash Raj K", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"2", name:"Prakash Raj G N", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"3", name:"Prakash Raju P", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"4", name:"Prakash Raja K L", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"5", name:"Suganth R", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"6", name:"Sujith T", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"7", name:"Vishal A", stdid:"2024V1023", stdmentor:"Vishal"},
  { id:"8", name:"Mahesh R", stdid:"2024V1023", stdmentor:"Vishal"},
];

const DisciplineLogstudents = ({navigation}) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearchSelect = (item) => {
    setSelectedStudent(item);
    if (!recentSearches.find((i) => i.id === item.id)) {
      setRecentSearches([item, ...recentSearches]);
    }
    setQuery("");
  };

  if (selectedStudent) {
    return (
      <DisciplineLogRegister
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const filteredData = query
    ? allUsers.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Discipline Log</Text>
      </View>

      <View style={styles.underline} />

      <View style={styles.searchBar}>
        <SearchIcon width={20} height={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#767676"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {query !== "" ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleSearchSelect(item)}>
              <View style={styles.profilePic} />
              <View>
                <Text style={styles.userName}>{item.name}</Text>
              </View> 
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <Text style={styles.recentTitle}>Recent searches</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <View style={styles.profilePic}></View>
                <Text style={styles.userName}>{item.name}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default DisciplineLogstudents;
