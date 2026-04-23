import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Home, Radio, List, Settings as SettingsIcon, UserPlus } from 'lucide-react-native';
import Colors from './constants/Colors';

import Dashboard from './screens/Dashboard';
import Radar from './screens/Radar';
import Logs from './screens/Logs';
import Settings from './screens/Settings';
import Register from './screens/Register';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
          }}
        />
        <Tab.Screen 
          name="Radar" 
          component={Radar} 
          options={{
            tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />
          }}
        />
        <Tab.Screen 
          name="Logs" 
          component={Logs} 
          options={{
            tabBarIcon: ({ color, size }) => <List color={color} size={size} />
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={Settings} 
          options={{
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />
          }}
        />
        <Tab.Screen 
          name="Register" 
          component={Register} 
          options={{
            tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
