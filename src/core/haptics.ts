// Haptic feedback service. Pure module, no React.
import * as Haptics from 'expo-haptics';

export function hapticPlace() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticClear() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticCombo() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticGameOver() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function hapticPowerUp() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
