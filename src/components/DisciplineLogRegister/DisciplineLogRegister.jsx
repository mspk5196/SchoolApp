import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import styles from "./DisciplineLogRegistersty";
import Back from "../../assets/backarrow.svg";
import Call2 from '../../assets/call2.svg';

const DisciplineLogRegister = ({ student, onBack }) => {
  const [complaint, setComplaint] = useState("");

  const handleSubmit = () => {
    if (complaint.trim()) {
      alert("Complaint submitted!");
      setComplaint("");
      onBack(); 
    } else {
      alert("Please enter a complaint.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Back width={30} height={30} style={styles.backicon}/>
        </TouchableOpacity>
        <Text style={styles.headerText}>Discipline Log</Text>
      </View>
      <View style={styles.underline} />


      <View style={styles.card}>
      <View style={styles.profileSection}>
          <View style={styles.profilePic} />
          <View>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.stdid}>{student.stdid}</Text>
          </View>
        </View>
        <Text style={styles.subText}>
          Student Mentor : {student.stdmentor}
          <TouchableOpacity>
            <Call2 style={styles.callicon}/>
          </TouchableOpacity>
        </Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Type the complaint here..."
          value={complaint}
          onChangeText={setComplaint}
          multiline
        />
      </View>

    
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Register Complaint</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DisciplineLogRegister;
