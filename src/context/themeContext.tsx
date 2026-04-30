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
  background: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F1EB',
  text: '#2D2D2D',
  textSecondary: '#7A7A7A',
  textTertiary: '#A3A3A3',
  placeholder: '#D1D1D1',
  primary: '#5B8CFF',
  primaryLight: '#EBF1FF',
  primaryBorder: 'transparent',
  secondary: '#5AC8FA',
  success: '#34C759',
  successBg: '#E8F5E9',
  warning: '#FF9500',
  warningBg: '#FFF3CD',
  error: '#FF3B30',
  errorBg: '#FFEBEE',
  border: 'transparent',
  borderSubtle: 'transparent',
  tabBar: '#FDFBF7',
  tabBarBorder: 'transparent',
  icon: '#999999',
  priorityHigh: '#FF6B6B',
  priorityHighBg: '#FFF0F0',
  priorityHighBorder: 'transparent',
  priorityMed: '#FFB84D',
  priorityMedBg: '#FFF9E6',
  priorityMedBorder: 'transparent',
  priorityLow: '#6BCB77',
  priorityLowBg: '#F0FFF4',
  priorityLowBorder: 'transparent',
};

const darkColors: ThemeColors = {
  background: '#151515',
  surface: '#222222',
  surfaceAlt: '#2A2A2A',
  text: '#FAFAFA',
  textSecondary: '#B0B0B0',
  textTertiary: '#7A7A7A',
  placeholder: '#555555',
  primary: '#5B8CFF',
  primaryLight: 'rgba(91, 140, 255, 0.15)',
  primaryBorder: 'transparent',
  secondary: '#32ADE6',
  success: '#34C759',
  successBg: 'rgba(52, 199, 89, 0.15)',
  warning: '#FF9500',
  warningBg: 'rgba(255, 149, 0, 0.15)',
  error: '#FF453A',
  errorBg: 'rgba(255, 69, 58, 0.15)',
  border: 'transparent',
  borderSubtle: 'transparent',
  tabBar: '#151515',
  tabBarBorder: 'transparent',
  icon: '#8E8E93',
  priorityHigh: '#FF6B6B',
  priorityHighBg: 'rgba(255, 107, 107, 0.15)',
  priorityHighBorder: 'transparent',
  priorityMed: '#FFB84D',
  priorityMedBg: 'rgba(255, 184, 77, 0.15)',
  priorityMedBorder: 'transparent',
  priorityLow: '#6BCB77',
  priorityLowBg: 'rgba(107, 203, 119, 0.15)',
  priorityLowBorder: 'transparent',
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
