// Core domain types for Block Blast. No React imports — pure logic only.

/** Side length of the square board. */
export const GRID_SIZE = 8;

/** Number of blocks offered in the tray at once. */
export const TRAY_SIZE = 3;

/** A single board cell. `color` is null when the cell is empty. */
export type Cell = {
  filled: boolean;
  color: string | null;
};

/** The board: a GRID_SIZE x GRID_SIZE matrix of cells. */
export type Grid = Cell[][];

/**
 * A placeable block. `matrix` is the block's relative footprint where `true`
 * marks a filled subcell. Example (L-shape):
 *   [[true,  false],
 *    [true,  false],
 *    [true,  true ]]
 */
export type BlockShape = {
  id: string;
  matrix: boolean[][];
  color: string;
};

/** Full game state. */
export type GameState = {
  grid: Grid;
  tray: (BlockShape | null)[]; // length TRAY_SIZE; null = already placed
  score: number;
  highScore: number;
  combo: number;
  isGameOver: boolean;
};

/** Leaderboard entry for session. */
export type LeaderboardEntry = {
  score: number;
  timestamp: number; // ms since epoch
  gameMode: string; // 'classic', 'timed', 'zen', 'obstacles', 'daily'
};
