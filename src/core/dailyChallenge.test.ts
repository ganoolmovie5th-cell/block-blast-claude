import { generateDailyTray, todayStr } from './dailyChallenge';
import { TRAY_SIZE } from './types';

describe('dailyChallenge', () => {
  it('generates TRAY_SIZE blocks', () => {
    const tray = generateDailyTray('2026-07-03', 0);
    expect(tray).toHaveLength(TRAY_SIZE);
    tray.forEach((b) => {
      expect(b.id).toBeDefined();
      expect(b.matrix.length).toBeGreaterThan(0);
    });
  });

  it('is deterministic — same date+index yields same tray', () => {
    const a = generateDailyTray('2026-07-03', 0);
    const b = generateDailyTray('2026-07-03', 0);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it('different trayIndex yields different tray', () => {
    const a = generateDailyTray('2026-07-03', 0);
    const b = generateDailyTray('2026-07-03', 1);
    // Highly unlikely to be equal due to different seed offset
    const same = a.every((s, i) => s.id === b[i].id);
    // Not a hard guarantee but statistically safe (1/14^3 ≈ 0.04%)
    expect(same).toBe(false);
  });

  it('different dates yield different trays', () => {
    const a = generateDailyTray('2026-07-03', 0);
    const b = generateDailyTray('2026-07-04', 0);
    const same = a.every((s, i) => s.id === b[i].id);
    expect(same).toBe(false);
  });

  it('todayStr returns YYYY-MM-DD format', () => {
    const str = todayStr();
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
