import { GridCount } from "./grid";
import { Grid } from "./types";

export function BruteForceGridSolver(grid: Grid): Grid {
  let bestGrid = grid;

  // TODO: Solve NP-hard problem, prove P=NP

  return bestGrid;
}

export function FindNextOne(grid: Grid) {
  const counts = GridCount(grid);
  const max = counts.length;
}
