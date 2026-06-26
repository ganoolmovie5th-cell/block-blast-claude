import { Cell } from '../core/types';
import { createEmptyGrid } from '../core/gameLogic';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Import after the mock is registered.
import { useGameStore } from './gameStore';

const single = { id: 's', color: '#fff', matrix: [[true]] };
const filled = (): Cell => ({ filled: true, color: '#000' });

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
  });

  it('newGame resets to an empty grid, full tray, zero score', () => {
    const s = useGameStore.getState();
    expect(s.score).toBe(0);
    expect(s.isGameOver).toBe(false);
    expect(s.tray).toHaveLength(3);
    expect(s.tray.every((b) => b !== null)).toBe(true);
    expect(s.grid.flat().every((c) => !c.filled)).toBe(true);
  });

  it('dropBlock places a block and adds placement score', () => {
    useGameStore.setState({ grid: createEmptyGrid(), tray: [single, null, null], combo: 0, score: 0 });
    useGameStore.getState().dropBlock(0, 0, 0);
    const s = useGameStore.getState();
    expect(s.grid[0][0].filled).toBe(true);
    expect(s.score).toBe(1); // placementScore(1) * multiplier 1
  });

  it('refills the tray when all blocks are used', () => {
    useGameStore.setState({ grid: createEmptyGrid(), tray: [single, null, null], combo: 0, score: 0 });
    useGameStore.getState().dropBlock(0, 0, 0);
    const s = useGameStore.getState();
    expect(s.tray).toHaveLength(3);
    expect(s.tray.every((b) => b !== null)).toBe(true);
  });

  it('clears a completed row and awards line score', () => {
    const grid = createEmptyGrid();
    for (let c = 0; c < 7; c += 1) grid[0][c] = filled();
    useGameStore.setState({ grid, tray: [single, null, null], combo: 0, score: 0 });
    useGameStore.getState().dropBlock(0, 0, 7); // completes row 0
    const s = useGameStore.getState();
    expect(s.grid[0].every((c) => !c.filled)).toBe(true); // row cleared
    expect(s.score).toBe(11); // placement 1 + line 10, multiplier 1
    expect(s.combo).toBe(1);
  });

  it('ignores an invalid placement (overlap)', () => {
    const grid = createEmptyGrid();
    grid[0][0] = filled();
    useGameStore.setState({ grid, tray: [single, null, null], combo: 0, score: 5 });
    useGameStore.getState().dropBlock(0, 0, 0); // overlaps
    const s = useGameStore.getState();
    expect(s.score).toBe(5); // unchanged
    expect(s.tray[0]).not.toBeNull(); // block not consumed
  });

  it('ignores dropBlock on a null tray slot', () => {
    useGameStore.setState({ grid: createEmptyGrid(), tray: [null, null, null], combo: 0, score: 7 });
    useGameStore.getState().dropBlock(0, 0, 0);
    expect(useGameStore.getState().score).toBe(7);
  });

  it('raises combo on consecutive clears', () => {
    // First clear
    let grid = createEmptyGrid();
    for (let c = 0; c < 7; c += 1) grid[0][c] = filled();
    useGameStore.setState({ grid, tray: [single, null, null], combo: 0, score: 0 });
    useGameStore.getState().dropBlock(0, 0, 7);
    expect(useGameStore.getState().combo).toBe(1);

    // Second consecutive clear
    grid = createEmptyGrid();
    for (let c = 0; c < 7; c += 1) grid[1][c] = filled();
    useGameStore.setState({ grid, tray: [single, null, null] });
    useGameStore.getState().dropBlock(0, 1, 7);
    expect(useGameStore.getState().combo).toBe(2);
  });

  it('updates highScore when score exceeds it', () => {
    useGameStore.setState({ grid: createEmptyGrid(), tray: [single, null, null], combo: 0, score: 0, highScore: 0 });
    useGameStore.getState().dropBlock(0, 0, 0);
    expect(useGameStore.getState().highScore).toBe(1);
  });
});
