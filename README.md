# Block Blast

Game puzzle Block Blast klasik untuk mobile. Drag potongan blok ke grid 8x8; isi baris atau kolom secara penuh untuk menghancurkannya dan mengumpulkan poin. Game berakhir saat tidak ada blok tersisa yang muat di papan.

Dibangun dengan React Native + Expo SDK 54 (kompatibel dengan Expo Go).

**Repo:** https://github.com/ganoolmovie5th-cell/block-blast-claude (branch `main`)

## Fitur

- Grid 8x8 dengan 3 blok per giliran dan refill otomatis
- Drag-and-drop mulus (gesture-handler + reanimated, jalan di UI thread)
- Preview penempatan: hijau jika muat, merah jika tidak
- Clear baris/kolom dengan animasi flash
- Sistem combo/streak dengan multiplier (hingga x5) + popup animasi
- High score lokal yang tersimpan antar sesi (AsyncStorage)
- Deteksi game over + tombol main lagi

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
│   └── scoring.ts      # poin + combo
├── store/          # gameStore.ts (Zustand + persist)
├── components/     # Cell, Grid, BlockTray, DraggableBlock,
│                   # ScoreBoard, GameOverModal, ClearFlash, ComboPopup
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
npm test               # jalankan unit test (33 test)
npm run typecheck      # tsc --noEmit (0 error)
npx expo export --platform android   # verifikasi bundle
```

## Catatan

- Akurasi mapping koordinat drag→grid sebaiknya diuji di device nyata; nilai `DRAG_LIFT` dan layout di `src/components/boardLayout.ts` dapat di-tune bila perlu.
- Hanya `highScore` yang di-persist; state permainan berjalan bersifat transient.

## Roadmap (di luar MVP)

- Sound effect & haptic feedback
- Dark/light mode
- Power-ups & obstacle blocks
- Leaderboard online

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
