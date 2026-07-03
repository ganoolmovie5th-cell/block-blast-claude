import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Grid, BlockShape } from '../core/types';
import {
  createEmptyGrid,
  canPlaceBlock,
  placeBlock,
  clearLines,
  isGameOver,
} from '../core/gameLogic';
import { generateRandomTray, cellCount } from '../core/blocks';
import { lineScore, applyCombo, nextCombo } from '../core/scoring';
import { generateDailyTray, todayStr } from '../core/dailyChallenge';

// ── Undo snapshot ──────────────────────────────────────────────────────────────
type Snapshot = {
  grid: Grid;
  tray: (BlockShape | null)[];
  score: number;
  combo: number;
};

// ── Store shape ────────────────────────────────────────────────────────────────
type GameStore = GameState & {
  lastCleared: [number, number][];
  // Undo
  undoSnapshot: Snapshot | null;
  undoUsed: boolean;
  // Daily challenge
  isDailyMode: boolean;
  dailyDate: string | null;
  dailyTrayIndex: number;
  dailyHighScore: number;
  dailyCompleted: string | null; // date string of last completed daily
  // Theme
  themeId: string;
  // Actions
  newGame: () => void;
  dropBlock: (trayIndex: number, row: number, col: number) => void;
  undo: () => void;
  startDaily: () => void;
  setTheme: (id: string) => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      grid: createEmptyGrid(),
      tray: generateRandomTray(),
      score: 0,
      highScore: 0,
      combo: 0,
      isGameOver: false,
      lastCleared: [],
      // Undo
      undoSnapshot: null,
      undoUsed: false,
      // Daily
      isDailyMode: false,
      dailyDate: null,
      dailyTrayIndex: 0,
      dailyHighScore: 0,
      dailyCompleted: null,
      // Theme
      themeId: 'classic',

      newGame: () =>
        set({
          grid: createEmptyGrid(),
          tray: generateRandomTray(),
          score: 0,
          combo: 0,
          isGameOver: false,
          lastCleared: [],
          undoSnapshot: null,
          undoUsed: false,
          isDailyMode: false,
          dailyDate: null,
          dailyTrayIndex: 0,
        }),

      startDaily: () => {
        const date = todayStr();
        set({
          grid: createEmptyGrid(),
          tray: generateDailyTray(date, 0),
          score: 0,
          combo: 0,
          isGameOver: false,
          lastCleared: [],
          undoSnapshot: null,
          undoUsed: false,
          isDailyMode: true,
          dailyDate: date,
          dailyTrayIndex: 0,
        });
      },

      dropBlock: (trayIndex, row, col) => {
        const state = get();
        const shape = state.tray[trayIndex];
        if (!shape) return;
        if (!canPlaceBlock(state.grid, shape, row, col)) return;

        // Save undo snapshot (before this move).
        const snapshot: Snapshot = {
          grid: state.grid,
          tray: state.tray,
          score: state.score,
          combo: state.combo,
        };

        // Place the block.
        const placed = placeBlock(state.grid, shape, row, col);
        const { grid: clearedGrid, cleared, cells } = clearLines(placed);

        // Scoring + combo.
        const newCombo = nextCombo(state.combo, cleared);
        const base = cellCount(shape) + lineScore(cleared);
        const gained = applyCombo(base, newCombo);
        const score = state.score + gained;
        const highScore = Math.max(state.highScore, score);

        // Consume the block; refill when the tray is empty.
        let tray = state.tray.map((b, i) => (i === trayIndex ? null : b));
        let dailyTrayIndex = state.dailyTrayIndex;
        if (tray.every((b) => b === null)) {
          if (state.isDailyMode && state.dailyDate) {
            dailyTrayIndex += 1;
            tray = generateDailyTray(state.dailyDate, dailyTrayIndex);
          } else {
            tray = generateRandomTray();
          }
        }

        const gameOver = isGameOver(clearedGrid, tray);

        // Daily high score.
        let dailyHighScore = state.dailyHighScore;
        let dailyCompleted = state.dailyCompleted;
        if (state.isDailyMode) {
          dailyHighScore = Math.max(dailyHighScore, score);
          if (gameOver) dailyCompleted = state.dailyDate;
        }

        set({
          grid: clearedGrid,
          tray,
          score,
          highScore,
          combo: newCombo,
          lastCleared: cells,
          isGameOver: gameOver,
          undoSnapshot: snapshot,
          dailyTrayIndex,
          dailyHighScore,
          dailyCompleted,
        });
      },

      undo: () => {
        const state = get();
        if (state.undoUsed || !state.undoSnapshot) return;
        set({
          grid: state.undoSnapshot.grid,
          tray: state.undoSnapshot.tray,
          score: state.undoSnapshot.score,
          combo: state.undoSnapshot.combo,
          isGameOver: false,
          lastCleared: [],
          undoUsed: true,
          undoSnapshot: null,
        });
      },

      setTheme: (id: string) => set({ themeId: id }),
    }),
    {
      name: 'block-blast-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        highScore: state.highScore,
        dailyHighScore: state.dailyHighScore,
        dailyCompleted: state.dailyCompleted,
        themeId: state.themeId,
      }),
    },
  ),
);
