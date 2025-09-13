import { View, StatusBar } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Ionicons from "react-native-vector-icons/Ionicons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import Landing from './Screens/Landing';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import Home from './Screens/Home';
import UserServices from './Screens/UserServices';
import PostService from './Screens/PostService';
import Message from './Screens/Message';
import Profile from './Screens/Profile';
import Workers from './Screens/Workers';
import ChatRoom from './Screens/ChatRoom';
import Support from './Screens/Support'; 
import Payments from './Screens/Payments'; // 👈 NEW

const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const TabScreen = () => {
  return (
    <Tab.Navigator
      activeColor="#005EB8"
      inactiveColor="#005EB8"
      barStyle={{ backgroundColor: '#fff' }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = !focused ? "home" : "home-outline";
          } else if (route.name === "PostService") {
            iconName = !focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Message") {
            iconName = !focused ? "chatbox-ellipses" : "chatbox-ellipses-outline";
          } else if (route.name === "Profile") {
            iconName = !focused ? "person" : "person-outline";
          }

          return (
            <View>
              <Ionicons name={iconName} size={25} color={'#005EB8'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name='Home' component={Home} options={{ headerShown: false }} />
      <Tab.Screen name='PostService' component={PostService} options={{ headerShown: false }} />
      <Tab.Screen name='Message' component={Message} options={{ headerShown: false }} />
      <Tab.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar />
        <Stack.Navigator>
          <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="TabScreen" component={TabScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Workers" component={Workers} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: false }} />
          <Stack.Screen name="UserServices" component={UserServices} />
          <Stack.Screen name="Payments" component={Payments} />
          <Stack.Screen name="Support" component={Support} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default Navigation;
