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
- Persisted (AsyncStorage): `highScore`, `dailyHighScore`, `dailyCompleted`, `themeId`. State permainan lainnya transient.

---

## Struktur File

```
src/
├── core/           # Logika murni, fully tested
│   ├── types.ts        # Grid, Cell, BlockShape, GameState, GRID_SIZE=8, TRAY_SIZE=3
│   ├── blocks.ts       # BLOCK_CATALOG (14 bentuk), generateRandomTray, cellCount
│   ├── gameLogic.ts    # createEmptyGrid, canPlaceBlock, placeBlock, clearLines, isGameOver
│   ├── scoring.ts      # lineScore, applyCombo, nextCombo (MAX_COMBO=5)
│   ├── themes.ts       # Theme type, THEMES (5 skins), getTheme
│   └── dailyChallenge.ts # mulberry32 seeded PRNG, generateDailyTray, todayStr
├── store/
│   └── gameStore.ts    # Zustand + persist; actions: newGame, dropBlock, undo, startDaily, setTheme
├── components/
│   ├── boardLayout.ts  # KONSTANTA layout bersama (CELL_MARGIN, BOARD_PADDING, DRAG_LIFT, cellStep)
│   ├── Cell.tsx, Grid.tsx
│   ├── DraggableBlock.tsx, BlockTray.tsx
│   ├── ScoreBoard.tsx, GameOverModal.tsx
│   ├── ClearFlash.tsx, ComboPopup.tsx
│   └── ThemePicker.tsx # Modal pilih skin (unlock by highScore)
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

### Reanimated 4 — babel plugin & versi worklets (PENTING, pernah bikin crash)
- SDK 54 pakai Reanimated 4 yang butuh `react-native-worklets`.
- **`babel-preset-expo` SDK 54 OTOMATIS menambahkan `react-native-worklets/plugin`** saat `react-native-worklets` terinstall. JANGAN tambahkan plugin itu manual di `babel.config.js` (plugin jalan 2× → crash). `babel.config.js` cukup `presets: ['babel-preset-expo']`.
- **`react-native-worklets` WAJIB di-pin ke `0.5.1`** (versi native yang di-bake Expo Go SDK 54, lihat `expo/bundledNativeModules.json`). Peer range reanimated `0.5 - 0.8` membuat npm default ambil `0.8.3` → JS 0.8.3 ≠ native 0.5.1 → crash **"Exception in HostFunction: <unknown>"** saat load `NativeWorklets`. `expo install --fix` TIDAK memperbaikinya karena worklets bukan direct dep. Fix: `npm install react-native-worklets@0.5.1 --save-exact`.
- Cek native versi yang benar: `node -e "console.log(require('expo/bundledNativeModules.json')['react-native-worklets'])"`.
- Setelah ubah babel/versi, restart Metro dengan cache clear: `npx expo start -c`.
- Import `SharedValue` langsung dari `react-native-reanimated`, bukan via namespace `Animated`.

---

## Testing & Verifikasi (WAJIB sebelum selesai)

```bash
npm test                              # unit test (42 test, harus pass)
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
- Leaderboard online
- CI GitHub Actions (test + tsc otomatis tiap push)

---

## Pembersihan Kode / Ponytail Audit (Juni 2026)

Penyederhanaan aman, tidak menyentuh kemurnian core/test/mapping drag→grid. Verifikasi `npm run typecheck` + `npm test` (33/33) hijau.
- `gameStore.ts`: hapus `multiplier` redundan (`nextCombo` sudah return 1 saat `cleared<=0`, jadi `multiplier === newCombo` selalu) → `applyCombo(base, newCombo)`. Inline `freshTray()` → `generateRandomTray()`.
- Hapus re-export `GRID_SIZE` di `gameStore.ts` & `Grid.tsx` (0 importer; semua dari `core/types`).
- Hapus `DRAG_SCALE_FACTOR` mati di `boardLayout.ts`.


## Fitur Baru (Juli 2026)

### Daily Challenge
- Puzzle deterministik per hari — semua pemain dapat tray yang sama.
- Seeded PRNG (mulberry32) di `src/core/dailyChallenge.ts`; seed dari string tanggal + trayIndex.
- `startDaily()` di store; skor tersimpan terpisah (`dailyHighScore`).
- `dailyCompleted` menyimpan tanggal terakhir selesai (mencegah double-play hari yang sama).
- Tombol "Daily" muncul di header jika hari ini belum dimainkan.

### Undo (1× per game)
- Snapshot state (grid, tray, score, combo) disimpan sebelum setiap `dropBlock`.
- `undo()` restore snapshot; `undoUsed` = true → tombol hilang.
- Reset setiap `newGame` / `startDaily`.
- Tombol "↩ Undo" tampil di ScoreBoard (antara score & best) selama tersedia.

### Theme Skins (5 tema)
- Definisi di `src/core/themes.ts`: Classic (default), Midnight (200+), Forest (500+), Sunset (1000+), Neon (2000+).
- Unlock berdasarkan `highScore` (all-time, bukan daily).
- `themeId` di-persist di AsyncStorage.
- `ThemePicker.tsx` — modal pilih tema, preview warna, indikator locked/active.
- Warna dari tema di-inject ke Cell, Grid, ScoreBoard, GameOverModal, dan GameScreen background.
