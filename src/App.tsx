import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { supabase } from '@/services/supabase';
import AuthScreen from '@/screens/AuthScreen';
import TasksScreen from '@/screens/TasksScreen';
import CreateTaskScreen from '@/screens/CreateTaskScreen';

// Placeholder screens (to be implemented)
const AssignmentsScreen = () => <View />;
const SettingsScreen = () => <View />;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TasksStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="TasksList" component={TasksScreen} />
    <Stack.Screen
      name="CreateTask"
      component={CreateTaskScreen}
      options={{ animationEnabled: true }}
    />
  </Stack.Navigator>
);

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
        name="TasksTab"
        component={TasksStack}
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
  const { fetchCategories } = useTaskStore();

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

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
    }
  }, [user?.id]);

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
