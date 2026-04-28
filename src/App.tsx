import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet, Platform, UIManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/context/authStore';
import { useTaskStore } from '@/context/taskStore';
import { supabase } from '@/services/supabase';
import { ThemeProvider, useTheme } from '@/context/themeContext';
import AuthScreen from '@/screens/AuthScreen';
import TasksScreen from '@/screens/TasksScreen';
import CreateTaskScreen from '@/screens/CreateTaskScreen';
import TaskDetailScreen from '@/screens/TaskDetailScreen';
import TaskSuccessScreen from '@/screens/TaskSuccessScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ProgressScreen from '@/screens/ProgressScreen';
import SharedWithMeScreen from '@/screens/SharedWithMeScreen';
import LandingScreen from '@/screens/LandingScreen';
import { ToastProvider } from '@/components/Toast';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();



const TasksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksList"   component={TasksScreen}       />
    <Stack.Screen name="CreateTask"  component={CreateTaskScreen}  options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="TaskDetail"  component={TaskDetailScreen}  />
    <Stack.Screen name="TaskSuccess" component={TaskSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
  </Stack.Navigator>
);

function AppTabs() {
  const { colors, isDark } = useTheme();

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.tabBar, border: colors.tabBarBorder, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.tabBar, border: colors.tabBarBorder, primary: colors.primary } };

  return (
    <NavigationContainer theme={navTheme}>
      {/* Inner nav content rendered from AppNavigator */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.icon,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopWidth: 1,
            borderTopColor: colors.tabBarBorder,
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'list-outline';
            if (route.name === 'TasksTab')    iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
            if (route.name === 'SharedWithMe') iconName = focused ? 'share-social' : 'share-social-outline';
            if (route.name === 'Progress')    iconName = focused ? 'flame' : 'flame-outline';
            if (route.name === 'Settings')    iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="TasksTab"      component={TasksStack}     options={{ title: 'Mis Tareas' }} />
        <Tab.Screen name="SharedWithMe"  component={SharedWithMeScreen} options={{ title: 'Compartidas' }} />
        <Tab.Screen name="Progress"      component={ProgressScreen} options={{ title: 'Progreso' }} />
        <Tab.Screen name="Settings"      component={SettingsScreen} options={{ title: 'Ajustes' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AuthNavigator() {
  const { colors, isDark } = useTheme();
  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, border: colors.border, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, border: colors.border, primary: colors.primary } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { loading, user, getCurrentUser } = useAuthStore();
  const { fetchCategories } = useTaskStore();
  const { colors } = useTheme();

  useEffect(() => {
    getCurrentUser();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { useAuthStore.setState({ user: null }); }
      else { getCurrentUser(); }
    });
    return () => { data?.subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (user?.id) { fetchCategories(user.id); }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const _styles = StyleSheet.create({});
