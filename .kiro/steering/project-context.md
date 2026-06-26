# Block Blast — Project Context

## Overview
Game puzzle Block Blast klasik untuk mobile. Drag blok ke grid 8x8; baris/kolom penuh hancur dan beri poin. Game over saat tidak ada blok tray yang muat.

- **Repo:** ganoolmovie5th-cell/block-blast-claude
- **Branch:** `main` (push langsung, tanpa PR)
- **Stack:** React Native 0.81 + Expo SDK 54 (managed, Expo Go compatible) + TypeScript strict

---

## Aturan Penting

- **Harus jalan di Expo Go SDK 54** — JANGAN native module yang butuh prebuild
- Tambah paket selalu via `npx expo install <paket>`, bukan `npm install` versi bebas
- **Logika game di `src/core/` harus murni** (no React import) agar mudah di-test
- TDD: tulis test dulu untuk semua logika di `src/core/` dan `src/store/`
- Hanya `highScore` yang di-persist (AsyncStorage); state permainan transient

---

## Struktur File

```
src/
├── core/           # Logika murni, fully tested
│   ├── types.ts        # Grid, Cell, BlockShape, GameState, GRID_SIZE=8, TRAY_SIZE=3
│   ├── blocks.ts       # BLOCK_CATALOG (14 bentuk), generateRandomTray, cellCount
│   ├── gameLogic.ts    # createEmptyGrid, canPlaceBlock, placeBlock, clearLines, isGameOver
│   └── scoring.ts      # placementScore, lineScore, applyCombo, nextCombo (MAX_COMBO=5)
├── store/
│   └── gameStore.ts    # Zustand + persist; actions: newGame, dropBlock
├── components/
│   ├── boardLayout.ts  # KONSTANTA layout bersama (CELL_MARGIN, BOARD_PADDING, DRAG_LIFT, cellStep)
│   ├── Cell.tsx, Grid.tsx
│   ├── DraggableBlock.tsx, BlockTray.tsx
│   ├── ScoreBoard.tsx, GameOverModal.tsx
│   └── ClearFlash.tsx, ComboPopup.tsx
└── screens/
    └── GameScreen.tsx  # Orkestrasi + mapping drag→grid
```

Spec & plan: `docs/specs/`, `docs/plans/`.

---

## Keputusan Desain Penting

### Mapping drag→grid (KRITIS)
- Konstanta layout terpusat di `src/components/boardLayout.ts` — dipakai oleh Grid (render) DAN GameScreen (mapping koordinat). Jangan hardcode margin/padding di komponen; ambil dari sini agar mapping tetap akurat.
- Blok mengambang `DRAG_LIFT` di atas jari dan di-center pada jari. `resolveCell()` di GameScreen menghitung (row, col) dari posisi absolut jari.
- **Akurasi mapping perlu diverifikasi di device nyata.** Jika meleset, tune `DRAG_LIFT` dan layout constants — bukan ubah arsitektur.

### Scoring & Combo
- Place: +jumlah sel. Line: 1→10, 2→30, 3→60, 4→100 (eskalasi). Multiplier combo x1→x5.
- `nextCombo` reset ke 1 saat tidak ada clear; combo disimpan di store (mulai 0 saat newGame).

### Reanimated 4 — babel plugin (PENTING, pernah bikin crash)
- SDK 54 pakai Reanimated 4 yang butuh `react-native-worklets`.
- **`babel-preset-expo` SDK 54 OTOMATIS menambahkan `react-native-worklets/plugin`** saat `react-native-worklets` terinstall. JANGAN tambahkan plugin itu manual di `babel.config.js`.
- Menambahkannya manual = plugin jalan 2×  → worklet di-transform ganda → runtime crash **"Exception in HostFunction: <unknown>"** (lolos build, gagal saat run). `babel.config.js` cukup berisi `presets: ['babel-preset-expo']` saja.
- Setelah ubah babel config, restart Metro dengan cache clear: `npx expo start -c`.
- Import `SharedValue` langsung dari `react-native-reanimated`, bukan via namespace `Animated`.

---

## Testing & Verifikasi (WAJIB sebelum selesai)

```bash
npm test                              # unit test (33 test, harus pass)
npm run typecheck                     # tsc --noEmit (0 error)
npx expo export --platform android    # bundle harus sukses ("Exported: dist")
```

Jest preset `jest-expo` + `transformIgnorePatterns` sudah dikonfigurasi di `package.json`. Mock AsyncStorage via `@react-native-async-storage/async-storage/jest/async-storage-mock` di test store.

---

## Commit Convention

- Setiap commit yang mengubah perilaku/fitur: update `README.md` + steering file ini bila relevan
- Type: `feat` `fix` `refactor` `test` `chore` `docs`
- Push langsung ke `main`, tanpa PR
- Commit fokus (satu concern per commit)

---

## Roadmap (di luar MVP)

- Sound effect & haptic feedback
- Dark/light mode
- Power-ups & obstacle blocks
- Leaderboard online
- CI GitHub Actions (test + tsc otomatis tiap push)
