// Power-up system. Pure logic, no React.
import { Grid, GRID_SIZE } from './types';

export type PowerUpType = 'bomb' | 'colorBlast' | 'rotate';

export type PowerUpState = {
  bomb: number;
  colorBlast: number;
  rotate: number;
};

export const POWER_UP_COST = 500; // points to earn one power-up

export const defaultPowerUps: PowerUpState = { bomb: 0, colorBlast: 0, rotate: 0 };

/** Calculate how many new power-ups earned from score gained. */
export function earnPowerUps(scoreBefore: number, scoreAfter: number): number {
  const before = Math.floor(scoreBefore / POWER_UP_COST);
  const after = Math.floor(scoreAfter / POWER_UP_COST);
  return after - before;
}

/** Bomb: clear a 3x3 area centered at (row, col). Returns new grid + cleared cells. */
export function applyBomb(grid: Grid, row: number, col: number): { grid: Grid; cells: [number, number][] } {
  const next = grid.map((r) => r.map((c) => ({ ...c })));
  const cells: [number, number][] = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && next[r][c].filled) {
        next[r][c] = { filled: false, color: null };
        cells.push([r, c]);
      }
    }
  }
  return { grid: next, cells };
}

/** Color Blast: remove all cells of a specific color. */
export function applyColorBlast(grid: Grid, color: string): { grid: Grid; cells: [number, number][] } {
  const next = grid.map((r) => r.map((c) => ({ ...c })));
  const cells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (next[r][c].filled && next[r][c].color === color) {
        next[r][c] = { filled: false, color: null };
        cells.push([r, c]);
      }
    }
  }
  return { grid: next, cells };
}

/** Rotate a block shape 90° clockwise. */
export function rotateShape(matrix: boolean[][]): boolean[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: boolean[][] = Array.from({ length: cols }, () => Array(rows).fill(false));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}
