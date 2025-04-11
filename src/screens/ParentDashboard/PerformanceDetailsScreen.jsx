import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./ParentDashboardStyles";
import PreviousIcon from '../../assets/LeaveIcon/PrevBtn.svg';
import { useNavigation } from "@react-navigation/native";

const PerformanceDetailsScreen = ({ route }) => {
  const { data } = route.params;
  const navigation = useNavigation();

  const performanceData = [
    { id: 1, day: "Day 4", academic: 53, homework: 20 },
    { id: 2, day: "Day 5", academic: 55, homework: 20 },
    { id: 3, day: "Day 6", academic: 60, homework: 20 },
    { id: 4, day: "Day 7", academic: 50, homework: 20 },
    { id: 5, day: "Day 8", academic: 0, homework: 0 },
    { id: 6, day: "Day 9", academic: 0, homework: 0 },
    { id: 7, day: "Day 10", academic: 0, homework: 0 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <View style={{ padding: 20 }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          onPress={() => navigation.goBack()}
        >
          <PreviousIcon width={24} height={24} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>Performance Graph</Text>
        </TouchableOpacity>

        {/* <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>Performance Graph</Text> */}
        
        <View style={styles.performanceGraphTabs}>
          <TouchableOpacity style={styles.performanceTab}>
            <Text style={styles.performanceTabText}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.performanceTab}>
            <Text style={styles.performanceTabText}>Overall</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.performanceTab, styles.activePerformanceTab]}>
            <Text style={[styles.performanceTabText, styles.activePerformanceTabText]}>Tamil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.performanceTab}>
            <Text style={styles.performanceTabText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.performanceTab}>
            <Text style={styles.performanceTabText}>Math</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={performanceData}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.barContainer}>
              <View style={[
                styles.bar, 
                { height: `${item.homework}%`, backgroundColor: '#e74c3c' }
              ]} />
              <View style={[
                styles.bar, 
                { height: `${item.academic}%`, backgroundColor: '#3498db' }
              ]} />
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          )}
        />

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Individual Performance</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>23/02/25</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#27ae60', marginRight: 10, fontWeight: 'bold' }}>Level 2</Text>
                <Text style={{ color: '#3498db', fontWeight: 'bold' }}>Rank: 3rd</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>Highest Score</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>99</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>Score</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>90/100</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>Class Average</Text>
              <Text style={{ fontSize: 14 }}>70</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, backgroundColor: '#e74c3c', marginRight: 5 }} />
                <Text style={{ fontSize: 14 }}>Discipline</Text>
              </View>
              <Text style={{ fontSize: 14 }}>20/20</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, backgroundColor: '#3498db', marginRight: 5 }} />
                <Text style={{ fontSize: 14 }}>Home work</Text>
              </View>
              <Text style={{ fontSize: 14 }}>20/25</Text>
            </View>
            <TouchableOpacity style={{ marginTop: 10 }}>
              <Text style={{ color: '#007bff', fontSize: 14, fontWeight: 'bold' }}>Assessment.pdf</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PerformanceDetailsScreen;