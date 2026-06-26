import { placementScore, lineScore, applyCombo, nextCombo } from './scoring';

describe('placementScore', () => {
  it('equals the number of cells placed', () => {
    expect(placementScore(4)).toBe(4);
    expect(placementScore(1)).toBe(1);
  });
});

describe('lineScore', () => {
  it('scores escalating bonuses for multi-line clears', () => {
    expect(lineScore(0)).toBe(0);
    expect(lineScore(1)).toBe(10);
    expect(lineScore(2)).toBe(30);
    expect(lineScore(3)).toBe(60);
    expect(lineScore(4)).toBe(100);
  });
});

describe('nextCombo', () => {
  it('increments when lines were cleared', () => {
    expect(nextCombo(1, 2)).toBe(2);
    expect(nextCombo(2, 1)).toBe(3);
  });

  it('resets to 1 when no lines cleared', () => {
    expect(nextCombo(4, 0)).toBe(1);
  });

  it('caps at 5', () => {
    expect(nextCombo(5, 1)).toBe(5);
  });
});

describe('applyCombo', () => {
  it('multiplies the base score by the combo multiplier', () => {
    expect(applyCombo(10, 1)).toBe(10);
    expect(applyCombo(10, 3)).toBe(30);
  });
});
