import { Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

import HomeIcon from '../../assets/ParentPage/NavImg/home.svg';
import MaterialsIcon from '../../assets/ParentPage/NavImg/materials.svg';
import ScheduleIcon from '../../assets/ParentPage/NavImg/shedule.svg';
import MoreIcon from '../../assets/ParentPage/NavImg/more.svg';

import ParentDashboard from '../../pages/Parent/ParentDashboard/ParentDashboard';
import MaterialScreen from '../../pages/Parent/MaterialScreen/StudentPageMaterialScreen';
import ScheduleScreen from '../../pages/Parent/ScheduleScreen/StudentScheduleScreen';
import SidebarOverlay from '../Parent/Sidebar/SidebarOverlay';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudentSubjectSelectionPage from '../../pages/Parent/MaterialScreen/StudentSubjectSelectionPage';
 

const ParentRoute = () => {

    const Tab = createBottomTabNavigator();

    const [sidebarVisible, setSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused }) => {
                        let Icon;
                        let color = focused ? 'blue' : 'gray';

                        switch (route.name) {
                            case 'Home':
                                Icon = HomeIcon;
                                break;
                            case 'Materials':
                                Icon = MaterialsIcon;
                                break;
                            case 'Schedule':
                                Icon = ScheduleIcon;
                                break;
                            case 'MoreTab':
                                Icon = MoreIcon;
                                break;
                            default:
                                return null;
                        }
                        return <Icon width={22} height={22} color={color} />;
                    },
                    tabBarActiveTintColor: 'blue',
                    tabBarInactiveTintColor: 'gray',
                    tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
                    tabBarStyle: {
                        paddingBottom: 15,
                        height: 65,
                        alignContent: 'flex-end',
                        backgroundColor: 'white',
                    },
                })}
            >
                <Tab.Screen name="Home" component={ParentDashboard} />
                <Tab.Screen name="Schedule" component={ScheduleScreen} />
                <Tab.Screen name="Materials" component={StudentSubjectSelectionPage} />
                <Tab.Screen
                    name="MoreTab"
                    component={ParentDashboard}
                    options={{
                        tabBarLabel: 'More',
                        tabBarButton: (props) => (
                            <TouchableOpacity
                                {...props}
                                onPress={toggleSidebar}
                                style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
                            >
                                <MoreIcon
                                    width={22}
                                    height={22}
                                    color={props.accessibilityState?.selected ? 'blue' : 'gray'}
                                />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                        color: props.accessibilityState?.selected ? 'blue' : 'gray',
                                        marginTop: 4,
                                    }}
                                >
                                    More
                                </Text>
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Tab.Navigator>

            {/* Sidebar Overlay */}
            <SidebarOverlay visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </View>
    )
}

export default ParentRoute
