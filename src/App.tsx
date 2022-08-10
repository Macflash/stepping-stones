import React, { ReactNode } from "react";
import "./App.css";

type Grid = number[][];

var gameGrid: Grid = [[1], [], [0, 0, 1]];

function GridGet(grid: Grid, row: number, col: number): number {
  return (grid[row] && grid[row][col]) || 0;
}

function GridSet(grid: Grid, row: number, col: number, value: number): void {
  grid[row] = grid[row] || [];
  grid[row][col] = value;
}

function SumNeighbors(grid: Grid): Grid {
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

// Foreach that includes negative indexes
function GridForEach(
  grid: Grid,
  callback: (value: number, row: number, col: number) => void
): void {
  for (const row in grid) {
    for (const col in grid[row]) {
      callback(grid[row][col], Number(row), Number(col));
    }
  }
}

// Foreach that includes empty tiles within the bounds
function BoundsForEach(
  grid: Grid,
  callback: (value: number, row: number, col: number) => void,
  extra = 0
): void {
  const bounds = Bounds(grid);
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

interface Bound {
  min: number;
  max: number;
}

interface Bounds {
  row: Bound;
  col: Bound;
}

function Bounds(grid: Grid): Bounds {
  const row: Bound = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };
  const col: Bound = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER,
  };

  GridForEach(grid, (value, r, c) => {
    if (!value) return;
    row.min = Math.min(r, row.min);
    row.max = Math.max(r, row.max);
    col.min = Math.min(c, col.min);
    col.max = Math.max(c, col.max);
  });

  return { row, col };
}

function ExportGrid(grid: Grid): string {
  let rowStrs: string[] = [];
  const bounds = Bounds(grid);
  for (let row = bounds.row.min; row <= bounds.row.max; row++) {
    let rowStr = "(";

    let isCountingZeroes = true;
    let currentZeros = 0;
    let currentNumbers: number[] = [];
    let isFirst = true;
    for (let col = bounds.col.min; col <= bounds.col.max; col++) {
      const value = GridGet(grid, row, col);
      if (!value) {
        if (isCountingZeroes) {
          currentZeros++;
          continue;
        }

        // print list of current numbers
        rowStr += currentNumbers.join(", ");
        currentNumbers = [];

        isCountingZeroes = true;
        currentZeros = 1;
        continue;
      }

      if (isCountingZeroes) {
        if (!isFirst) rowStr += " / ";
        if (isFirst) isFirst = false;
        // we reached the end of the zeros, so append the number with a preceding slash
        rowStr += `${currentZeros}: `;
        isCountingZeroes = false;
        currentZeros = 0;
        currentNumbers = [];
      }

      currentNumbers.push(value);
    }

    rowStr += currentNumbers.join(", ");
    rowStr += ")";
    rowStrs.push(rowStr);
  }

  return rowStrs.join(", ");
}

function ImportGrid(str: string): Grid {
  const grid: Grid = [];
  const rows = str
    .split("(")
    .filter((s) => s)
    .map((row) => row.split(")")[0]);

  // each row is like: "0: 12, 8, 3, 2 / 1: 16"

  // numbers before : are counts of zeros
  // numbers before , are individual cells
  // trim any white space
  rows.forEach((row, r) => {
    grid[r] = [];

    // index in the grid
    let gridRowIndex = 0;
    let currentBuffer = "";
    for (const char of row) {
      // ignore white space
      if (char == " ") continue;

      // we found leading zeroes!
      if (char == ":") {
        const zeroes = Number(currentBuffer.trim());
        for (let z = 0; z < zeroes; z++) {
          grid[r][gridRowIndex] = 0;
          gridRowIndex++;
        }
        currentBuffer = "";
        continue;
      }

      // we found a single number
      if (char == "," || char == "/") {
        grid[r][gridRowIndex] = Number(currentBuffer.trim());
        gridRowIndex++;
        currentBuffer = "";
        continue;
      }

      currentBuffer += char;
    }

    grid[r][gridRowIndex] = Number(currentBuffer.trim());
  });

  return grid;
}

function GridView({
  placed,
  neighbors,
  onClick,
}: {
  placed: Grid;
  neighbors?: Grid;
  onClick?: (data: {
    value: number;
    isPlaced: boolean;
    row: number;
    col: number;
  }) => void;
}) {
  const size = 40;
  neighbors = neighbors || placed;
  const bounds = Bounds(neighbors);
  const tiles: ReactNode[] = [];

  BoundsForEach(
    neighbors,
    (neighborValue, row, col) => {
      const isPlaced = neighborValue === -1;
      const value = isPlaced ? gameGrid[row][col] : neighborValue;
      const isEmpty = value == 0;
      tiles.push(
        <div
          onClick={() => {
            onClick?.({
              isPlaced,
              row,
              col,
              value,
            });
          }}
          key={`${row},${col}`}
          style={{
            backgroundColor: value == 1 && isPlaced ? "#DDD" : "transparent",
            cursor: isPlaced ? "grab" : "pointer",
            position: "absolute",
            left: col * size,
            top: row * size,
            height: size,
            fontSize: size / 2,
            width: size,
            borderRadius: size,
            border: isPlaced ? "1px solid black" : "1px solid transparent",
            color: isPlaced ? "black" : "grey",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}>
          {isEmpty ? "." : value}
        </div>
      );
    },
    1
  );

  return (
    <div
      style={{
        transition: "margin 1s ease-in-out",
        position: "relative",
        marginTop: -1 * (bounds.row.min - 1) * size,
        marginLeft: -1 * (bounds.col.min - 1) * size,
      }}>
      {tiles}
    </div>
  );
}

function CountValues(grid: Grid): number[] {
  const counts: number[] = [];
  GridForEach(grid, (value, row, col) => {
    counts[value] = counts[value] || 0;
    counts[value]++;
  });

  return counts;
}

function App() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const [importExportText, setIOtext] = React.useState(ExportGrid(gameGrid));

  const [mode, setMode] = React.useState<"placeones" | "manualstep">(
    "placeones"
  );

  let content: ReactNode = "";
  switch (mode) {
    case "placeones":
      content = <OnePlacer />;
      break;
    case "manualstep":
      content = <AddStones />;
      break;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      }}>
      <div
        className='Header'
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderBottom: "2px solid grey",
          marginBottom: 1,
        }}>
        <div
          style={{ margin: ".5rem", fontSize: "1.5rem", marginRight: "auto" }}>
          Stepping Stones
        </div>
        <button
          onClick={() => setMode("placeones")}
          disabled={mode == "placeones"}>
          Place ones
        </button>
        <button
          style={{ marginRight: "auto" }}
          onClick={() => setMode("manualstep")}
          disabled={mode == "manualstep"}>
          Add stones
        </button>
        <button
          onClick={() => {
            const exportString = ExportGrid(gameGrid);
            console.log(exportString);
            setIOtext(exportString);
            rerender();
          }}>
          Export
        </button>
        <button
          onClick={() => {
            const exportString = ExportGrid(gameGrid);
            console.log(exportString);
            setIOtext(exportString);
            navigator.clipboard.writeText(exportString);
            rerender();
          }}>
          Copy to clipboard
        </button>
        <button
          onClick={() => {
            const importGrid = ImportGrid(importExportText);
            console.log(importGrid);
            gameGrid = importGrid;
            rerender();
          }}>
          Import
        </button>
        <input
          style={{ margin: ".5rem" }}
          value={importExportText}
          onChange={(ev) => {
            setIOtext(ev.target.value);
          }}
          id='iotext'
        />
      </div>
      <div style={{ flex: "auto", overflow: "auto" }}>{content}</div>
    </div>
  );
}

function OnePlacer() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const neighbors = SumNeighbors(gameGrid);

  const counts = CountValues(gameGrid);

  return (
    <div>
      <div>N: {counts[1]}</div>
      <GridView
        placed={gameGrid}
        neighbors={neighbors}
        onClick={({ isPlaced, value, row, col }) => {
          console.log("clicked", isPlaced, value, row, col);
          GridSet(gameGrid, row, col, isPlaced ? 0 : 1);
          rerender();
        }}
      />
    </div>
  );
}

function AddStones() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const neighbors = SumNeighbors(gameGrid);

  const counts = CountValues(gameGrid);
  const possible = CountValues(neighbors);

  const next = counts.length;

  return (
    <div>
      <div>Next: {next}</div>
      <div>
        Placed:{" "}
        {counts
          .map((_, i) => i)
          .filter((i) => i)
          .join(", ")}
      </div>
      <div>
        Available:{" "}
        {possible
          .map((_, i) => i)
          .filter((i) => i && !counts[i])
          .join(", ")}
      </div>
      <GridView
        placed={gameGrid}
        neighbors={neighbors}
        onClick={({ isPlaced, value, row, col }) => {
          console.log("clicked", isPlaced, value, row, col);

          if (value == next - 1 && isPlaced) {
            // we can go back a step.
            console.log("cleared tile.");
            GridSet(gameGrid, row, col, 0);
            rerender();
            return;
          }

          /// any other values we should ignore clicks!
          if (value !== next) {
            return;
          }

          GridSet(gameGrid, row, col, value);
          rerender();
        }}
      />
    </div>
  );
}

export default App;
