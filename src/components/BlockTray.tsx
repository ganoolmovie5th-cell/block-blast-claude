import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlockShape } from '../core/types';
import { DraggableBlock } from './DraggableBlock';

type Props = {
  tray: (BlockShape | null)[];
  cellSize: number;
  onDragStart: (index: number) => void;
  onDragUpdate: (index: number, absoluteX: number, absoluteY: number) => void;
  onDragEnd: (index: number, absoluteX: number, absoluteY: number) => void;
};

function BlockTrayComponent({
  tray,
  cellSize,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: Props) {
  return (
    <View style={styles.tray}>
      {tray.map((shape, index) => (
        <View key={index} style={styles.slot}>
          {shape ? (
            <DraggableBlock
              shape={shape}
              cellSize={cellSize}
              onDragStart={() => onDragStart(index)}
              onDragUpdate={(x, y) => onDragUpdate(index, x, y)}
              onDragEnd={(x, y) => onDragEnd(index, x, y)}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    minHeight: 120,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const BlockTray = React.memo(BlockTrayComponent);
