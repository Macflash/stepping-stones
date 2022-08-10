import { Bound, Bounds, Grid } from "./types";

// Get a value from the grid, returning 0 if the row or column is not present.
export function GridGet(grid: Grid, row: number, col: number): number {
  return (grid[row] && grid[row][col]) || 0;
}

// Set a value in the grid, even if the row is missing.
export function GridSet(
  grid: Grid,
  row: number,
  col: number,
  value: number
): void {
  grid[row] = grid[row] || [];
  grid[row][col] = value;
}

// Foreach that includes negative indexes.
// Only iterates populated cells.
export function GridForEach(
  grid: Grid,
  callback: (value: number, row: number, col: number) => void
): void {
  for (const row in grid) {
    for (const col in grid[row]) {
      callback(grid[row][col], Number(row), Number(col));
    }
  }
}

// Deep copies the grid, dropping any empty cells.
export function GridCopy(grid: Grid): Grid {
  const newGrid: Grid = [];
  GridForEach(grid, (value, row, col) => {
    if (!value) return;
    GridSet(newGrid, row, col, value);
  });
  return newGrid;
}

// Deep copies the grid, leaving only ones.
export function GridOnes(grid: Grid): Grid {
  const newGrid: Grid = [];
  GridForEach(grid, (value, row, col) => {
    if (value != 1) return;
    GridSet(newGrid, row, col, value);
  });
  return newGrid;
}

// Returns the bounds of a grid.
export function GridBounds(grid: Grid, includeZeroes = false): Bounds {
  const row: Bound = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };
  const col: Bound = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };

  GridForEach(grid, (value, r, c) => {
    if (!value && !includeZeroes) return;
    row.min = Math.min(r, row.min);
    row.max = Math.max(r, row.max);
    col.min = Math.min(c, col.min);
    col.max = Math.max(c, col.max);
  });

  return { row, col };
}

// Foreach that includes empty tiles within the bounds of filled entries.
export function BoundsForEach(
  grid: Grid,
  callback: (value: number, row: number, col: number) => void,
  extra = 0
): void {
  const bounds = GridBounds(grid, true);
  for (let row = bounds.row.min - extra; row <= bounds.row.max + extra; row++) {
    for (
      let col = bounds.col.min - extra;
      col <= bounds.col.max + extra;
      col++
    ) {
      callback(GridGet(grid, row, col), row, col);
    }
  }
}

export function GridNeighborsForEach(
  grid: Grid,
  callback: (value: number, row: number, col: number, neighors: Grid) => void
): void {
  GridForEach(grid, (value, row, col) => {
    const neighbors: Grid = [];
    for (let roff = -1; roff <= 1; roff++) {
      for (let coff = -1; coff <= 1; coff++) {
        const neighborValue = GridGet(grid, row + roff, col + coff);
        GridSet(neighbors, roff, coff, neighborValue);
      }
    }
    callback(value, row, col, neighbors);
  });
}

// Returns a grid with the sum of all neighbors, and -1 for already populated cells.
export function GridSumNeighbors(grid: Grid): Grid {
  const sum: Grid = [];

  GridForEach(grid, (value, row, col) => {
    for (let roff = -1; roff <= 1; roff++) {
      for (let coff = -1; coff <= 1; coff++) {
        if (value <= 0) continue;
        // Set filled cells to -1
        if (value > 0 && roff === 0 && coff === 0) {
          GridSet(sum, row, col, -1);
          continue;
        }

        const r = row + roff;
        const c = col + coff;
        const currentValue = GridGet(sum, r, c);
        // Skip filled cells that are negative.
        if (currentValue < 0) continue;

        // add the sum to the tile.
        GridSet(sum, r, c, currentValue + value);
      }
    }
  });

  return sum;
}

export function GridCount(grid: Grid): number[] {
  const counts: number[] = [];
  GridForEach(grid, (value, row, col) => {
    counts[value] = counts[value] || 0;
    counts[value]++;
  });

  return counts;
}
