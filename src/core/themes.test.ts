import { THEMES, getTheme } from './themes';

describe('themes', () => {
  it('has at least 3 themes', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(3);
  });

  it('first theme is always unlocked (unlockScore 0)', () => {
    expect(THEMES[0].unlockScore).toBe(0);
  });

  it('getTheme returns matching theme', () => {
    const t = getTheme('midnight');
    expect(t.id).toBe('midnight');
    expect(t.colors.bg).toBeDefined();
  });

  it('getTheme falls back to classic for unknown id', () => {
    const t = getTheme('nonexistent');
    expect(t.id).toBe('classic');
  });

  it('all themes have required color keys', () => {
    const keys = ['bg', 'boardBg', 'cellEmpty', 'text', 'textSecondary', 'accent', 'headerBg', 'buttonBg', 'buttonText'];
    THEMES.forEach((t) => {
      keys.forEach((k) => {
        expect((t.colors as Record<string, string>)[k]).toBeDefined();
      });
    });
  });
});
