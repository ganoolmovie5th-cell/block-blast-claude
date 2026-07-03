// Theme skins for Block Blast. Pure data, no React.

export type Theme = {
  id: string;
  name: string;
  /** Unlock condition: high score threshold (0 = always unlocked). */
  unlockScore: number;
  colors: {
    bg: string;
    boardBg: string;
    cellEmpty: string;
    text: string;
    textSecondary: string;
    accent: string;
    headerBg: string;
    buttonBg: string;
    buttonText: string;
  };
};

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    unlockScore: 0,
    colors: {
      bg: '#f8fafc',
      boardBg: '#cbd5e1',
      cellEmpty: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#475569',
      accent: '#a855f7',
      headerBg: '#e2e8f0',
      buttonBg: '#a855f7',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    unlockScore: 200,
    colors: {
      bg: '#0f172a',
      boardBg: '#1e293b',
      cellEmpty: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      accent: '#38bdf8',
      headerBg: '#1e293b',
      buttonBg: '#38bdf8',
      buttonText: '#0f172a',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    unlockScore: 500,
    colors: {
      bg: '#f0fdf4',
      boardBg: '#86efac',
      cellEmpty: '#bbf7d0',
      text: '#14532d',
      textSecondary: '#166534',
      accent: '#16a34a',
      headerBg: '#dcfce7',
      buttonBg: '#16a34a',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    unlockScore: 1000,
    colors: {
      bg: '#fff7ed',
      boardBg: '#fed7aa',
      cellEmpty: '#ffedd5',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      accent: '#ea580c',
      headerBg: '#fff7ed',
      buttonBg: '#ea580c',
      buttonText: '#ffffff',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    unlockScore: 2000,
    colors: {
      bg: '#18181b',
      boardBg: '#27272a',
      cellEmpty: '#3f3f46',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      accent: '#e879f9',
      headerBg: '#27272a',
      buttonBg: '#e879f9',
      buttonText: '#18181b',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
