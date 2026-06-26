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
