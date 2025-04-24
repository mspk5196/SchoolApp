import React, { useState } from "react";
import { View, Text, FlatList, Pressable, TextInput, Image, TouchableOpacity } from "react-native";
import styles from "./Messagesty";
import Home from "../../assets/entypo_home.svg";
import SearchIcon from "../../assets/search.svg";
import Add from "../../assets/Add.svg";

const Message = ({navigation}) => {
    const [selectedTab, setSelectedTab] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const tabs = [
        { id: 1, title: "All" },
        { id: 2, title: "Unread" },
        { id: 3, title: "Read" }
    ];

    const inbox = [
        { id: 1, title: "Principal", message: "Hope you are doing well! Just wanted to check in...", time: "10:32 AM" },
        { id: 2, title: "Vino Mam", message: "Did you complete the assigned task yesterday?", time: "10:32 AM" },
        { id: 3, title: "Suganth VI-A", message: "Hope you are doing well! Just wanted to check in...", time: "10:32 AM" },
        { id: 4, title: "Sujith VI-A", message: "Hope you are doing well! Just wanted to check in...", time: "10:32 AM" }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() =>navigation.goBack()}>
                    <Home height={24} width={24} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Message</Text>
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


            <View style={styles.tabContainer}>
                {tabs.map((item) => (
                    <Pressable
                        key={item.id}
                        style={[styles.tabItem, selectedTab === item.id && styles.selectedTab]}
                        onPress={() => setSelectedTab(item.id)}
                    >
                        <Text style={[styles.tabText, selectedTab === item.id && styles.selectedTabText]}>
                            {item.title}
                        </Text>
                    </Pressable>
                ))}
            </View>


            <FlatList
                data={inbox}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <TouchableOpacity onPress={()=>navigation.navigate("MessageBox")}>
                    <View style={styles.inboxItem}>
                        <View style={styles.inboxLeft}>
                            <View style={styles.inboxDot} />
                            <View>
                                <Text style={styles.inboxText}>{item.title}</Text>
                                <Text style={styles.inboxMsg}>{item.message}</Text>
                            </View>
                        </View>
                        <Text style={styles.inboxTime}>{item.time}</Text>
                    </View>
                </TouchableOpacity>
                )}
            />
        <View>
            <TouchableOpacity style={styles.addIcon} onPress={() => navigation.navigate("SendMessage")}>
                <Add />
            </TouchableOpacity>
        </View>
    </View>
    
)};

export default Message;
