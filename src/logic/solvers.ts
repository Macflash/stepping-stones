import {
  GridCopy,
  GridCount,
  GridForEach,
  GridSet,
  GridSumNeighbors,
} from "./grid";
import { Grid } from "./types";

async function delayed<T>(initial: () => Promise<T>): Promise<T> {
  const p = new Promise<T>((resolve) => {
    setTimeout(async () => {
      resolve(await initial());
    }, 100);
  });
  return p;
}

// gets updates from the solver.
var solverListener: (bestSoFar: Grid, isDone: boolean) => void = () => {};

export function SetSolverListener(
  listener: (bestSoFar: Grid, isDone: boolean) => void
) {
  solverListener = listener;
}

let bestSoFar = 0;
let isRunning = false;
export async function BruteForceGridSolver(
  grid: Grid,
  firstStep = false
): Promise<Grid> {
  let bestGrid = grid;
  const counts = GridCount(grid);
  const next = counts.length;

  if (firstStep) {
    console.log("BruteForceGridSolver: " + next, grid);
    bestSoFar = 0;
    isRunning = true;
  }

  let neighbors = GridSumNeighbors(grid);
  let neighborCounts = GridCount(neighbors);
  if (neighborCounts[next] > 0) {
    // get a list of playable locations
    const plays: { row: number; col: number }[] = [];
    GridForEach(neighbors, (value, row, col) => {
      if (value == next) {
        plays.push({ row, col });
      }
    });

    const newGrids = plays.map(({ row, col }) => {
      const newGrid = GridCopy(grid);
      GridSet(newGrid, row, col, next);
      return newGrid;
    });

    const results = await Promise.all(
      newGrids.map((newGrid) => delayed(() => BruteForceGridSolver(newGrid)))
    );

    let bestScore = counts.length;
    for (const result of results) {
      const score = GridCount(result).length;
      if (score > bestScore) {
        bestScore = score;
        bestGrid = result;
      }
    }
  }

  // TODO: Solve NP-hard problem, prove P=NP
  if (firstStep) {
    isRunning = false;
    console.log("DONE!", bestGrid);
    solverListener(bestGrid, true);
  } else if (counts.length > bestSoFar) {
    bestSoFar = counts.length;
    console.log("New best: " + bestSoFar);
    solverListener(bestGrid, false);
  }
  return bestGrid;
}

export function FindNextOne(grid: Grid) {
  const counts = GridCount(grid);
  const max = counts.length;
}
