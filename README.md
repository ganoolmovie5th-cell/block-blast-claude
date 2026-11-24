# Block Blast

Game puzzle Block Blast klasik untuk mobile. Drag potongan blok ke grid 8x8, isi baris atau kolom penuh untuk menghancurkannya dan kumpulkan poin. Game berakhir saat tidak ada blok yang muat di papan.

**Tech Stack:** React Native · Expo SDK 58 · TypeScript · Zustand · Reanimated · Gesture Handler

## Features

- Grid 8x8 dengan drag-and-drop (gesture-handler + reanimated, UI thread)
- Preview penempatan: hijau jika muat, merah jika tidak
- Clear baris/kolom dengan animasi flash + confetti
- Sistem combo/streak dengan multiplier (hingga x5)
- High score lokal tersimpan antar sesi (AsyncStorage)
- Daily Challenge (puzzle deterministik per hari, skor terpisah)
- Undo (1x per game)
- 5 tema warna (Classic, Midnight, Forest, Sunset, Neon), unlock via high score
- 4 game modes: Classic, Timed (2 menit), Zen (tanpa game over), Obstacles
- Power-ups: Bomb (3x3), Color Blast, Rotate (earn per 500 poin)
- Progressive difficulty (blok makin besar setelah 10 tray)
- Haptic feedback + sound effects (expo-av, expo-haptics)
- 14 achievement badges + statistics dashboard
- Daily streak counter
- Tutorial onboarding (3-step overlay)
- Accessibility (screen reader labels)

## Getting Started

```bash
npm install
npx expo start --go
```

Scan QR code dengan Expo Go di device.

## Project Structure

```
src/
  core/             → Logika murni (no React, fully tested)
    types.ts            Grid, Cell, BlockShape, GameState
    blocks.ts           Katalog blok + tray generator
    gameLogic.ts        place, clearLines, isGameOver
    scoring.ts          Poin + combo
    themes.ts           5 tema warna + unlock thresholds
    dailyChallenge.ts   Seeded PRNG + daily tray
    gameModes.ts        Timed, Zen, Obstacles
    powerUps.ts         Bomb, Color Blast, Rotate
    achievements.ts     14 badges + stats
    haptics.ts          Haptic feedback
    sounds.ts           Sound effects (4 WAV)
  store/            → gameStore.ts (Zustand + persist)
  components/       → UI components (Grid, BlockTray, DraggableBlock, dll)
  screens/          → GameScreen.tsx
```

## Testing

```bash
npm test
npm run typecheck
```

## License

MIT
