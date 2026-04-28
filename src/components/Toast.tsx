import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/themeContext';
import { hapticNotification } from '@/utils/haptics';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextData {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastOptions>({ message: '', type: 'info' });
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const showToast = useCallback((options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    setConfig({
      message: opts.message,
      type: opts.type || 'info',
      duration: opts.duration || 3500,
    });
    
    if (opts.type === 'error') hapticNotification('error');
    else if (opts.type === 'success') hapticNotification('success');

    setVisible(true);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, opts.duration || 3500);
  }, []);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, []);

  const getIcon = () => {
    if (config.type === 'error') return 'alert-circle';
    if (config.type === 'success') return 'checkmark-circle';
    return 'information-circle';
  };

  const getColors = () => {
    if (config.type === 'error') return { bg: colors.errorBg, text: colors.error, border: colors.errorBorder };
    if (config.type === 'success') return { bg: colors.successBg, text: colors.success, border: colors.successBorder };
    return { bg: colors.surfaceAlt, text: colors.text, border: colors.border };
  };

  const currentColors = getColors();

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            {
              top: Math.max(insets.top, 20),
              transform: [{ translateY }],
              opacity,
              backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
              borderColor: currentColors.border,
              shadowColor: isDark ? '#000' : '#000',
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: currentColors.bg }]}>
            <Ionicons name={getIcon()} size={20} color={currentColors.text} />
          </View>
          <Text style={[styles.message, { color: colors.text }]}>{config.message}</Text>
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn} activeOpacity={0.6}>
            <Ionicons name="close" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 9999,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 8,
    marginLeft: 4,
  },
});
