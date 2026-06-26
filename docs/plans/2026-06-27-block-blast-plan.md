# Block Blast Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Follow TDD: write failing test → verify fail → minimal code → verify pass → commit.

**Goal:** Game puzzle Block Blast klasik untuk mobile (Expo SDK 54) dengan drag-and-drop, clear baris/kolom, high score, combo, dan animasi.

**Architecture:** Logika game murni di `src/core/` (no React, fully tested). UI di `src/components/` + `src/screens/`. State global via Zustand + persist. Gesture via gesture-handler, animasi via reanimated.

**Tech Stack:** React Native, Expo SDK 54, TypeScript strict, Zustand, react-native-gesture-handler, react-native-reanimated, Jest.

## Global Constraints

- Expo Go SDK 54 compatible — JANGAN native module yang butuh prebuild
- Tambah paket via `npx expo install <paket>`
- TypeScript strict, 0 error `npx tsc --noEmit`
- `src/core/` murni, no React import
- Grid 8x8, tray 3 blok
- Persist hanya `highScore`

---

## Task 1: Scaffold project Expo SDK 54

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `App.tsx`, `babel.config.js`, `.gitignore`

- [ ] Step 1: Init Expo project di folder dengan template blank-typescript
  Run: `npx create-expo-app@latest . --template blank-typescript`
- [ ] Step 2: Install dependencies inti
  Run: `npx expo install react-native-gesture-handler react-native-reanimated zustand @react-native-async-storage/async-storage`
- [ ] Step 3: Install dev dependencies test
  Run: `npx expo install jest jest-expo @testing-library/react-native --dev` lalu `npm i -D @types/jest`
- [ ] Step 4: Konfigurasi babel untuk reanimated (plugin di `babel.config.js`)
- [ ] Step 5: Konfigurasi jest preset `jest-expo` di `package.json`
- [ ] Step 6: Verifikasi `npx tsc --noEmit` (0 error)
- [ ] Step 7: Commit — `chore: scaffold expo sdk 54 project`

## Task 2: Tipe data inti (types.ts)

**Files:**
- Create: `src/core/types.ts`

**Interfaces produced:** `Cell`, `Grid`, `BlockShape`, `GameState`, `GRID_SIZE`

- [ ] Step 1: Definisikan `Cell`, `Grid`, `BlockShape`, `GameState`, konstanta `GRID_SIZE = 8`
- [ ] Step 2: Verifikasi `npx tsc --noEmit`
- [ ] Step 3: Commit — `feat: add core game types`

## Task 3: Definisi blok (blocks.ts)

**Files:**
- Create: `src/core/blocks.ts`
- Test: `src/core/blocks.test.ts`

**Interfaces consumed:** `BlockShape` dari types.ts
**Interfaces produced:** `BLOCK_CATALOG: BlockShape[]`, `generateRandomTray(): BlockShape[]`, `cellCount(shape): number`

- [ ] Step 1: Write failing test — `BLOCK_CATALOG` punya ≥10 bentuk, tiap shape punya matrix non-empty + color, `generateRandomTray()` return 3 item, `cellCount` hitung sel true
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement `BLOCK_CATALOG` (single, lines 1x2..1x5, 2x2, 3x3, L variants, T, S/Z, plus) + `generateRandomTray` + `cellCount`
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add block catalog and tray generator`

## Task 4: Logika place & validasi (gameLogic.ts — bagian 1)

**Files:**
- Create: `src/core/gameLogic.ts`
- Test: `src/core/gameLogic.test.ts`

**Interfaces consumed:** `Grid`, `BlockShape`, `GRID_SIZE`
**Interfaces produced:** `createEmptyGrid(): Grid`, `canPlaceBlock(grid, shape, row, col): boolean`, `placeBlock(grid, shape, row, col): Grid`

- [ ] Step 1: Write failing test — `createEmptyGrid` 8x8 semua kosong; `canPlaceBlock` true saat muat, false saat keluar batas / nabrak sel terisi; `placeBlock` return grid baru (immutable) dengan sel terisi + color
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement ketiga fungsi (immutable, deep copy grid)
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add grid creation, placement validation and placement`

## Task 5: Clear baris/kolom (gameLogic.ts — bagian 2)

**Files:**
- Modify: `src/core/gameLogic.ts`
- Test: `src/core/gameLogic.test.ts`

**Interfaces produced:** `clearLines(grid): { grid: Grid; cleared: number; cells: [number,number][] }`

- [ ] Step 1: Write failing test — baris penuh ter-clear, kolom penuh ter-clear, baris+kolom simultan, `cells` berisi koordinat yang dikosongkan, `cleared` = jumlah baris+kolom
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement `clearLines` (kumpulkan baris & kolom penuh dulu, baru kosongkan agar tidak saling pengaruh)
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add line clearing logic`

## Task 6: Deteksi game over (gameLogic.ts — bagian 3)

**Files:**
- Modify: `src/core/gameLogic.ts`
- Test: `src/core/gameLogic.test.ts`

**Interfaces produced:** `isGameOver(grid, tray: (BlockShape|null)[]): boolean`

- [ ] Step 1: Write failing test — grid kosong + tray ada blok → false; grid hampir penuh tanpa ruang untuk blok tray manapun → true; tray dengan sebagian null tapi ada satu yang muat → false
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement `isGameOver` (untuk tiap blok non-null, scan semua posisi; kalau ada satu yang `canPlaceBlock` → false)
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add game over detection`

## Task 7: Scoring & combo (scoring.ts)

**Files:**
- Create: `src/core/scoring.ts`
- Test: `src/core/scoring.test.ts`

**Interfaces produced:** `placementScore(cellCount): number`, `lineScore(cleared): number`, `applyCombo(base, combo): number`, `nextCombo(combo, cleared): number`

- [ ] Step 1: Write failing test — `placementScore(4)=4`; `lineScore`: 1→10, 2→30, 3→60, 4→100; `nextCombo` naik saat cleared>0, reset ke 1 saat cleared=0, cap di 5; `applyCombo` kalikan benar
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement keempat fungsi
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add scoring and combo system`

## Task 8: Game store (gameStore.ts)

**Files:**
- Create: `src/store/gameStore.ts`
- Test: `src/store/gameStore.test.ts`

**Interfaces consumed:** semua dari core
**Interfaces produced:** `useGameStore` dengan actions: `newGame()`, `dropBlock(trayIndex, row, col)`, dan state `grid, tray, score, highScore, combo, isGameOver`

- [ ] Step 1: Write failing test (pakai store langsung, bukan render) — `newGame` reset grid kosong + tray 3 blok + score 0; `dropBlock` valid menaikkan score, mengisi grid, clear line jika penuh, update combo; tray habis → refill; highScore update saat score lampaui; `isGameOver` ter-set
- [ ] Step 2: Run test, verify FAIL
- [ ] Step 3: Implement store (Zustand + persist hanya `highScore`) + actions yang merangkai core logic
- [ ] Step 4: Run test, verify PASS
- [ ] Step 5: Commit — `feat: add zustand game store with persistence`

## Task 9: Komponen Cell & Grid

**Files:**
- Create: `src/components/Cell.tsx`, `src/components/Grid.tsx`

- [ ] Step 1: Implement `Cell` (kotak warna sesuai `cell.color`, border, rounded) — props `{ cell, size }`
- [ ] Step 2: Implement `Grid` (render 8x8 dari state, expose layout via `onLayout`/ref untuk konversi koordinat) — props `{ grid, previewCells? }`
- [ ] Step 3: Verifikasi `npx tsc --noEmit`
- [ ] Step 4: Commit — `feat: add Cell and Grid components`

## Task 10: ScoreBoard & GameOverModal

**Files:**
- Create: `src/components/ScoreBoard.tsx`, `src/components/GameOverModal.tsx`

- [ ] Step 1: Implement `ScoreBoard` (score, highScore, combo badge) — props dari store
- [ ] Step 2: Implement `GameOverModal` (overlay, skor akhir, tombol restart → `newGame`) — animasi fade-in + slide-up (reanimated)
- [ ] Step 3: Verifikasi `npx tsc --noEmit`
- [ ] Step 4: Commit — `feat: add scoreboard and game over modal`

## Task 11: DraggableBlock & BlockTray (drag interaction)

**Files:**
- Create: `src/components/DraggableBlock.tsx`, `src/components/BlockTray.tsx`

- [ ] Step 1: Implement `DraggableBlock` — render shape, `Gesture.Pan()` + `useSharedValue`, callback `onDrop(absoluteX, absoluteY)`, spring-back saat invalid
- [ ] Step 2: Implement `BlockTray` — render 3 `DraggableBlock` dari tray state
- [ ] Step 3: Verifikasi `npx tsc --noEmit`
- [ ] Step 4: Commit — `feat: add draggable block and tray`

## Task 12: GameScreen (orkestrasi + koordinat drag→grid)

**Files:**
- Create: `src/screens/GameScreen.tsx`
- Modify: `App.tsx` (bungkus `GestureHandlerRootView`, render `GameScreen`)

- [ ] Step 1: Implement `GameScreen` — susun ScoreBoard + Grid + BlockTray + GameOverModal; konversi koordinat drop (absoluteX/Y) → indeks grid via measured layout; panggil `dropBlock`; tampilkan preview cells saat drag
- [ ] Step 2: Update `App.tsx`
- [ ] Step 3: Verifikasi `npx tsc --noEmit`
- [ ] Step 4: Commit — `feat: wire up game screen and drag-to-grid mapping`

## Task 13: Animasi clear & combo

**Files:**
- Modify: `src/components/Cell.tsx`, `src/components/Grid.tsx`, `src/screens/GameScreen.tsx`

- [ ] Step 1: Tambah animasi clear (sel hancur scale-down + fade-out, stagger) — driven dari `cells` hasil clearLines
- [ ] Step 2: Tambah pop-up combo (scale bounce) saat combo > 1
- [ ] Step 3: Verifikasi `npx tsc --noEmit`
- [ ] Step 4: Commit — `feat: add clear and combo animations`

## Task 14: Verifikasi akhir & polish

- [ ] Step 1: Jalankan semua test — `npm test` (semua PASS)
- [ ] Step 2: `npx tsc --noEmit` (0 error)
- [ ] Step 3: `npx expo export --platform android` (sukses, no bundling error)
- [ ] Step 4: Buat `README.md` (cara run, struktur, fitur)
- [ ] Step 5: Commit — `chore: final verification and readme`

---

## Self-Review

- **Spec coverage:** Semua section spec terpetakan — types (T2), blocks (T3), gameLogic place/clear/gameover (T4-6), scoring/combo (T7), store/persist (T8), UI Cell/Grid/ScoreBoard/Modal/Draggable/Tray (T9-11), drag mapping (T12), animasi (T13), testing & build (T14). ✓
- **Placeholder scan:** Tidak ada TBD/TODO. ✓
- **Type consistency:** Nama fungsi (`canPlaceBlock`, `placeBlock`, `clearLines`, `isGameOver`, `generateRandomTray`, `cellCount`) konsisten antar task. ✓

## Execution Handoff

Setelah plan ini disetujui, eksekusi inline task-by-task: tiap task ikuti siklus TDD, verifikasi, lalu commit. Checkpoint review antar task besar (setelah core selesai T8, setelah UI selesai T12).
