import React from "react";
import { View, Text, FlatList, Pressable, TouchableOpacity} from "react-native";
import styles from "./BufferActivitysty";
import Back from  "../../../../assets/MentorPage/backarrow.svg";
import Add from   "../../../../assets/MentorPage/Add.svg";
import Home from  "../../../../assets/MentorPage/Home2.svg"


const MentorBufferActivity = ({navigation, route}) => {

    const {mentorData} = route.params;

    const data =[
        {id:1, activity:"Games", grade:"6", section:"A,B", time:"Ends in 30min"},
        {id:2, activity:"Games", grade:"6", section:"A,B", time:"Ends in 30min"},
        {id:3, activity:"Games", grade:"6", section:"A,B", time:"Ends in 30min"},
    ]

    return (
        <View style={styles.container}>

            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Back height={30} width={30} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Buffer Activity</Text>
            </View>
            
            <View style={styles.underline} />

            <View>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.activity}>{item.activity}</Text>
                        <View style={styles.statusContainer}>
                        <View style={styles.greenDot} />
                            <Text style={styles.status}>Active</Text>
                        </View>
                    </View>
                    <Text style={styles.details}>Grade {item.grade}</Text>
                    <Text style={styles.details}>Section - {item.section}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                    <Pressable style={styles.button}>
                    <TouchableOpacity>
                        <Text style={styles.buttonText}>End Activity now</Text>
                    </TouchableOpacity>
                    </Pressable>
                    </View>
                    )}
                />
            </View>


            <View style={styles.activityIcons}>
                <View style={styles.AddIcon}>
                    <TouchableOpacity onPress={() => navigation.navigate("MentorBufferActivityRegister",{mentorData})}><Add /></TouchableOpacity>
                </View>
                <View style={styles.HomeIcon}>
                    <TouchableOpacity onPress={() => navigation.navigate("MentorMain",{mentorData})}><Home /></TouchableOpacity>
                </View>
            </View>

        </View>
    )
}
export default MentorBufferActivity;
