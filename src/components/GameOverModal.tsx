import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
};

function GameOverModalComponent({ visible, score, highScore, onRestart }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(250)} style={styles.backdrop}>
        <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.card}>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.best}>Best: {highScore}</Text>

          <Pressable style={styles.button} onPress={onRestart} accessibilityRole="button">
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', letterSpacing: 1 },
  score: { fontSize: 48, fontWeight: '800', color: '#a855f7' },
  best: { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 4, marginBottom: 24 },
  button: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});

export const GameOverModal = React.memo(GameOverModalComponent);
