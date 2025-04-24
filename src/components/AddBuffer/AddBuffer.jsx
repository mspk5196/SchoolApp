import React from "react";
import { View, Text} from "react-native";
import styles from "./AddBuffersty";
import Back from "../../assets/backarrow.svg";
import Home from "../../assets/Home2.svg"
import Timer from "../../assets/Timer.svg"


const BufferActivity = () => {
    return (
        <View style={styles.container}>

            <View style={styles.activityHeader}>
                <Back height={30} width={30} style={styles.homeIcon} />
                <Text style={styles.activityText}>Buffer Activity</Text>
            </View>
            
            <View style={styles.underline} />

            <Timer width={130} height={130} style={styles.timerIcon}/>

            <View style={styles.activityIcons}>
                <View style={styles.buttonContainer}>
                    <Text style={styles.sendText}>Confirm</Text>
                </View>
                <View style={styles.HomeIcon}>
                    <Home />
                </View>
            </View>

        </View>
    )
}
export default BufferActivity;
