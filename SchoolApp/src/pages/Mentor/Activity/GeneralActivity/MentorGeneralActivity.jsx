import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from "react-native";
import styles from "./GeneralActivitysty";
import Back from "../../../../assets/MentorPage/backarrow.svg";
import Add from "../../../../assets/MentorPage/plus.svg";
import Home from "../../../../assets/MentorPage/Home2.svg";
import DownArrow from "../../../../assets/MentorPage/down.svg";
import { API_URL } from '../../../../utils/env.js'
import { widthPercentageToDP } from "react-native-responsive-screen";
import { apiFetch } from "../../../../utils/apiClient.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MentorGeneralActivity = ({ navigation, route }) => {
  const { mentorData } = route.params;
  const [expanded, setExpanded] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresh] = useState(false);

  useEffect(() => {
    fetchData()
  }, [mentorData]);

  const fetchData = () => {
    apiFetch(`/mentor/getGeneralActivities?mentorId=${mentorData[0].id}`)
    .then(response => response)
    .then(data => {
      setActivities(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching activities:', error);
      setLoading(false);
    });
  }

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

 const authTokenRef = useRef(null);
  useEffect(() => {
    // Load token once (used for protected images if needed)
    AsyncStorage.getItem('token').then(t => { authTokenRef.current = t; });
  }, []);

  const getProfileImageSource = (profilePath) => {
    // console.log(authTokenRef.current);
    
    // console.log('Profile Path:', profilePath);
    if (profilePath) {
      // 1. Replace backslashes with forward slashes
      const normalizedPath = profilePath.replace(/\\/g, '/');
      // 2. Construct the full URL
      const uri = `${API_URL}/${normalizedPath}`;
      // return { uri: fullImageUrl };
      if (authTokenRef.current) {
        return { uri, headers: { Authorization: `Bearer ${authTokenRef.current}` } };
      }
      return { uri };
    } else {
      return Staff;
    }
  };

  const renderTags = (tags) => {
    if (!tags) return null;

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <View
          style={[
            styles.tag,
            tags.includes('Fee Payment') ? styles.feeTag :
              tags.includes('Stationery Collection') ? styles.defaultTag :
                styles.otherTag,
          ]}
        >
          <Text style={styles.tagText}>{tags}</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.profileSection}>
          {/* <View style={styles.profilePic} /> */}
          {item.profile_photo ? (
            <Image source={getProfileImageSource(item.profile_photo)} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePic} />
          )}
          <View>
            <Text style={styles.name}>{item.mentor_name}</Text>
            <Text style={styles.code}>{item.student_roll}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <DownArrow style={styles.arrowicon} />
          </TouchableOpacity>
        </View>
      </View>

      {renderTags(item.activity_type)}

      {expanded === item.id && (
        <View style={styles.dropdownContent}>
          {item.fee_type && (
            <Text style={styles.dropdownLabel}>
              Fee Type: <Text style={styles.amountText}>{item.fee_type}</Text>
            </Text>
          )}
          {item.amount && (
            <Text style={styles.dropdownLabel}>
              Amount: <Text style={styles.amountText}>{item.amount}</Text>
            </Text>
          )}
          {item.notes && (
            <Text style={styles.dropdownLabel}>
              Notes/Items: <Text style={styles.amountText}>{item.notes}</Text>
            </Text>
          )}
          {item.other_type && (
            <Text style={styles.dropdownLabel}>
              Activity Type: <Text style={styles.amountText}>{item.other_type}</Text>
            </Text>
          )}
          <Text style={styles.dropdownLabel}>Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{item.description || 'No description'}</Text>
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={fetchData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.activityIcons}>
        <View style={styles.AddIcon}>
          <TouchableOpacity
            onPress={() => navigation.navigate("MentorGenrealActivityRegister", { mentorData })}
          >
            <Add width={widthPercentageToDP('8.5%')} height={widthPercentageToDP('8.5%')} />
          </TouchableOpacity>
        </View>
        <View style={styles.HomeIcon}>
          <TouchableOpacity onPress={() => navigation.navigate("MentorMain", { mentorData })}>
            <Home />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MentorGeneralActivity;