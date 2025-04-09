import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/pages/Login/Login';
import Redirect from './src/components/Redirect/Redirect';
import Admin from './src/pages/Admin/Admin';
import Coordinator from './src/pages/Coordinator/Coordinator';
import Mentor from './src/pages/Mentor/Mentor';
import Parent from './src/pages/Parent/Parent';

const Stack = createStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerLeft: () => null }} />
        <Stack.Screen name="Redirect" component={Redirect} options={{ headerLeft: () => null }} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="Coordinator" component={Coordinator} />
        <Stack.Screen name="Mentor" component={Mentor} />
        <Stack.Screen name="Parent" component={Parent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
