import React, {useState} from 'react';
import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';
import styles from './EmergencyLeavesty';
import Back from       '../../../../assets/MentorPage/backarrow.svg';
import SearchIcon from '../../../../assets/MentorPage/search.svg';
import History from    '../../../../assets/MentorPage/history3.svg';

const MentorEmergencyLeave = ({navigation}) => {

    const data = [
        {stdid: "2024VIO23", stdName:"Prakash Raj"},
        {stdid: "2024VIO23", stdName:"Prakash Raj"},
        {stdid: "2024VIO23", stdName:"Prakash Raj"},
        {stdid: "2024VIO23", stdName:"Prakash Raj"},
        {stdid: "2024VIO23", stdName:"Prakash Raj"},
      ]

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Back height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Emergency Leave</Text>
      </View>

    <View style={styles.underline} />

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

    <View>
        <TouchableOpacity onPress={() => navigation.navigate("MentorEmergencyLeaveHistory")}> 
            <History style={styles.historyIcon} />
        </TouchableOpacity>
    </View>

    </View>
        <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
            <View style={styles.card}>
            <View style={styles.leftSection}>
            <View style={styles.profilePic} />
                <View>
                    <TouchableOpacity>
                        <Text style={styles.name}>{item.stdName}</Text>
                    </TouchableOpacity>
                    <Text style={styles.studentId}>{item.stdid}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
    </View>
  )}
/>


    </View>
  );
};
export default MentorEmergencyLeave;
