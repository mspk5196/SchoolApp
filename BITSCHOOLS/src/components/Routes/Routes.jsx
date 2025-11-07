import React from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import AuthLoader from './AuthLoader';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View } from 'react-native';
import Welcome from '../../pages/Auth/Welcome/Welcome';
import Login from '../../pages/Auth/Login/Login';
import Redirect from '../Redirect/Redirect';


const Stack = createNativeStackNavigator();

const Routes = () => {

    return (
        <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Stack.Navigator initialRouteName="AuthLoader" screenOptions={{ headerShown: false }}>

                <Stack.Screen name="AuthLoader" component={AuthLoader} />
                <Stack.Screen name="Welcome" component={Welcome} />
                
                {/* Auth Screens */}
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Redirect" component={Redirect}/>

            </Stack.Navigator>
        </NavigationContainer>
    )

}

export default Routes

