/** Maximum combo multiplier. */
export const MAX_COMBO = 5;

/** Points for clearing `cleared` lines in a single move (escalating bonus). */
export function lineScore(cleared: number): number {
  const table = [0, 10, 30, 60, 100];
  return cleared < table.length ? table[cleared] : 100 + (cleared - 4) * 50;
}

/**
 * Next combo multiplier. Increments (capped at MAX_COMBO) when at least one
 * line was cleared this move; resets to 1 otherwise.
 */
export function nextCombo(combo: number, cleared: number): number {
  if (cleared <= 0) return 1;
  return Math.min(combo + 1, MAX_COMBO);
}

/** Apply the combo multiplier to a base score. */
export function applyCombo(base: number, combo: number): number {
  return base * combo;
}
