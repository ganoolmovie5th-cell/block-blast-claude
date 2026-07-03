import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { ACHIEVEMENTS } from '../core/achievements';

type Props = {
  achievementId: string | null;
  onDismiss: () => void;
};

function AchievementPopupComponent({ achievementId, onDismiss }: Props) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return null;

  return (
    <Animated.View entering={SlideInUp.duration(300)} exiting={FadeOut.duration(200)} style={styles.container}>
      <Pressable style={styles.card} onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss achievement">
        <Text style={styles.icon}>{achievement.icon}</Text>
        <Text style={styles.title}>🏆 {achievement.name}</Text>
        <Text style={styles.desc}>{achievement.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 200,
  },
  card: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: { fontSize: 32, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#92400e' },
  desc: { fontSize: 13, color: '#78350f', marginTop: 2 },
});

export const AchievementPopup = React.memo(AchievementPopupComponent);
