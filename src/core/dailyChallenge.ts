// Daily challenge: deterministic tray generation from a date seed.
// Pure logic, no React.

import { BlockShape, TRAY_SIZE } from './types';
import { BLOCK_CATALOG } from './blocks';

/**
 * Simple seeded PRNG (mulberry32). Produces deterministic sequences for a given
 * seed so every player gets the same daily puzzle.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn a YYYY-MM-DD string into a numeric seed. */
function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Get today's date string (local timezone). */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Generate a tray for the daily challenge. The sequence is deterministic:
 * calling with the same date + trayIndex always returns the same shapes.
 * `trayIndex` increments each time the player exhausts a tray (0, 1, 2, …).
 */
export function generateDailyTray(dateStr: string, trayIndex: number): BlockShape[] {
  const seed = dateSeed(dateStr) + trayIndex * 7919; // offset per tray
  const rand = mulberry32(seed);
  const tray: BlockShape[] = [];
  for (let i = 0; i < TRAY_SIZE; i++) {
    const idx = Math.floor(rand() * BLOCK_CATALOG.length);
    tray.push(BLOCK_CATALOG[idx]);
  }
  return tray;
}
