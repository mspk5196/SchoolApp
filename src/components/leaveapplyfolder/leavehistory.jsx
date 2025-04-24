import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import styles from "./leavehistorysty";
import SearchIcon from "../../assets/search.svg";
import LeaveType from '../../assets/leavetype.svg';
import Date from '../../assets/date.svg';
import Home from '../../assets/backarrow.svg';
import Approved from '../../assets/greentick.svg';

const LeaveApprovalHistory = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const leaveData = [
    {
      id: '1',
      date: '12/08/23',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Approved',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason: "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
    {
      id: '2',
      date: '11/08/23',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Approved',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason: "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
    {
      id: '3',
      date: '10/08/23',
      name: 'Ram Kumar',
      phone: '7376232206',
      status: 'Approved',
      leaveType: 'Sick Leave',
      dateRange: '20/08/24 - 23/08/24',
      reason: "Due to Heavy fever I'm unable to attend the class. Due to Heavy fever I'm unable to attend the class",
    },
  ];

  return (
        <View style={styles.container}>
        <View style={styles.activityHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Home height={30} width={30} style={styles.homeIcon} />
        </TouchableOpacity>
        <Text style={styles.activityText}>Leave Approval</Text>
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
            data={leaveData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
            const showDateHeader = index === 0 || item.date !== leaveData[index - 1].date;
            return (
                <View>
                {showDateHeader && <Text style={styles.sectionHeader}>{item.date}</Text>}
                <View style={styles.card}>
                  
                    <View style={styles.topInfoBox}>
                    <View style={styles.leftBox}>
                        <View style={styles.profileCircle}>
                        </View>
                        <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.phone}>{item.phone}</Text>
                        </View>
                    </View>
                    <View style={styles.statusBox}>
                        <Approved width={15} height={15} />
                        <Text style={styles.status}>{item.status}</Text>
                    </View>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.dateText}><Date/>{item.dateRange}</Text>
                      <Text style={styles.leaveType}><LeaveType/>{item.leaveType}</Text>
                    </View>
                    <View style={styles.reasonBox}>
                      <Text style={styles.reasonText}>{item.reason}</Text>
                    </View>
                </View>
                </View>
            );
            }}
        />
        </View>
  );
};

export default LeaveApprovalHistory;
