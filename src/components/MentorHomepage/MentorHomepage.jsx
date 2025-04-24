import React from "react";
import { View, Text, Switch, Pressable, TouchableOpacity } from "react-native";
import styles from "./MentorHomepagesty";
import Iconlogo from "../../assets/Group.svg";
import Icon from '../../assets/ic_round-logout.svg';
import Logo from '../../assets/backicon.svg';
import Dashboard from '../../assets/Dashboard.svg';
import Approve from '../../assets/Approve.svg';
import Homework from '../../assets/noto_books.svg';
import Message from '../../assets/message.svg';
import Activity from '../../assets/activity.svg';
import AssessmentRequest from '../../assets/newspaper.svg';
import { useNavigation } from "@react-navigation/native";

const MentorHomepage = ({navigation}) => {
const Navigation = useNavigation();
  return (
    <View style={styles.container}>

      <View style={styles.page}>
        <Logo style={styles.backIcon} />
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MentorDetails')}>
          <Iconlogo style={styles.profile} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon style={styles.logout} />
        </TouchableOpacity>  
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Mentor</Text>
        <View style={styles.switch}>
          <Switch trackColor={{ false: "#767577", true: "#2563EB" }} ios_backgroundColor="#3e3e3e" />
        </View>
      </View>

      <View style={styles.mainpage}>
        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('Dashboard')}>
            <Dashboard style={styles.icons} />
            <Text style={styles.menutitle}>Dashboard</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('LeaveApproval')}>
            <Approve style={styles.icons} />
            <Text style={styles.menutitle}>Approval</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('HomeworkList')}>
            <Homework style={styles.icons} />
            <Text style={styles.menutitle}>Homework</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('Message')}>
            <Message style={styles.icons} />
            <Text style={styles.menutitle}>Messages</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('Activity')}>
            <Activity style={styles.icons1} />
            <Text style={styles.menutitle1}>Activity</Text>
          </Pressable>

          <Pressable style={styles.card1} onPress={() => navigation.navigate('AssessmentRequest')}>
            <AssessmentRequest style={styles.icons1} />
            <Text style={styles.menutitle1}>Assessment Request</Text>
          </Pressable>
        </View>

        <View style={styles.menus}>
          <Pressable style={styles.card1} onPress={() => navigation.navigate('Materials')}>
            <Homework style={styles.icons} />
            <Text style={styles.menutitle}>Materials</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
};

export default MentorHomepage;
