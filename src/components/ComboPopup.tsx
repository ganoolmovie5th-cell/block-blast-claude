import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  combo: number;
};

/**
 * Pops a "COMBO xN" label with a bounce whenever the combo value increases.
 * Remount via a React key to replay the bounce.
 */
function ComboPopupComponent({ combo }: Props) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = 0;
    scale.value = withSequence(
      withTiming(1.2, { duration: 160 }),
      withTiming(1, { duration: 120 }),
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value > 0 ? 1 : 0,
  }));

  if (combo <= 1) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <Text style={styles.text}>COMBO x{combo}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: '#a855f7',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 22 },
});

export const ComboPopup = React.memo(ComboPopupComponent);
