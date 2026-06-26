import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlockShape } from '../core/types';
import { CELL_MARGIN, DRAG_LIFT } from './boardLayout';

type Props = {
  shape: BlockShape;
  cellSize: number;
  onDragStart: () => void;
  onDragUpdate: (absoluteX: number, absoluteY: number) => void;
  onDragEnd: (absoluteX: number, absoluteY: number) => void;
};

function DraggableBlockComponent({
  shape,
  cellSize,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const dragging = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragging.value = 1;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
      runOnJS(onDragUpdate)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      runOnJS(onDragEnd)(e.absoluteX, e.absoluteY);
      dragging.value = 0;
      tx.value = withSpring(0);
      ty.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const lift = dragging.value ? -DRAG_LIFT : 0;
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + lift },
        { scale: withSpring(dragging.value ? 1.05 : 1) },
      ],
      zIndex: dragging.value ? 100 : 1,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {shape.matrix.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((on, c) => (
              <View
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  margin: CELL_MARGIN,
                  borderRadius: 6,
                  backgroundColor: on ? shape.color : 'transparent',
                }}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});

export const DraggableBlock = DraggableBlockComponent;
