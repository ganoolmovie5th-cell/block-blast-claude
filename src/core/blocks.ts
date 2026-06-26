import { BlockShape, TRAY_SIZE } from './types';

// Compact helper: build a matrix from rows of 1/0.
const m = (rows: number[][]): boolean[][] => rows.map((r) => r.map((v) => v === 1));

// Bright, distinct colors per shape family (classic Block Blast palette).
const COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  green: '#22c55e',
  teal: '#14b8a6',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  lime: '#84cc16',
};

/** All placeable block shapes. */
export const BLOCK_CATALOG: BlockShape[] = [
  { id: 'single', color: COLORS.pink, matrix: m([[1]]) },
  { id: 'line2', color: COLORS.blue, matrix: m([[1, 1]]) },
  { id: 'line3', color: COLORS.teal, matrix: m([[1, 1, 1]]) },
  { id: 'line4', color: COLORS.indigo, matrix: m([[1, 1, 1, 1]]) },
  { id: 'line5', color: COLORS.purple, matrix: m([[1, 1, 1, 1, 1]]) },
  { id: 'square2', color: COLORS.amber, matrix: m([[1, 1], [1, 1]]) },
  { id: 'square3', color: COLORS.orange, matrix: m([[1, 1, 1], [1, 1, 1], [1, 1, 1]]) },
  { id: 'lSmall', color: COLORS.green, matrix: m([[1, 0], [1, 1]]) },
  { id: 'lBig', color: COLORS.red, matrix: m([[1, 0], [1, 0], [1, 1]]) },
  { id: 'jBig', color: COLORS.lime, matrix: m([[0, 1], [0, 1], [1, 1]]) },
  { id: 'tShape', color: COLORS.blue, matrix: m([[1, 1, 1], [0, 1, 0]]) },
  { id: 'sShape', color: COLORS.teal, matrix: m([[0, 1, 1], [1, 1, 0]]) },
  { id: 'zShape', color: COLORS.pink, matrix: m([[1, 1, 0], [0, 1, 1]]) },
  { id: 'plus', color: COLORS.purple, matrix: m([[0, 1, 0], [1, 1, 1], [0, 1, 0]]) },
];

/** Count the filled subcells of a shape. */
export function cellCount(shape: BlockShape): number {
  let count = 0;
  for (const row of shape.matrix) {
    for (const v of row) {
      if (v) count += 1;
    }
  }
  return count;
}

/** Pick TRAY_SIZE random shapes (with replacement) from the catalog. */
export function generateRandomTray(): BlockShape[] {
  const tray: BlockShape[] = [];
  for (let i = 0; i < TRAY_SIZE; i += 1) {
    const idx = Math.floor(Math.random() * BLOCK_CATALOG.length);
    tray.push(BLOCK_CATALOG[idx]);
  }
  return tray;
}
