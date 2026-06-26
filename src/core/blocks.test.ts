import { BLOCK_CATALOG, generateRandomTray, cellCount } from './blocks';
import { TRAY_SIZE } from './types';

describe('BLOCK_CATALOG', () => {
  it('contains at least 10 distinct shapes', () => {
    expect(BLOCK_CATALOG.length).toBeGreaterThanOrEqual(10);
    const ids = BLOCK_CATALOG.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every shape has a non-empty matrix, at least one filled cell, and a color', () => {
    for (const shape of BLOCK_CATALOG) {
      expect(shape.matrix.length).toBeGreaterThan(0);
      expect(shape.matrix[0].length).toBeGreaterThan(0);
      expect(cellCount(shape)).toBeGreaterThan(0);
      expect(typeof shape.color).toBe('string');
      expect(shape.color.length).toBeGreaterThan(0);
    }
  });

  it('every matrix is rectangular (all rows same length)', () => {
    for (const shape of BLOCK_CATALOG) {
      const width = shape.matrix[0].length;
      for (const row of shape.matrix) {
        expect(row.length).toBe(width);
      }
    }
  });
});

describe('cellCount', () => {
  it('counts the filled subcells', () => {
    expect(
      cellCount({
        id: 'x',
        color: '#fff',
        matrix: [
          [true, false],
          [true, true],
        ],
      }),
    ).toBe(3);
  });
});

describe('generateRandomTray', () => {
  it('returns exactly TRAY_SIZE shapes from the catalog', () => {
    const tray = generateRandomTray();
    expect(tray).toHaveLength(TRAY_SIZE);
    const catalogIds = new Set(BLOCK_CATALOG.map((b) => b.id));
    for (const block of tray) {
      expect(catalogIds.has(block.id)).toBe(true);
    }
  });
});
