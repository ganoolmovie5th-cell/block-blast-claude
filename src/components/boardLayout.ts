// Shared board layout constants so Grid rendering and drop-coordinate mapping
// stay in sync. Changing these in one place keeps the math correct everywhere.

export const CELL_MARGIN = 1.5; // margin on each side of a cell
export const BOARD_PADDING = 4; // inner padding of the board container

/** Distance between adjacent cell origins for a given cell size. */
export function cellStep(cellSize: number): number {
  return cellSize + CELL_MARGIN * 2;
}

/** Screen offset from the board's top-left to the first cell's top-left. */
export const FIRST_CELL_OFFSET = BOARD_PADDING + CELL_MARGIN;

/** How far above the finger the dragged block floats (for visibility). */
export const DRAG_LIFT = 60;

/** Scale applied to a tray block while it is being dragged. */
export const DRAG_SCALE_FACTOR = 1; // tray cells already render at board size
