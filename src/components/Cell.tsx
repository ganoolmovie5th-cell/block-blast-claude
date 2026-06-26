import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Cell as CellModel } from '../core/types';
import { CELL_MARGIN } from './boardLayout';

type Props = {
  cell: CellModel;
  size: number;
  preview?: 'valid' | 'invalid' | null;
};

function CellComponent({ cell, size, preview }: Props) {
  const backgroundColor = cell.filled
    ? cell.color ?? '#94a3b8'
    : preview === 'valid'
      ? 'rgba(34,197,94,0.45)'
      : preview === 'invalid'
        ? 'rgba(239,68,68,0.4)'
        : '#e2e8f0';

  return (
    <View style={[styles.cell, { width: size, height: size, backgroundColor }]} />
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    margin: CELL_MARGIN,
  },
});

export const Cell = React.memo(CellComponent);
