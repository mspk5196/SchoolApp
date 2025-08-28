import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Router from "./src/components/Routes/Routes";
import 'react-native-get-random-values';

const App = () => {

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Router />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
