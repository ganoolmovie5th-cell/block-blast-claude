// Game modes: Timed, Zen, Obstacles, Progressive difficulty. Pure logic.
import { Grid, GRID_SIZE, BlockShape } from './types';
import { createEmptyGrid } from './gameLogic';
import { BLOCK_CATALOG } from './blocks';

export type GameMode = 'classic' | 'daily' | 'timed' | 'zen' | 'obstacles';

/** Duration for timed mode in seconds. */
export const TIMED_DURATION = 120;

/** Generate a grid with random obstacle cells (unfillable). */
export function createObstacleGrid(count: number = 8): Grid {
  const grid = createEmptyGrid();
  let placed = 0;
  // Seed obstacles in random positions (avoid edges for fairness).
  while (placed < count) {
    const r = 1 + Math.floor(Math.random() * (GRID_SIZE - 2));
    const c = 1 + Math.floor(Math.random() * (GRID_SIZE - 2));
    if (!grid[r][c].filled) {
      grid[r][c] = { filled: true, color: '#64748b' }; // slate gray = obstacle
      placed++;
    }
  }
  return grid;
}

/**
 * Progressive difficulty: after `trayCount` trays, bias towards larger shapes.
 * Returns a shape from the catalog with weighted random.
 */
export function pickProgressiveShape(trayCount: number): BlockShape {
  // After 10 trays, increase chance of bigger shapes (index 3+ in catalog).
  const bigBias = Math.min(trayCount / 20, 0.6); // max 60% bias towards big
  const useBig = Math.random() < bigBias;
  if (useBig) {
    // Pick from shapes with 4+ cells (indices 3-13 in catalog)
    const bigShapes = BLOCK_CATALOG.filter(
      (s) => s.matrix.flat().filter(Boolean).length >= 4,
    );
    return bigShapes[Math.floor(Math.random() * bigShapes.length)];
  }
  return BLOCK_CATALOG[Math.floor(Math.random() * BLOCK_CATALOG.length)];
}
