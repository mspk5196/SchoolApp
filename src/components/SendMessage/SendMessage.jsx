import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Back from "../../assets/backarrow.svg";
import styles from "./SendMessagesty";

const SendMessage = ({navigation}) => {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    return (
        <View style={styles.container}>
            <View style={styles.activityHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Back height={30} width={30} style={styles.homeIcon} />
                </TouchableOpacity>
                <Text style={styles.activityText}>Message</Text>
            </View>

            <View style={styles.underline} />

          
            <View>
                <Text style={styles.headerText}>Subject</Text>
                <TextInput 
                    style={styles.subjectInput} 
                    placeholder="Enter subject..." 
                    placeholderTextColor="#888"
                    value={subject}
                    onChangeText={setSubject}
                />
            </View>

           
            <View>
                <Text style={styles.headerText}>Description</Text>
                <TextInput 
                    style={styles.descriptionInput} 
                    placeholder="Enter description..."
                    placeholderTextColor="#888"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
            </View>


            <TouchableOpacity style={styles.buttonContainer }>
                <Text style={styles.sendText}>Send Message</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SendMessage;
