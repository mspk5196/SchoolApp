import React, {useState} from 'react';
import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';
import styles from './EmergencyLeaveHistorysty';
import Back from       '../../../../assets/MentorPage/backarrow.svg';
import SearchIcon from '../../../../assets/MentorPage/search.svg';
import CallParent from '../../../../assets/MentorPage/callparent.svg';
import Clock from      '../../../../assets/MentorPage/clock.svg';

const MentorEmergencyLeaveHistory = ({navigation}) => {

    const [searchQuery, setSearchQuery] = useState('');

    const data = [
        {stdid: "2024VIO23",
         stdName:"Prakash Raj", 
         description:"Due to high fever and cold, student is willing to go home.",
         time:"01.00 PM" },

        {stdid: "2024VIO23",
         stdName:"Prakash Raj", 
         description:"Due to high fever and cold, student is willing to go home.",
         time:"01.00 PM" },

        {stdid: "2024VIO23",
         stdName:"Prakash Raj",     
         description:"Due to high fever and cold, student is willing to go home.",
         time:"01.00 PM" },
    ];

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
        </View>

        <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
            <View style={styles.card}>
      
            <View style={styles.header}>
                <View style={styles.leftSection}>
                <View style={styles.profilePic} />
                    <View>
                        <Text style={styles.name}>{item.stdName}</Text>
                        <Text style={styles.studentId}>{item.stdid}</Text>
                    </View>
                </View>
                <View style={styles.timeContainer}>
                    <Clock style={styles.clockicon}/>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
            </View>

            <Text style={styles.descriptionLabel}>Description</Text>
            <View style={styles.descriptionBox}>
            <View style={styles.redLine} />
            <Text style={styles.descriptionText}>{item.description}</Text>
            </View>

            <TouchableOpacity style={styles.callButton}>
                <CallParent style={styles.callIcon}/>
            </TouchableOpacity>

        </View>
        )}
        />


    </View>
    
)}

export default MentorEmergencyLeaveHistory;