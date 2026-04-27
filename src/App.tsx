import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/context/authStore';
import { supabase } from '@/services/supabase';
import AuthScreen from '@/screens/AuthScreen';

import TasksScreen from '@/screens/TasksScreen';

// Placeholder screens (to be implemented)
const AssignmentsScreen = () => <View />;
const SettingsScreen = () => <View />;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TasksTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'Mis Tareas' }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{ title: 'Asignaciones' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const { loading, user, getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        useAuthStore.setState({ user: null });
      } else {
        getCurrentUser();
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TasksTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
