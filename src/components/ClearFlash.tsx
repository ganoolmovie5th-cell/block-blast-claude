import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FIRST_CELL_OFFSET, cellStep } from './boardLayout';

type Props = {
  cells: [number, number][];
  cellSize: number;
};

/**
 * A one-shot flash drawn over cells that were just cleared. Remount (via a
 * React key on the parent) to replay. Each square scales up and fades out.
 */
function ClearFlashComponent({ cells, cellSize }: Props) {
  const progress = useSharedValue(0);
  const step = cellStep(cellSize);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 360 });
  }, [progress]);

  return (
    <>
      {cells.map(([r, c], i) => (
        <Flash
          key={i}
          progress={progress}
          left={FIRST_CELL_OFFSET + c * step}
          top={FIRST_CELL_OFFSET + r * step}
          size={cellSize}
        />
      ))}
    </>
  );
}

function Flash({
  progress,
  left,
  top,
  size,
}: {
  progress: SharedValue<number>;
  left: number;
  top: number;
  size: number;
}) {
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left,
    top,
    width: size,
    height: size,
    borderRadius: 6,
    backgroundColor: '#fde047',
    opacity: 1 - progress.value,
    transform: [{ scale: 1 + progress.value * 0.6 }],
  }));
  return <Animated.View pointerEvents="none" style={style} />;
}

export const ClearFlash = React.memo(ClearFlashComponent);
