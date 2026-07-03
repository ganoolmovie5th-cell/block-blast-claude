import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { GRID_SIZE } from '../core/types';
import { canPlaceBlock } from '../core/gameLogic';
import { getTheme } from '../core/themes';
import { todayStr } from '../core/dailyChallenge';
import { TIMED_DURATION } from '../core/gameModes';
import { Grid } from '../components/Grid';
import { BlockTray } from '../components/BlockTray';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameOverModal } from '../components/GameOverModal';
import { ClearFlash } from '../components/ClearFlash';
import { ComboPopup } from '../components/ComboPopup';
import { ThemePicker } from '../components/ThemePicker';
import { AchievementPopup } from '../components/AchievementPopup';
import { StatsModal } from '../components/StatsModal';
import { ModePickerModal } from '../components/ModePickerModal';
import { PowerUpBar } from '../components/PowerUpBar';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { Confetti } from '../components/Confetti';
import {
  CELL_MARGIN,
  BOARD_PADDING,
  FIRST_CELL_OFFSET,
  cellStep,
  DRAG_LIFT,
} from '../components/boardLayout';

const SCREEN_PADDING = 16;
const screenWidth = Dimensions.get('window').width;
const available = screenWidth - SCREEN_PADDING * 2;
const CELL_SIZE = Math.floor(
  (available - BOARD_PADDING * 2) / GRID_SIZE - CELL_MARGIN * 2,
);
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
  const undoSnapshot = useGameStore((s) => s.undoSnapshot);
  const undoUsed = useGameStore((s) => s.undoUsed);
  const undo = useGameStore((s) => s.undo);
  const isDailyMode = useGameStore((s) => s.isDailyMode);
  const dailyHighScore = useGameStore((s) => s.dailyHighScore);
  const dailyCompleted = useGameStore((s) => s.dailyCompleted);
  const startDaily = useGameStore((s) => s.startDaily);
  const themeId = useGameStore((s) => s.themeId);
  const setTheme = useGameStore((s) => s.setTheme);
  const gameMode = useGameStore((s) => s.gameMode);
  const timerSeconds = useGameStore((s) => s.timerSeconds);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const startMode = useGameStore((s) => s.startMode);
  const powerUps = useGameStore((s) => s.powerUps);
  const useBomb = useGameStore((s) => s.useBomb);
  const useColorBlast = useGameStore((s) => s.useColorBlast);
  const useRotate = useGameStore((s) => s.useRotate);
  const stats = useGameStore((s) => s.stats);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const newAchievement = useGameStore((s) => s.newAchievement);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);
  const tutorialSeen = useGameStore((s) => s.tutorialSeen);
  const markTutorialSeen = useGameStore((s) => s.markTutorialSeen);

  const theme = getTheme(themeId);
  const c = theme.colors;

  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const [showModePicker, setShowModePicker] = React.useState(false);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);

  const gridOrigin = React.useRef({ x: 0, y: 0 });
  const [previews, setPreviews] = React.useState<Record<string, 'valid' | 'invalid'>>({});
  const [flash, setFlash] = React.useState<{ cells: [number, number][]; id: number }>({ cells: [], id: 0 });

  // Timed mode timer
  React.useEffect(() => {
    if (gameMode !== 'timed' || isGameOver) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [gameMode, isGameOver, tickTimer]);

  // Confetti on multi-line clear
  React.useEffect(() => {
    if (lastCleared.length >= 16) { // 2+ lines = 16+ cells
      setConfettiTrigger((t) => t + 1);
    }
    if (lastCleared.length > 0) {
      setFlash((f) => ({ cells: lastCleared, id: f.id + 1 }));
    }
  }, [lastCleared]);

  const resolveCell = React.useCallback(
    (index: number, absoluteX: number, absoluteY: number) => {
      const shape = tray[index];
      if (!shape) return null;
      const step = cellStep(CELL_SIZE);
      const cols = shape.matrix[0].length;
      const rows = shape.matrix.length;
      const firstX = gridOrigin.current.x + FIRST_CELL_OFFSET;
      const firstY = gridOrigin.current.y + FIRST_CELL_OFFSET;
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
      const map: Record<string, 'valid' | 'invalid'> = {};
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

  const canUndo = !undoUsed && undoSnapshot !== null;
  const dailyAvailable = dailyCompleted !== todayStr();

  // Power-up handlers (simplified: bomb targets center, colorBlast picks most common, rotate first available)
  const handleBomb = () => {
    // Use bomb at center of grid for now
    useBomb(3, 3);
  };
  const handleColorBlast = () => {
    // Find most common color on board
    const colorCount: Record<string, number> = {};
    for (const row of grid) {
      for (const cell of row) {
        if (cell.filled && cell.color) {
          colorCount[cell.color] = (colorCount[cell.color] || 0) + 1;
        }
      }
    }
    const top = Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0];
    if (top) useColorBlast(top[0]);
  };
  const handleRotate = () => {
    const idx = tray.findIndex((b) => b !== null);
    if (idx >= 0) useRotate(idx);
  };

  // Format timer
  const timerDisplay = gameMode === 'timed'
    ? `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`
    : null;

  // Mode label
  const modeLabel = gameMode === 'daily' ? '📅 Daily'
    : gameMode === 'timed' ? `⏱️ ${timerDisplay}`
    : gameMode === 'zen' ? '🧘 Zen'
    : gameMode === 'obstacles' ? '🧱 Obstacles'
    : 'Block Blast';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: c.bg }]}>
      {/* Tutorial */}
      {!tutorialSeen && <TutorialOverlay onDismiss={markTutorialSeen} />}

      {/* Confetti */}
      <Confetti trigger={confettiTrigger} />

      {/* Achievement popup */}
      <AchievementPopup achievementId={newAchievement} onDismiss={dismissAchievement} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.brand, { color: c.text }]}>{modeLabel}</Text>
        <View style={styles.headerRight}>
          {dailyAvailable && gameMode !== 'daily' ? (
            <Pressable style={[styles.headerBtn, { backgroundColor: c.accent }]} onPress={startDaily} accessibilityRole="button">
              <Text style={[styles.headerBtnText, { color: c.buttonText }]}>Daily</Text>
            </Pressable>
          ) : null}
          <Pressable style={[styles.headerBtn, { backgroundColor: c.headerBg }]} onPress={() => setShowModePicker(true)} accessibilityRole="button" accessibilityLabel="Game modes">
            <Text style={[styles.headerBtnText, { color: c.textSecondary }]}>🎯</Text>
          </Pressable>
          <Pressable style={[styles.headerBtn, { backgroundColor: c.headerBg }]} onPress={() => setShowStats(true)} accessibilityRole="button" accessibilityLabel="Statistics">
            <Text style={[styles.headerBtnText, { color: c.textSecondary }]}>📊</Text>
          </Pressable>
          <Pressable style={[styles.headerBtn, { backgroundColor: c.headerBg }]} onPress={() => setShowThemePicker(true)} accessibilityRole="button" accessibilityLabel="Themes">
            <Text style={[styles.headerBtnText, { color: c.textSecondary }]}>🎨</Text>
          </Pressable>
          <Pressable style={[styles.headerBtn, { backgroundColor: c.headerBg }]} onPress={newGame} accessibilityRole="button" accessibilityLabel="New game">
            <Text style={[styles.headerBtnText, { color: c.textSecondary }]}>New</Text>
          </Pressable>
        </View>
      </View>

      <ScoreBoard
        score={score}
        highScore={isDailyMode ? dailyHighScore : highScore}
        combo={combo}
        canUndo={canUndo}
        onUndo={undo}
        textColor={c.text}
        textSecondary={c.textSecondary}
        accentColor={c.accent}
      />

      {/* Power-ups bar */}
      <PowerUpBar
        powerUps={powerUps}
        onBomb={handleBomb}
        onColorBlast={handleColorBlast}
        onRotate={handleRotate}
        accentColor={c.accent}
      />

      <View style={styles.boardWrap}>
        <View>
          <Grid
            grid={grid}
            cellSize={CELL_SIZE}
            previews={previews}
            onMeasure={(x, y) => { gridOrigin.current = { x, y }; }}
            boardBg={c.boardBg}
            cellEmpty={c.cellEmpty}
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

      {/* Modals */}
      <GameOverModal
        visible={isGameOver}
        score={score}
        highScore={highScore}
        isDaily={isDailyMode}
        dailyHighScore={dailyHighScore}
        onRestart={isDailyMode ? startDaily : newGame}
        onNewDaily={isDailyMode ? newGame : undefined}
        accentColor={c.accent}
        textColor={c.text}
      />
      <ThemePicker
        visible={showThemePicker}
        currentThemeId={themeId}
        highScore={highScore}
        onSelect={(id) => { setTheme(id); setShowThemePicker(false); }}
        onClose={() => setShowThemePicker(false)}
      />
      <StatsModal
        visible={showStats}
        stats={stats}
        unlockedAchievements={unlockedAchievements}
        streak={stats.dailyStreak}
        onClose={() => setShowStats(false)}
      />
      <ModePickerModal
        visible={showModePicker}
        onSelect={(mode) => { startMode(mode); setShowModePicker(false); }}
        onClose={() => setShowModePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SCREEN_PADDING },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerRight: { flexDirection: 'row', gap: 6 },
  brand: { fontSize: 20, fontWeight: '800' },
  headerBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  headerBtnText: { fontWeight: '700', fontSize: 13 },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
