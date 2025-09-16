import React from "react";
import { SafeAreaView, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Router from "./src/components/Routes/Routes";
import 'react-native-get-random-values';
// Initialize Firebase configuration
import './src/utils/firebase';

const App = () => {
  return (
    <SafeAreaProvider>
      {/* StatusBar */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff" // match your SafeAreaView bg
      />
      <SafeAreaView style={styles.container}>
        <Router />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // Important!
  },
});

export default App;
