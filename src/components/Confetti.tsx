import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 24;
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

type Props = {
  trigger: number; // increment to trigger new burst
};

function ConfettiComponent({ trigger }: Props) {
  if (trigger <= 0) return null;
  return (
    <>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={`${trigger}-${i}`} index={i} />
      ))}
    </>
  );
}

function Particle({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 60;
  const endX = startX + (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
  const endY = SCREEN_HEIGHT * 0.7 + Math.random() * 100;
  const rotation = Math.random() * 720;
  const color = COLORS[index % COLORS.length];
  const size = 6 + Math.random() * 6;
  const delay = index * 20;

  React.useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX + (endX - startX) * progress.value,
    top: 100 + endY * progress.value,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 1 - progress.value * 0.8,
    transform: [{ rotate: `${rotation * progress.value}deg` }],
  }));

  return <Animated.View pointerEvents="none" style={style} />;
}

const styles = StyleSheet.create({});

export const Confetti = React.memo(ConfettiComponent);
