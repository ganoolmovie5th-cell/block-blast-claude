// Achievement badges system. Pure logic, no React.

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Check function receives cumulative stats. */
  check: (stats: Stats) => boolean;
};

export type Stats = {
  gamesPlayed: number;
  totalScore: number;
  totalLinesCleared: number;
  bestScore: number;
  bestCombo: number;
  maxLinesOneMove: number;
  dailyStreak: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', icon: '🎮', check: (s) => s.gamesPlayed >= 1 },
  { id: 'score_500', name: 'Getting Warm', description: 'Score 500+ in one game', icon: '🔥', check: (s) => s.bestScore >= 500 },
  { id: 'score_1000', name: 'On Fire', description: 'Score 1000+ in one game', icon: '💥', check: (s) => s.bestScore >= 1000 },
  { id: 'score_2000', name: 'Unstoppable', description: 'Score 2000+ in one game', icon: '⚡', check: (s) => s.bestScore >= 2000 },
  { id: 'score_5000', name: 'Legend', description: 'Score 5000+ in one game', icon: '👑', check: (s) => s.bestScore >= 5000 },
  { id: 'combo_3', name: 'Combo Starter', description: 'Reach combo x3', icon: '✨', check: (s) => s.bestCombo >= 3 },
  { id: 'combo_5', name: 'Combo Master', description: 'Reach max combo x5', icon: '🌟', check: (s) => s.bestCombo >= 5 },
  { id: 'clear_4', name: 'Quad Clear', description: 'Clear 4 lines in one move', icon: '💎', check: (s) => s.maxLinesOneMove >= 4 },
  { id: 'lines_50', name: 'Line Destroyer', description: 'Clear 50 total lines', icon: '🧹', check: (s) => s.totalLinesCleared >= 50 },
  { id: 'lines_200', name: 'Line Annihilator', description: 'Clear 200 total lines', icon: '🌊', check: (s) => s.totalLinesCleared >= 200 },
  { id: 'games_10', name: 'Dedicated', description: 'Play 10 games', icon: '🏋️', check: (s) => s.gamesPlayed >= 10 },
  { id: 'games_50', name: 'Addicted', description: 'Play 50 games', icon: '🎯', check: (s) => s.gamesPlayed >= 50 },
  { id: 'streak_3', name: 'Consistent', description: '3-day play streak', icon: '📅', check: (s) => s.dailyStreak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day play streak', icon: '🗓️', check: (s) => s.dailyStreak >= 7 },
];

export function checkNewAchievements(stats: Stats, unlocked: string[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id) && a.check(stats));
}

export const defaultStats: Stats = {
  gamesPlayed: 0,
  totalScore: 0,
  totalLinesCleared: 0,
  bestScore: 0,
  bestCombo: 0,
  maxLinesOneMove: 0,
  dailyStreak: 0,
};
