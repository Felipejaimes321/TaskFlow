import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'taskflow_theme';

// ─── Color Palettes ──────────────────────────────────────────────────────────

export const darkColors = {
  // Backgrounds
  background:    '#0A0A1A',
  surface:       '#12122A',
  surfaceAlt:    '#1C1C35',
  surfaceHover:  '#16163A',
  // Primary
  primary:       '#6366F1',
  primaryLight:  'rgba(99,102,241,0.15)',
  primaryBorder: 'rgba(99,102,241,0.25)',
  // Text
  text:          '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary:  '#4B5563',
  // Borders
  border:        'rgba(99,102,241,0.18)',
  borderSubtle:  'rgba(99,102,241,0.08)',
  // Semantic
  error:         '#EF4444',
  errorBg:       'rgba(239,68,68,0.12)',
  errorBorder:   'rgba(239,68,68,0.3)',
  success:       '#10B981',
  successBg:     'rgba(16,185,129,0.12)',
  successBorder: 'rgba(16,185,129,0.3)',
  warning:       '#F59E0B',
  warningBg:     'rgba(245,158,11,0.12)',
  warningBorder: 'rgba(245,158,11,0.3)',
  // Priority
  priorityHigh:       '#EF4444',
  priorityHighBg:     'rgba(239,68,68,0.12)',
  priorityHighBorder: 'rgba(239,68,68,0.3)',
  priorityMed:        '#F59E0B',
  priorityMedBg:      'rgba(245,158,11,0.12)',
  priorityMedBorder:  'rgba(245,158,11,0.3)',
  priorityLow:        '#10B981',
  priorityLowBg:      'rgba(16,185,129,0.12)',
  priorityLowBorder:  'rgba(16,185,129,0.3)',
  // Navigation
  tabBar:        '#10101E',
  tabBarBorder:  'rgba(99,102,241,0.15)',
  // Input
  inputBg:       '#1C1C35',
  placeholder:   '#4B5563',
  // Icon
  icon:          '#9CA3AF',
  iconActive:    '#6366F1',
  // Shadow
  shadow:        '#000000',
  isDark: true,
};

export const lightColors = {
  // Backgrounds
  background:    '#F5F5F7',
  surface:       '#FFFFFF',
  surfaceAlt:    '#F2F2F7',
  surfaceHover:  '#E5E5EA',
  // Primary
  primary:       '#5856D6',
  primaryLight:  'rgba(88,86,214,0.1)',
  primaryBorder: 'rgba(88,86,214,0.25)',
  // Text
  text:          '#1C1C1E',
  textSecondary: '#6B6B6B',
  textTertiary:  '#AEAEB2',
  // Borders
  border:        'rgba(0,0,0,0.1)',
  borderSubtle:  'rgba(0,0,0,0.06)',
  // Semantic
  error:         '#FF3B30',
  errorBg:       'rgba(255,59,48,0.08)',
  errorBorder:   'rgba(255,59,48,0.25)',
  success:       '#34C759',
  successBg:     'rgba(52,199,89,0.1)',
  successBorder: 'rgba(52,199,89,0.3)',
  warning:       '#FF9500',
  warningBg:     'rgba(255,149,0,0.1)',
  warningBorder: 'rgba(255,149,0,0.3)',
  // Priority
  priorityHigh:       '#FF3B30',
  priorityHighBg:     'rgba(255,59,48,0.08)',
  priorityHighBorder: 'rgba(255,59,48,0.2)',
  priorityMed:        '#FF9500',
  priorityMedBg:      'rgba(255,149,0,0.1)',
  priorityMedBorder:  'rgba(255,149,0,0.25)',
  priorityLow:        '#34C759',
  priorityLowBg:      'rgba(52,199,89,0.1)',
  priorityLowBorder:  'rgba(52,199,89,0.25)',
  // Navigation
  tabBar:        '#FFFFFF',
  tabBarBorder:  'rgba(0,0,0,0.1)',
  // Input
  inputBg:       '#F2F2F7',
  placeholder:   '#AEAEB2',
  // Icon
  icon:          '#8E8E93',
  iconActive:    '#5856D6',
  // Shadow
  shadow:        '#000000',
  isDark: false,
};

export type ThemeColors = typeof darkColors;

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme !== 'light'); // default dark
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const load = async () => {
      try {
        if (Platform.OS !== 'web') {
          const saved = await SecureStore.getItemAsync(THEME_KEY);
          if (saved !== null) {
            setIsDark(saved === 'dark');
          }
        }
      } catch {
        // Ignore storage errors — use default
      } finally {
        setLoaded(true);
      }
    };
    load();
    if (Platform.OS === 'web') setLoaded(true);
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
      }
    } catch {
      // Ignore
    }
  };

  if (!loaded) return null; // Don't flash wrong theme

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = () => useContext(ThemeContext);

// ─── Typography helper ────────────────────────────────────────────────────────
// Returns the native system font (SF Pro on iOS, Roboto on Android)
export const systemFont = (weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy'): object => {
  const weightMap: Record<string, string> = {
    regular:  '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
    heavy:    '800',
  };
  return {
    fontFamily: Platform.select({ ios: undefined, android: undefined, default: undefined }),
    fontWeight: weightMap[weight || 'regular'] as any,
  };
};
