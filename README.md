# Block Blast

Game puzzle Block Blast klasik untuk mobile. Drag potongan blok ke grid 8x8; isi baris atau kolom secara penuh untuk menghancurkannya dan mengumpulkan poin. Game berakhir saat tidak ada blok tersisa yang muat di papan.

Dibangun dengan React Native + Expo SDK 54 (kompatibel dengan Expo Go).

**Repo:** https://github.com/ganoolmovie5th-cell/block-blast-claude (branch `main`)

## Fitur

- Grid 8x8 dengan 3 blok per giliran dan refill otomatis
- Drag-and-drop mulus (gesture-handler + reanimated, jalan di UI thread)
- Preview penempatan: hijau jika muat, merah jika tidak
- Clear baris/kolom dengan animasi flash + confetti untuk multi-line clear
- Sistem combo/streak dengan multiplier (hingga x5) + popup animasi
- High score lokal yang tersimpan antar sesi (AsyncStorage)
- Deteksi game over + tombol main lagi
- **Daily Challenge** — puzzle deterministik per hari (seeded PRNG), skor terpisah
- **Undo (1× per game)** — satu kesempatan undo per game, reset tiap game baru
- **Theme Skins** — 5 tema warna (Classic, Midnight, Forest, Sunset, Neon), unlock via high score
- **Game Modes** — Classic, Timed (2 menit), Zen (tanpa game over), Obstacles (sel pre-filled)
- **Power-ups** — Bomb (3×3 clear), Color Blast (hapus semua satu warna), Rotate (putar blok 90°) — earn per 500 poin
- **Progressive Difficulty** — setelah 10 tray, blok besar makin sering muncul
- **Haptic Feedback** — getaran berbeda untuk place, clear, combo, game over, power-up
- **Sound Effects** — 4 WAV beep tones (place/clear/combo/gameover), preloaded via expo-av
- **Achievement Badges** — 14 badges (score milestones, combo, lines, streak)
- **Statistics Dashboard** — games played, best score, lines cleared, best combo, streak, achievement progress
- **Daily Streak** — hitung hari berturut-turut bermain
- **Confetti Particles** — burst animasi saat multi-line clear
- **Tutorial Onboarding** — 3-step overlay pertama kali buka app
- **Accessibility** — screen reader labels di semua tombol interaktif

## Tech Stack

- React Native 0.81 + Expo SDK 54 (managed, Expo Go)
- TypeScript (strict mode)
- Zustand + persist middleware + AsyncStorage
- react-native-gesture-handler, react-native-reanimated
- Jest + jest-expo (logika game di-test penuh)

## Struktur

```
src/
├── core/           # Logika murni (no React, fully tested)
│   ├── types.ts        # Grid, Cell, BlockShape, GameState
│   ├── blocks.ts       # Katalog blok + tray generator
│   ├── gameLogic.ts    # place, clearLines, isGameOver
│   ├── scoring.ts      # poin + combo
│   ├── themes.ts       # 5 tema warna + unlock thresholds
│   ├── dailyChallenge.ts # seeded PRNG + daily tray generator
│   ├── gameModes.ts    # Timed, Zen, Obstacles, progressive difficulty
│   ├── powerUps.ts     # Bomb, Color Blast, Rotate logic
│   ├── achievements.ts # 14 badges + stats tracking
│   ├── haptics.ts      # Haptic feedback (expo-haptics)
│   └── sounds.ts       # Sound effects (expo-av, 4 WAV assets)
├── store/          # gameStore.ts (Zustand + persist)
├── components/     # Cell, Grid, BlockTray, DraggableBlock,
│                   # ScoreBoard, GameOverModal, ClearFlash,
│                   # ComboPopup, ThemePicker, AchievementPopup,
│                   # StatsModal, ModePickerModal, PowerUpBar,
│                   # TutorialOverlay, Confetti
└── screens/        # GameScreen.tsx (orkestrasi + mapping drag→grid)
```

Logika game dipisah dari UI: semua aturan di `src/core/` murni TypeScript tanpa React, sehingga mudah di-test.

## Menjalankan

```bash
npm install
npx expo start --go    # scan QR dengan Expo Go (SDK 54)
```

## Testing

```bash
npm test               # jalankan unit test (42 test)
npm run typecheck      # tsc --noEmit (0 error)
npx expo export --platform android   # verifikasi bundle
```

## Catatan

- Akurasi mapping koordinat drag→grid sebaiknya diuji di device nyata; nilai `DRAG_LIFT` dan layout di `src/components/boardLayout.ts` dapat di-tune bila perlu.
- Persisted: `highScore`, `dailyHighScore`, `dailyCompleted`, `themeId`, `stats`, `unlockedAchievements`, `lastPlayDate`, `tutorialSeen`. State permainan transient.
- Sound effects: 4 WAV beep tones di `/assets/sounds/` — preloaded saat pertama kali dibutuhkan. Ganti dengan file .mp3 berkualitas lebih tinggi jika diinginkan.

## Roadmap

- Leaderboard online
- Ghost replay (lihat best game dimainkan ulang)
- Share score card (generate image → share)

## Pembersihan Kode / Ponytail Audit (Juni 2026)

Sederhanakan tanpa mengubah perilaku. Verifikasi: `npm run typecheck` lolos, `npm test` 33/33 pass.
- `src/store/gameStore.ts`: `multiplier = cleared>0 ? newCombo : 1` redundan (`nextCombo` sudah reset ke 1) → pakai `newCombo` langsung; inline wrapper `freshTray` → `generateRandomTray`.
- Hapus re-export mubazir `export { GRID_SIZE }` di `gameStore.ts` & `components/Grid.tsx` (semua konsumen impor dari `core/types`).
- Hapus `DRAG_SCALE_FACTOR` (=1, 0 pemakaian) di `components/boardLayout.ts`.

### Audit Lanjutan (Juli 2026)

Hapus dead code & shrink core logic. Verifikasi: `npm run typecheck` lolos, `npm test` 33/33 pass.
- `src/core/scoring.ts`: hapus fungsi identitas `placementScore()` (hanya return input); `lineScore` dari `Record<number,number>` → array `[0,10,30,60,100]`
- `src/core/gameLogic.ts`: `createEmptyGrid()` nested loops → `Array.from` one-liner; `fullCols` manual loop → `grid.every(row => row[c].filled)`
- `src/core/blocks.ts`: `cellCount` double-loop → `.flat().filter(Boolean).length`

### Audit Lanjutan 3 (Juli 2026)

- `src/components/Grid.tsx`: hapus exported type alias `PreviewMap` → inline `Record<string, 'valid' | 'invalid'>` di Props dan di `GameScreen.tsx`
- `CELL_SIZE` sudah di module scope (tidak perlu diubah); `FlashComponent` menggunakan hooks, tidak bisa di-inline ke `.map()`
