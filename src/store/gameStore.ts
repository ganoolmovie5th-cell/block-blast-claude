import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, GRID_SIZE } from '../core/types';
import {
  createEmptyGrid,
  canPlaceBlock,
  placeBlock,
  clearLines,
  isGameOver,
} from '../core/gameLogic';
import { generateRandomTray, cellCount } from '../core/blocks';
import {
  placementScore,
  lineScore,
  applyCombo,
  nextCombo,
} from '../core/scoring';

type GameStore = GameState & {
  /** Cells cleared by the most recent move (for clear animations). */
  lastCleared: [number, number][];
  /** Start a fresh game, preserving the persisted high score. */
  newGame: () => void;
  /** Attempt to place tray[trayIndex] with top-left at (row, col). No-op if invalid. */
  dropBlock: (trayIndex: number, row: number, col: number) => void;
};

function freshTray() {
  return generateRandomTray();
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      grid: createEmptyGrid(),
      tray: freshTray(),
      score: 0,
      highScore: 0,
      combo: 0,
      isGameOver: false,
      lastCleared: [],

      newGame: () =>
        set({
          grid: createEmptyGrid(),
          tray: freshTray(),
          score: 0,
          combo: 0,
          isGameOver: false,
          lastCleared: [],
        }),

      dropBlock: (trayIndex, row, col) => {
        const state = get();
        const shape = state.tray[trayIndex];
        if (!shape) return;
        if (!canPlaceBlock(state.grid, shape, row, col)) return;

        // Place the block.
        const placed = placeBlock(state.grid, shape, row, col);

        // Clear any completed lines.
        const { grid: clearedGrid, cleared, cells } = clearLines(placed);

        // Scoring + combo.
        const newCombo = nextCombo(state.combo, cleared);
        const base = placementScore(cellCount(shape)) + lineScore(cleared);
        const multiplier = cleared > 0 ? newCombo : 1;
        const gained = applyCombo(base, multiplier);
        const score = state.score + gained;
        const highScore = Math.max(state.highScore, score);

        // Consume the block; refill when the tray is empty.
        let tray = state.tray.map((b, i) => (i === trayIndex ? null : b));
        if (tray.every((b) => b === null)) {
          tray = freshTray();
        }

        set({
          grid: clearedGrid,
          tray,
          score,
          highScore,
          combo: newCombo,
          lastCleared: cells,
          isGameOver: isGameOver(clearedGrid, tray),
        });
      },
    }),
    {
      name: 'block-blast-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the high score; everything else is transient.
      partialize: (state) => ({ highScore: state.highScore }),
    },
  ),
);

export { GRID_SIZE };
