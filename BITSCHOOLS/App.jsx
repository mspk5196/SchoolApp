import { useEffect } from "react";
import { StatusBar, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { enableScreens } from 'react-native-screens';
import Routes from "./src/components/Routes/Routes";
import { requestInitialPermissions } from './src/utils/permissions';

// Enable react-native-screens
enableScreens();

const App = () => {
  useEffect(() => {
    requestInitialPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <SafeAreaView style={styles.container}>
        <Routes />
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