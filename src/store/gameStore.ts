import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Grid, BlockShape, TRAY_SIZE } from '../core/types';
import {
  createEmptyGrid,
  canPlaceBlock,
  placeBlock,
  clearLines,
  isGameOver,
} from '../core/gameLogic';
import { generateRandomTray, cellCount, BLOCK_CATALOG } from '../core/blocks';
import { lineScore, applyCombo, nextCombo } from '../core/scoring';
import { generateDailyTray, todayStr } from '../core/dailyChallenge';
import { GameMode, TIMED_DURATION, createObstacleGrid, pickProgressiveShape } from '../core/gameModes';
import { PowerUpState, defaultPowerUps, earnPowerUps, applyBomb, applyColorBlast, rotateShape } from '../core/powerUps';
import { Stats, defaultStats, checkNewAchievements } from '../core/achievements';
import { hapticPlace, hapticClear, hapticCombo, hapticGameOver, hapticPowerUp } from '../core/haptics';

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
  dailyCompleted: string | null;
  // Theme
  themeId: string;
  // Game modes
  gameMode: GameMode;
  timerSeconds: number; // countdown for timed mode
  trayCount: number; // how many trays have been used (progressive difficulty)
  // Power-ups
  powerUps: PowerUpState;
  // Stats & achievements
  stats: Stats;
  unlockedAchievements: string[];
  newAchievement: string | null; // latest unlocked (for popup), cleared after shown
  // Streak
  lastPlayDate: string | null;
  // Onboarding
  tutorialSeen: boolean;
  // Actions
  newGame: () => void;
  startMode: (mode: GameMode) => void;
  dropBlock: (trayIndex: number, row: number, col: number) => void;
  undo: () => void;
  startDaily: () => void;
  setTheme: (id: string) => void;
  tickTimer: () => void;
  useBomb: (row: number, col: number) => void;
  useColorBlast: (color: string) => void;
  useRotate: (trayIndex: number) => void;
  dismissAchievement: () => void;
  markTutorialSeen: () => void;
};

function generateTrayForMode(mode: GameMode, trayCount: number, dailyDate?: string | null, dailyTrayIndex?: number): BlockShape[] {
  if (mode === 'daily' && dailyDate) {
    return generateDailyTray(dailyDate, dailyTrayIndex ?? 0);
  }
  if (mode === 'obstacles') {
    // progressive shapes for obstacle mode too
    return Array.from({ length: TRAY_SIZE }, () => pickProgressiveShape(trayCount));
  }
  if (trayCount >= 10) {
    // progressive difficulty after 10 trays in classic/timed/zen
    return Array.from({ length: TRAY_SIZE }, () => pickProgressiveShape(trayCount));
  }
  return generateRandomTray();
}

function updateStreak(lastPlayDate: string | null): { dailyStreak: number; lastPlayDate: string } {
  const today = todayStr();
  if (lastPlayDate === today) return { dailyStreak: 0, lastPlayDate: today }; // no change signal
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (lastPlayDate === yStr) {
    return { dailyStreak: 1, lastPlayDate: today }; // increment
  }
  return { dailyStreak: -1, lastPlayDate: today }; // reset to 1
}

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
      undoSnapshot: null,
      undoUsed: false,
      isDailyMode: false,
      dailyDate: null,
      dailyTrayIndex: 0,
      dailyHighScore: 0,
      dailyCompleted: null,
      themeId: 'classic',
      gameMode: 'classic' as GameMode,
      timerSeconds: TIMED_DURATION,
      trayCount: 0,
      powerUps: { ...defaultPowerUps },
      stats: { ...defaultStats },
      unlockedAchievements: [],
      newAchievement: null,
      lastPlayDate: null,
      tutorialSeen: false,

      newGame: () => {
        const state = get();
        // Record game end stats
        const stats = { ...state.stats, gamesPlayed: state.stats.gamesPlayed + 1 };
        if (state.score > stats.bestScore) stats.bestScore = state.score;
        // Streak
        const streakInfo = updateStreak(state.lastPlayDate);
        if (streakInfo.dailyStreak === 1) stats.dailyStreak += 1;
        else if (streakInfo.dailyStreak === -1) stats.dailyStreak = 1;
        // Check achievements
        const newAchs = checkNewAchievements(stats, state.unlockedAchievements);
        const unlocked = [...state.unlockedAchievements, ...newAchs.map((a) => a.id)];

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
          gameMode: 'classic',
          timerSeconds: TIMED_DURATION,
          trayCount: 0,
          powerUps: { ...defaultPowerUps },
          stats,
          unlockedAchievements: unlocked,
          newAchievement: newAchs.length > 0 ? newAchs[0].id : null,
          lastPlayDate: streakInfo.lastPlayDate,
        });
      },

      startMode: (mode: GameMode) => {
        const grid = mode === 'obstacles' ? createObstacleGrid() : createEmptyGrid();
        set({
          grid,
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
          gameMode: mode,
          timerSeconds: TIMED_DURATION,
          trayCount: 0,
          powerUps: { ...defaultPowerUps },
          newAchievement: null,
        });
      },

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
          gameMode: 'daily',
          timerSeconds: TIMED_DURATION,
          trayCount: 0,
          powerUps: { ...defaultPowerUps },
          newAchievement: null,
        });
      },

      dropBlock: (trayIndex, row, col) => {
        const state = get();
        const shape = state.tray[trayIndex];
        if (!shape) return;
        if (!canPlaceBlock(state.grid, shape, row, col)) return;

        hapticPlace();

        const snapshot: Snapshot = {
          grid: state.grid,
          tray: state.tray,
          score: state.score,
          combo: state.combo,
        };

        const placed = placeBlock(state.grid, shape, row, col);
        const { grid: clearedGrid, cleared, cells } = clearLines(placed);

        if (cleared > 0) hapticClear();

        const newCombo = nextCombo(state.combo, cleared);
        if (newCombo > 1 && newCombo > state.combo) hapticCombo();

        const base = cellCount(shape) + lineScore(cleared);
        const gained = applyCombo(base, newCombo);
        const score = state.score + gained;
        const highScore = Math.max(state.highScore, score);

        // Power-ups earned
        const earned = earnPowerUps(state.score, score);
        const powerUps = { ...state.powerUps };
        if (earned > 0) {
          // Distribute evenly: cycle through bomb/colorBlast/rotate
          const types: (keyof PowerUpState)[] = ['bomb', 'colorBlast', 'rotate'];
          for (let i = 0; i < earned; i++) {
            powerUps[types[i % 3]] += 1;
          }
        }

        // Update stats
        const stats = { ...state.stats };
        stats.totalLinesCleared += cleared;
        stats.totalScore += gained;
        if (newCombo > stats.bestCombo) stats.bestCombo = newCombo;
        if (cleared > stats.maxLinesOneMove) stats.maxLinesOneMove = cleared;

        // Consume block; refill when tray empty.
        let tray = state.tray.map((b, i) => (i === trayIndex ? null : b));
        let { dailyTrayIndex, trayCount } = state;
        if (tray.every((b) => b === null)) {
          trayCount += 1;
          if (state.isDailyMode && state.dailyDate) {
            dailyTrayIndex += 1;
            tray = generateDailyTray(state.dailyDate, dailyTrayIndex);
          } else {
            tray = generateTrayForMode(state.gameMode, trayCount);
          }
        }

        // Zen mode: if game would be over, just give new tray
        let gameOver: boolean;
        if (state.gameMode === 'zen') {
          gameOver = false;
          if (isGameOver(clearedGrid, tray)) {
            trayCount += 1;
            tray = generateRandomTray();
          }
        } else {
          gameOver = isGameOver(clearedGrid, tray);
        }

        if (gameOver) hapticGameOver();

        let dailyHighScore = state.dailyHighScore;
        let dailyCompleted = state.dailyCompleted;
        if (state.isDailyMode) {
          dailyHighScore = Math.max(dailyHighScore, score);
          if (gameOver) dailyCompleted = state.dailyDate;
        }

        // Check achievements
        if (score > stats.bestScore) stats.bestScore = score;
        const newAchs = checkNewAchievements(stats, state.unlockedAchievements);
        const unlocked = [...state.unlockedAchievements, ...newAchs.map((a) => a.id)];

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
          trayCount,
          powerUps,
          stats,
          unlockedAchievements: unlocked,
          newAchievement: newAchs.length > 0 ? newAchs[0].id : state.newAchievement,
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

      tickTimer: () => {
        const state = get();
        if (state.gameMode !== 'timed' || state.isGameOver) return;
        const next = state.timerSeconds - 1;
        if (next <= 0) {
          hapticGameOver();
          set({ timerSeconds: 0, isGameOver: true });
        } else {
          set({ timerSeconds: next });
        }
      },

      useBomb: (row, col) => {
        const state = get();
        if (state.powerUps.bomb <= 0) return;
        hapticPowerUp();
        const { grid, cells } = applyBomb(state.grid, row, col);
        set({
          grid,
          lastCleared: cells,
          powerUps: { ...state.powerUps, bomb: state.powerUps.bomb - 1 },
        });
      },

      useColorBlast: (color) => {
        const state = get();
        if (state.powerUps.colorBlast <= 0) return;
        hapticPowerUp();
        const { grid, cells } = applyColorBlast(state.grid, color);
        set({
          grid,
          lastCleared: cells,
          powerUps: { ...state.powerUps, colorBlast: state.powerUps.colorBlast - 1 },
        });
      },

      useRotate: (trayIndex) => {
        const state = get();
        if (state.powerUps.rotate <= 0) return;
        const shape = state.tray[trayIndex];
        if (!shape) return;
        hapticPowerUp();
        const rotated: BlockShape = { ...shape, matrix: rotateShape(shape.matrix) };
        const tray = state.tray.map((b, i) => (i === trayIndex ? rotated : b));
        set({
          tray,
          powerUps: { ...state.powerUps, rotate: state.powerUps.rotate - 1 },
        });
      },

      dismissAchievement: () => set({ newAchievement: null }),
      markTutorialSeen: () => set({ tutorialSeen: true }),
    }),
    {
      name: 'block-blast-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        highScore: state.highScore,
        dailyHighScore: state.dailyHighScore,
        dailyCompleted: state.dailyCompleted,
        themeId: state.themeId,
        stats: state.stats,
        unlockedAchievements: state.unlockedAchievements,
        lastPlayDate: state.lastPlayDate,
        tutorialSeen: state.tutorialSeen,
      }),
    },
  ),
);
