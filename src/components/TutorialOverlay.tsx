import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  onDismiss: () => void;
};

function TutorialOverlayComponent({ onDismiss }: Props) {
  const [step, setStep] = React.useState(0);

  const steps = [
    { icon: '👆', title: 'Drag & Drop', desc: 'Drag blocks from the tray onto the 8×8 grid' },
    { icon: '✨', title: 'Clear Lines', desc: 'Fill a complete row or column to clear it and earn points' },
    { icon: '🔥', title: 'Combos', desc: 'Clear lines on consecutive moves to build combo multipliers up to x5' },
  ];

  const current = steps[step];

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <Pressable
          style={styles.btn}
          onPress={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else onDismiss();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>{step < steps.length - 1 ? 'Next' : 'Got it!'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  desc: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { backgroundColor: '#a855f7', width: 20 },
  btn: { backgroundColor: '#a855f7', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export const TutorialOverlay = React.memo(TutorialOverlayComponent);
