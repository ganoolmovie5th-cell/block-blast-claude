import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Grid as GridModel } from '../core/types';
import { Cell } from './Cell';
import { BOARD_PADDING } from './boardLayout';

type Props = {
  grid: GridModel;
  cellSize: number;
  previews?: Record<string, 'valid' | 'invalid'>;
  onMeasure?: (x: number, y: number) => void;
  boardBg?: string;
  cellEmpty?: string;
};

function GridComponent({ grid, cellSize, previews, onMeasure, boardBg = '#cbd5e1', cellEmpty }: Props) {
  const ref = React.useRef<View>(null);

  const handleLayout = (_e: LayoutChangeEvent) => {
    ref.current?.measureInWindow((x, y) => onMeasure?.(x, y));
  };

  return (
    <View ref={ref} style={[styles.board, { backgroundColor: boardBg }]} onLayout={handleLayout}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              size={cellSize}
              preview={previews?.[`${r},${c}`] ?? null}
              emptyColor={cellEmpty}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 12,
    padding: BOARD_PADDING,
  },
  row: {
    flexDirection: 'row',
  },
});

export const Grid = React.memo(GridComponent);
