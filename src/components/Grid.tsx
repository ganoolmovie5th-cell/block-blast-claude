import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Grid as GridModel } from '../core/types';
import { Cell } from './Cell';
import { BOARD_PADDING } from './boardLayout';

type Props = {
  grid: GridModel;
  cellSize: number;
  previews?: Record<string, 'valid' | 'invalid'>;
  /** Fires with the grid's absolute window position so drops can be mapped. */
  onMeasure?: (x: number, y: number) => void;
};

function GridComponent({ grid, cellSize, previews, onMeasure }: Props) {
  const ref = React.useRef<View>(null);

  const handleLayout = (_e: LayoutChangeEvent) => {
    // measureInWindow gives absolute screen coordinates for drop mapping.
    ref.current?.measureInWindow((x, y) => onMeasure?.(x, y));
  };

  return (
    <View ref={ref} style={styles.board} onLayout={handleLayout}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              size={cellSize}
              preview={previews?.[`${r},${c}`] ?? null}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#cbd5e1',
    borderRadius: 12,
    padding: BOARD_PADDING,
  },
  row: {
    flexDirection: 'row',
  },
});

export const Grid = React.memo(GridComponent);
