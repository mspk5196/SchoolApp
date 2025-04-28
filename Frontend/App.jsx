import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Router from "./src/components/Routes/Routes";

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

{/* <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerLeft: () => null }} />
        <Stack.Screen name="Redirect" component={Redirect} options={{ headerLeft: () => null }} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="Coordinator" component={Coordinator} />
        <Stack.Screen name="Mentor" component={Mentor} />
        <Stack.Screen name="Parent" component={Parent} />
      </Stack.Navigator>
    </NavigationContainer> */}