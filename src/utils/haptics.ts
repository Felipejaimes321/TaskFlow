import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (isWeb) return;
  const hapticStyle =
    style === 'light' ? Haptics.ImpactFeedbackStyle.Light
      : style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Heavy;
  Haptics.impactAsync(hapticStyle).catch(() => {});
};

export const hapticNotification = (type: 'success' | 'warning' | 'error') => {
  if (isWeb) return;
  const hapticType =
    type === 'success' ? Haptics.NotificationFeedbackType.Success
      : type === 'warning' ? Haptics.NotificationFeedbackType.Warning
      : Haptics.NotificationFeedbackType.Error;
  Haptics.notificationAsync(hapticType).catch(() => {});
};

export const hapticSelection = () => {
  if (isWeb) return;
  Haptics.selectionAsync().catch(() => {});
};
