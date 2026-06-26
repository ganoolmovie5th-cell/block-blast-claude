import { BlockShape, Cell, Grid, GRID_SIZE } from './types';

/** Create an empty GRID_SIZE x GRID_SIZE grid. */
export function createEmptyGrid(): Grid {
  const grid: Grid = [];
  for (let r = 0; r < GRID_SIZE; r += 1) {
    const row: Cell[] = [];
    for (let c = 0; c < GRID_SIZE; c += 1) {
      row.push({ filled: false, color: null });
    }
    grid.push(row);
  }
  return grid;
}

/** Deep copy a grid (cells are flat objects, so a shallow per-cell clone suffices). */
function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Can `shape` be placed with its top-left corner at (row, col) without going
 * out of bounds or overlapping a filled cell?
 */
export function canPlaceBlock(
  grid: Grid,
  shape: BlockShape,
  row: number,
  col: number,
): boolean {
  for (let r = 0; r < shape.matrix.length; r += 1) {
    for (let c = 0; c < shape.matrix[r].length; c += 1) {
      if (!shape.matrix[r][c]) continue;
      const gr = row + r;
      const gc = col + c;
      if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
      if (grid[gr][gc].filled) return false;
    }
  }
  return true;
}

/**
 * Return a new grid with `shape` placed at (row, col). Caller should ensure the
 * placement is valid via canPlaceBlock first.
 */
export function placeBlock(
  grid: Grid,
  shape: BlockShape,
  row: number,
  col: number,
): Grid {
  const next = cloneGrid(grid);
  for (let r = 0; r < shape.matrix.length; r += 1) {
    for (let c = 0; c < shape.matrix[r].length; c += 1) {
      if (!shape.matrix[r][c]) continue;
      next[row + r][col + c] = { filled: true, color: shape.color };
    }
  }
  return next;
}

/**
 * Detect and clear all full rows and columns. Full lines are collected first,
 * then emptied together so a row and column clearing in the same move do not
 * interfere with each other's detection.
 */
export function clearLines(grid: Grid): {
  grid: Grid;
  cleared: number;
  cells: [number, number][];
} {
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r += 1) {
    if (grid[r].every((cell) => cell.filled)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c += 1) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r += 1) {
      if (!grid[r][c].filled) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  if (fullRows.length === 0 && fullCols.length === 0) {
    return { grid, cleared: 0, cells: [] };
  }

  const next = cloneGrid(grid);
  const clearedSet = new Set<string>();
  const cells: [number, number][] = [];

  const clear = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (!clearedSet.has(key)) {
      clearedSet.add(key);
      cells.push([r, c]);
    }
    next[r][c] = { filled: false, color: null };
  };

  for (const r of fullRows) {
    for (let c = 0; c < GRID_SIZE; c += 1) clear(r, c);
  }
  for (const c of fullCols) {
    for (let r = 0; r < GRID_SIZE; r += 1) clear(r, c);
  }

  return { grid: next, cleared: fullRows.length + fullCols.length, cells };
}

/**
 * Is the game over? True when no non-null block in the tray can be placed at
 * any position on the grid.
 */
export function isGameOver(grid: Grid, tray: (BlockShape | null)[]): boolean {
  for (const shape of tray) {
    if (!shape) continue;
    for (let r = 0; r < GRID_SIZE; r += 1) {
      for (let c = 0; c < GRID_SIZE; c += 1) {
        if (canPlaceBlock(grid, shape, r, c)) return false;
      }
    }
  }
  return true;
}
