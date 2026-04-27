import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  placeholder: string;
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  secondary: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  border: string;
  borderSubtle: string;
  tabBar: string;
  tabBarBorder: string;
  icon: string;
  priorityHigh: string;
  priorityHighBg: string;
  priorityHighBorder: string;
  priorityMed: string;
  priorityMedBg: string;
  priorityMedBorder: string;
  priorityLow: string;
  priorityLowBg: string;
  priorityLowBorder: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F9F9F9',
  surfaceAlt: '#F0F0F0',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  placeholder: '#CCCCCC',
  primary: '#007AFF',
  primaryLight: '#E8F4FF',
  primaryBorder: '#B3D9FF',
  secondary: '#5AC8FA',
  success: '#34C759',
  successBg: '#E8F5E9',
  warning: '#FF9500',
  warningBg: '#FFF3CD',
  error: '#FF3B30',
  errorBg: '#FFEBEE',
  border: '#E0E0E0',
  borderSubtle: '#F0F0F0',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  icon: '#999999',
  priorityHigh: '#FF3B30',
  priorityHighBg: '#FFEBEE',
  priorityHighBorder: '#FFCDD2',
  priorityMed: '#FF9500',
  priorityMedBg: '#FFF3E0',
  priorityMedBorder: '#FFE0B2',
  priorityLow: '#34C759',
  priorityLowBg: '#E8F5E9',
  priorityLowBorder: '#C8E6C9',
};

const darkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#B8B8BA',
  textTertiary: '#8E8E93',
  placeholder: '#5A5A5C',
  primary: '#0A84FF',
  primaryLight: 'rgba(10, 132, 255, 0.15)',
  primaryBorder: 'rgba(10, 132, 255, 0.3)',
  secondary: '#32ADE6',
  success: '#34C759',
  successBg: 'rgba(52, 199, 89, 0.15)',
  warning: '#FF9500',
  warningBg: 'rgba(255, 149, 0, 0.15)',
  error: '#FF453A',
  errorBg: 'rgba(255, 69, 58, 0.15)',
  border: '#3A3A3C',
  borderSubtle: '#2C2C2E',
  tabBar: '#1C1C1E',
  tabBarBorder: '#3A3A3C',
  icon: '#8E8E93',
  priorityHigh: '#FF453A',
  priorityHighBg: 'rgba(255, 69, 58, 0.15)',
  priorityHighBorder: 'rgba(255, 69, 58, 0.3)',
  priorityMed: '#FF9500',
  priorityMedBg: 'rgba(255, 149, 0, 0.15)',
  priorityMedBorder: 'rgba(255, 149, 0, 0.3)',
  priorityLow: '#34C759',
  priorityLowBg: 'rgba(52, 199, 89, 0.15)',
  priorityLowBorder: 'rgba(52, 199, 89, 0.3)',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  theme: ThemeType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      if (Platform.OS === 'web') {
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        }
      } else {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      
      if (Platform.OS === 'web') {
        typeof window !== 'undefined' && localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      } else {
        await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;
  const theme: ThemeType = isDark ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
