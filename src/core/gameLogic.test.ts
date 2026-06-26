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
