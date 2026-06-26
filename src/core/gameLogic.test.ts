import { createEmptyGrid, canPlaceBlock, placeBlock } from './gameLogic';
import { BlockShape, GRID_SIZE } from './types';

const lShape: BlockShape = {
  id: 'lBig',
  color: '#ef4444',
  matrix: [
    [true, false],
    [true, false],
    [true, true],
  ],
};

const single: BlockShape = { id: 's', color: '#fff', matrix: [[true]] };

describe('createEmptyGrid', () => {
  it('creates a GRID_SIZE x GRID_SIZE grid of empty cells', () => {
    const grid = createEmptyGrid();
    expect(grid).toHaveLength(GRID_SIZE);
    for (const row of grid) {
      expect(row).toHaveLength(GRID_SIZE);
      for (const cell of row) {
        expect(cell.filled).toBe(false);
        expect(cell.color).toBeNull();
      }
    }
  });
});

describe('canPlaceBlock', () => {
  it('returns true when the block fits on an empty grid', () => {
    const grid = createEmptyGrid();
    expect(canPlaceBlock(grid, lShape, 0, 0)).toBe(true);
  });

  it('returns false when the block goes out of bounds (bottom)', () => {
    const grid = createEmptyGrid();
    // lShape is 3 rows tall; placing at row GRID_SIZE-1 overflows.
    expect(canPlaceBlock(grid, lShape, GRID_SIZE - 1, 0)).toBe(false);
  });

  it('returns false when the block goes out of bounds (right)', () => {
    const grid = createEmptyGrid();
    expect(canPlaceBlock(grid, single, 0, GRID_SIZE)).toBe(false);
  });

  it('returns false when it overlaps a filled cell', () => {
    let grid = createEmptyGrid();
    grid = placeBlock(grid, single, 0, 0);
    expect(canPlaceBlock(grid, single, 0, 0)).toBe(false);
  });
});

describe('placeBlock', () => {
  it('fills the target cells with the shape color and is immutable', () => {
    const grid = createEmptyGrid();
    const next = placeBlock(grid, lShape, 0, 0);

    // original untouched
    expect(grid[0][0].filled).toBe(false);

    // L-shape footprint filled
    expect(next[0][0].filled).toBe(true);
    expect(next[1][0].filled).toBe(true);
    expect(next[2][0].filled).toBe(true);
    expect(next[2][1].filled).toBe(true);
    expect(next[0][0].color).toBe('#ef4444');

    // non-footprint cell stays empty
    expect(next[0][1].filled).toBe(false);
  });
});

import { clearLines } from './gameLogic';

/** Fill an entire row in-place for test setup. */
function fillRow(grid: ReturnType<typeof createEmptyGrid>, r: number) {
  for (let c = 0; c < GRID_SIZE; c += 1) grid[r][c] = { filled: true, color: '#000' };
}

/** Fill an entire column in-place for test setup. */
function fillCol(grid: ReturnType<typeof createEmptyGrid>, c: number) {
  for (let r = 0; r < GRID_SIZE; r += 1) grid[r][c] = { filled: true, color: '#000' };
}

describe('clearLines', () => {
  it('clears a single full row', () => {
    const grid = createEmptyGrid();
    fillRow(grid, 3);
    const result = clearLines(grid);
    expect(result.cleared).toBe(1);
    for (let c = 0; c < GRID_SIZE; c += 1) {
      expect(result.grid[3][c].filled).toBe(false);
    }
    expect(result.cells).toHaveLength(GRID_SIZE);
  });

  it('clears a single full column', () => {
    const grid = createEmptyGrid();
    fillCol(grid, 5);
    const result = clearLines(grid);
    expect(result.cleared).toBe(1);
    for (let r = 0; r < GRID_SIZE; r += 1) {
      expect(result.grid[r][5].filled).toBe(false);
    }
  });

  it('clears a row and column simultaneously and counts both', () => {
    const grid = createEmptyGrid();
    fillRow(grid, 0);
    fillCol(grid, 0);
    const result = clearLines(grid);
    expect(result.cleared).toBe(2);
    // intersection cleared, plus whole row and column
    for (let c = 0; c < GRID_SIZE; c += 1) expect(result.grid[0][c].filled).toBe(false);
    for (let r = 0; r < GRID_SIZE; r += 1) expect(result.grid[r][0].filled).toBe(false);
  });

  it('returns cleared 0 and an unchanged grid when nothing is full', () => {
    const grid = createEmptyGrid();
    grid[2][2] = { filled: true, color: '#000' };
    const result = clearLines(grid);
    expect(result.cleared).toBe(0);
    expect(result.cells).toHaveLength(0);
    expect(result.grid[2][2].filled).toBe(true);
  });
});

import { isGameOver } from './gameLogic';

describe('isGameOver', () => {
  it('returns false on an empty grid with a non-empty tray', () => {
    const grid = createEmptyGrid();
    expect(isGameOver(grid, [single])).toBe(false);
  });

  it('returns true when no tray block fits anywhere', () => {
    // Fill the whole grid so nothing can be placed.
    const grid = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r += 1) fillRow(grid, r);
    expect(isGameOver(grid, [single, lShape])).toBe(true);
  });

  it('returns false when at least one non-null tray block fits', () => {
    const grid = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r += 1) fillRow(grid, r);
    // Open up exactly one cell so the 1x1 single fits there.
    grid[4][4] = { filled: false, color: null };
    expect(isGameOver(grid, [null, single, null])).toBe(false);
  });

  it('returns true when the tray is all null', () => {
    const grid = createEmptyGrid();
    expect(isGameOver(grid, [null, null, null])).toBe(true);
  });
});
