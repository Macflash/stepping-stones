import { GridForEach, GridNeighborsForEach, GridSet } from "./grid";
import { Grid } from "./types";

export const BLOCKS: ReadonlyArray<Grid> = [];

export function BlocksExtract(grid: Grid): Grid[] {
  // index in the grid is the number in the middle of the block
  const blocks: Grid[] = [];

  // for each number get a tiny grid just around it
  GridNeighborsForEach(grid, (value, row, col, subGrid) => {
    if (value <= 1) return;
    blocks[value] = subGrid;
  });

  return blocks;
}

/** returns tiles in the grid that match a criteria */
export function GridFilter(
  grid: Grid,
  filter: (value: number, row: number, col: number) => boolean
) {
  const newGrid: Grid = [];
  GridForEach(grid, (value, row, col) => {
    if (filter(value, row, col)) {
      GridSet(newGrid, row, col, value);
    }
  });
  console.log(newGrid);
  return newGrid;
}
