import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { GRID_SIZE } from '../core/types';
import { canPlaceBlock } from '../core/gameLogic';
import { Grid, PreviewMap } from '../components/Grid';
import { BlockTray } from '../components/BlockTray';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverModal } from '../components/GameOverModal';
import { ClearFlash } from '../components/ClearFlash';
import { ComboPopup } from '../components/ComboPopup';
import {
  CELL_MARGIN,
  BOARD_PADDING,
  FIRST_CELL_OFFSET,
  cellStep,
  DRAG_LIFT,
} from '../components/boardLayout';

const SCREEN_PADDING = 16;

// Derive the board cell size from screen width so the grid fits any device.
const screenWidth = Dimensions.get('window').width;
const available = screenWidth - SCREEN_PADDING * 2;
const CELL_SIZE = Math.floor(
  (available - BOARD_PADDING * 2) / GRID_SIZE - CELL_MARGIN * 2,
);
// Tray blocks render a touch smaller so wide shapes fit three-across.
const TRAY_CELL_SIZE = Math.floor(CELL_SIZE * 0.62);

export function GameScreen() {
  const insets = useSafeAreaInsets();
  const grid = useGameStore((s) => s.grid);
  const tray = useGameStore((s) => s.tray);
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const combo = useGameStore((s) => s.combo);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const dropBlock = useGameStore((s) => s.dropBlock);
  const newGame = useGameStore((s) => s.newGame);
  const lastCleared = useGameStore((s) => s.lastCleared);

  const gridOrigin = React.useRef({ x: 0, y: 0 });
  const [previews, setPreviews] = React.useState<PreviewMap>({});
  // Replay the clear flash each time a non-empty clear happens.
  const [flash, setFlash] = React.useState<{ cells: [number, number][]; id: number }>({
    cells: [],
    id: 0,
  });

  React.useEffect(() => {
    if (lastCleared.length > 0) {
      setFlash((f) => ({ cells: lastCleared, id: f.id + 1 }));
    }
  }, [lastCleared]);

  // Map an absolute finger position to a board (row, col) for the given shape.
  const resolveCell = React.useCallback(
    (index: number, absoluteX: number, absoluteY: number) => {
      const shape = tray[index];
      if (!shape) return null;
      const step = cellStep(CELL_SIZE);
      const cols = shape.matrix[0].length;
      const rows = shape.matrix.length;
      const firstX = gridOrigin.current.x + FIRST_CELL_OFFSET;
      const firstY = gridOrigin.current.y + FIRST_CELL_OFFSET;
      // The block floats DRAG_LIFT above the finger and is centered on it.
      const centerX = absoluteX;
      const centerY = absoluteY - DRAG_LIFT;
      const topLeftX = centerX - (cols * step) / 2;
      const topLeftY = centerY - (rows * step) / 2;
      const col = Math.round((topLeftX - firstX) / step);
      const row = Math.round((topLeftY - firstY) / step);
      return { row, col, shape };
    },
    [tray],
  );

  const onDragUpdate = React.useCallback(
    (index: number, x: number, y: number) => {
      const resolved = resolveCell(index, x, y);
      if (!resolved) return;
      const { row, col, shape } = resolved;
      const valid = canPlaceBlock(grid, shape, row, col);
      const map: PreviewMap = {};
      for (let r = 0; r < shape.matrix.length; r += 1) {
        for (let c = 0; c < shape.matrix[r].length; c += 1) {
          if (!shape.matrix[r][c]) continue;
          const gr = row + r;
          const gc = col + c;
          if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
            map[`${gr},${gc}`] = valid ? 'valid' : 'invalid';
          }
        }
      }
      setPreviews(map);
    },
    [grid, resolveCell],
  );

  const onDragEnd = React.useCallback(
    (index: number, x: number, y: number) => {
      const resolved = resolveCell(index, x, y);
      setPreviews({});
      if (!resolved) return;
      dropBlock(index, resolved.row, resolved.col);
    },
    [dropBlock, resolveCell],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Block Blast</Text>
        <Pressable style={styles.newGame} onPress={newGame} accessibilityRole="button">
          <Text style={styles.newGameText}>New Game</Text>
        </Pressable>
      </View>

      <ScoreBoard score={score} highScore={highScore} combo={combo} />

      <View style={styles.boardWrap}>
        <View>
          <Grid
            grid={grid}
            cellSize={CELL_SIZE}
            previews={previews}
            onMeasure={(x, y) => {
              gridOrigin.current = { x, y };
            }}
          />
          <ClearFlash key={flash.id} cells={flash.cells} cellSize={CELL_SIZE} />
        </View>
        <ComboPopup key={`combo-${combo}`} combo={combo} />
      </View>

      <BlockTray
        tray={tray}
        cellSize={TRAY_CELL_SIZE}
        onDragStart={() => {}}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      />

      <GameOverModal
        visible={isGameOver}
        score={score}
        highScore={highScore}
        onRestart={newGame}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: SCREEN_PADDING,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brand: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  newGame: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newGameText: { color: '#475569', fontWeight: '700' },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
