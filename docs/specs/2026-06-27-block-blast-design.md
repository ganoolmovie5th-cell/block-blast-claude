# Block Blast — Design Document

**Tanggal:** 2026-06-27
**Status:** Approved
**Platform:** React Native + Expo SDK 54 (Expo Go compatible)

---

## 1. Tujuan

Membangun game puzzle Block Blast versi klasik untuk mobile (iOS & Android via Expo Go). Pemain men-drag potongan blok ke grid 8x8; baris/kolom penuh akan hancur dan memberi poin. Game berakhir saat tidak ada blok tersisa yang muat di grid.

## 2. Scope MVP

**Termasuk:**
- Core gameplay: grid 8x8, tray 3 blok, drag-and-drop, clear baris/kolom
- High score lokal (AsyncStorage)
- Animasi clear (scale-down + fade, stagger)
- Combo / streak system (multiplier)
- Restart / new game

**Tidak termasuk (future):**
- Sound effect & haptic
- Dark/light mode
- Power-ups, obstacle blocks, mode timer
- Leaderboard online

## 3. Tech Stack

- **Framework:** React Native + Expo SDK 54 (managed, jalan di Expo Go)
- **Bahasa:** TypeScript (strict mode)
- **State:** Zustand + `persist` middleware + AsyncStorage
- **Gesture:** `react-native-gesture-handler`
- **Animasi:** `react-native-reanimated`
- **Testing:** Jest + `@testing-library/react-native` (logika core di-test penuh)

### Global Constraints

- Harus jalan di Expo Go SDK 54 — JANGAN pakai native module yang butuh prebuild
- Tambah paket selalu via `npx expo install <paket>`
- TypeScript strict, 0 error di `npx tsc --noEmit`
- Logika game di `src/core/` harus murni (no React import) agar mudah di-test

## 4. Arsitektur & Struktur File

```
block-blast-claude/
├── App.tsx                      # Root: GestureHandlerRootView + GameScreen
├── app.json                     # Expo config (SDK 54)
├── src/
│   ├── core/                    # Logika murni (no React)
│   │   ├── types.ts             # Grid, Block, Cell, GameState
│   │   ├── blocks.ts            # Definisi bentuk blok + warna
│   │   ├── gameLogic.ts         # placeBlock, clearLines, canFit, isGameOver
│   │   └── scoring.ts           # poin + combo/streak
│   ├── store/
│   │   └── gameStore.ts         # Zustand store + persist (high score)
│   ├── components/
│   │   ├── Grid.tsx             # Render papan 8x8
│   │   ├── Cell.tsx             # Satu sel (kosong/terisi)
│   │   ├── BlockTray.tsx        # 3 blok di bawah grid
│   │   ├── DraggableBlock.tsx   # Blok drag (gesture + reanimated)
│   │   ├── ScoreBoard.tsx       # Skor + high score + combo
│   │   └── GameOverModal.tsx    # Overlay game over + restart
│   └── screens/
│       └── GameScreen.tsx       # Layout utama, orkestrasi state
```

Prinsip: logika game terpisah dari UI. `src/core/` tanpa React → di-test penuh tanpa render.

## 5. Model Data (types.ts)

```typescript
type Cell = { filled: boolean; color: string | null };
type Grid = Cell[][];                    // 8x8
type BlockShape = {
  id: string;
  matrix: boolean[][];                   // bentuk relatif, mis. L = [[1,0],[1,0],[1,1]]
  color: string;
};
type GameState = {
  grid: Grid;
  tray: (BlockShape | null)[];           // panjang 3
  score: number;
  highScore: number;
  combo: number;
  isGameOver: boolean;
};
```

## 6. Definisi Blok (blocks.ts)

Set bentuk klasik (warna cerah berbeda per bentuk):
- 1x1 (single), 1x2, 1x3, 1x4, 1x5 (lines)
- 2x2 (square), 3x3 (big square)
- L-shape (3 ukuran), T-shape, S/Z-shape
- Plus shape

`generateRandomTray()` → pilih 3 blok acak dari katalog.

## 7. Mekanik Inti (gameLogic.ts)

| Fungsi | Signature | Deskripsi |
|--------|-----------|-----------|
| `canPlaceBlock` | `(grid, shape, row, col) => boolean` | Cek muat & tidak nabrak / keluar batas |
| `placeBlock` | `(grid, shape, row, col) => Grid` | Return grid baru terisi (immutable) |
| `clearLines` | `(grid) => { grid: Grid, cleared: number, cells: [r,c][] }` | Deteksi baris+kolom penuh, kosongkan |
| `isGameOver` | `(grid, tray) => boolean` | True jika tidak ada blok tray yang muat di posisi manapun |

Tray refill: saat 3 blok habis (semua `null`) → `generateRandomTray()`.

## 8. Scoring & Combo (scoring.ts)

- **Place blok:** +jumlah sel terisi (mis. blok 4 sel = +4)
- **Clear line:** 1 line = +10; multi-line bonus: 2=+30, 3=+60, 4=+100 (eskalasi)
- **Combo/streak:** clear di giliran berturut-turut → multiplier x1 → x2 → x3 (cap di x5). Reset ke x1 jika satu giliran tanpa clear.
- Poin akhir per giliran = (poin line + poin place) × multiplier

## 9. Interaksi Drag (DraggableBlock.tsx)

- `Gesture.Pan()` + `useSharedValue` untuk posisi
- Saat drag: blok ikut jari; grid menampilkan preview sel tujuan (hijau = muat, merah = tidak)
- Saat lepas: valid → snap + place; invalid → spring balik ke tray
- Konversi koordinat jari → indeks grid via `measure()` posisi grid container

## 10. Animasi (reanimated)

| Event | Animasi |
|-------|---------|
| Clear line | Sel hancur: scale-down + fade-out, stagger per sel |
| Place | Sel target: scale-in cepat |
| Combo | Teks combo pop-up + scale bounce |
| Game over | Modal fade-in + slide-up |

Semua animasi hormati `prefers-reduced-motion` jika memungkinkan.

## 11. Persistence (gameStore.ts)

- Zustand + `persist` + AsyncStorage
- **Hanya `highScore`** yang di-persist. Grid & skor berjalan = transient.

## 12. Testing

- Unit test penuh untuk `src/core/`: `gameLogic`, `scoring`, `blocks`
- Skenario kunci: place valid/invalid, clear single/multi line, combo escalation & reset, game over detection
- Verifikasi build: `npx tsc --noEmit` + `npx expo export --platform android` sukses

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Konversi koordinat drag → grid tidak akurat | Gunakan `measure()` + offset, test di device nyata |
| Animasi clear + combo bersamaan lag | reanimated jalan di UI thread; batasi jumlah animasi simultan |
| Tray refill bikin game over tak adil | `isGameOver` cek setelah refill, bukan hanya saat tray habis |
