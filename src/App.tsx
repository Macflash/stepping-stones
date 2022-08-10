import React, { ReactNode } from "react";
import "./App.css";
import {
  GridSet,
  GridGet,
  GridBounds,
  BoundsForEach,
  GridForEach,
  GridSumNeighbors,
  GridCopy,
  GridCount,
  GridOnes,
} from "./logic/grid";
import { ExportGrid, ImportGrid, N2_GRID, N4_GRID, N6_GRID } from "./logic/io";
import { BruteForceGridSolver, SetSolverListener } from "./logic/solvers";
import { Grid, Bound } from "./logic/types";
import { Blocks } from "./ui/blocks";
import { ContentBody, GridView } from "./ui/grid";
import { Ones } from "./ui/ones";

function App() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const [grid, setGrid] = React.useState([[1]]);
  const [importExportText, setIOtext] = React.useState(ExportGrid(grid));

  const [mode, setMode] = React.useState<"placeones" | "manualstep" | "blocks">(
    "placeones"
  );

  let content: ReactNode = "";
  switch (mode) {
    case "placeones":
      content = <Ones grid={grid} updateGrid={setGrid} />;
      break;
    case "manualstep":
      content = <AddStones grid={grid} updateGrid={setGrid} />;
      break;
    case "blocks":
      content = <Blocks grid={grid} updateGrid={setGrid} />;
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
          onClick={() => {
            setGrid([[1]]);
            setMode("placeones");
          }}>
          Clear Grid
        </button>
        <button
          onClick={() => setMode("placeones")}
          disabled={mode == "placeones"}>
          Place ones
        </button>
        <button
          onClick={() => setMode("manualstep")}
          disabled={mode == "manualstep"}>
          Add stones
        </button>
        <button
          style={{ marginRight: "auto" }}
          onClick={() => setMode("blocks")}
          disabled={mode == "blocks"}>
          View blocks
        </button>
        <button
          onClick={() => {
            const exportString = ExportGrid(grid);
            navigator.clipboard.writeText(exportString);
            console.log(exportString);
            setIOtext(exportString);
          }}>
          Copy Grid
        </button>
        <button
          onClick={() => {
            const exportString = ExportGrid(GridOnes(grid));
            navigator.clipboard.writeText(exportString);
            console.log(exportString);
            setIOtext(exportString);
          }}>
          Copy Ones
        </button>
        <button
          onClick={() => {
            const importGrid = ImportGrid(importExportText);
            console.log(importGrid);
            setGrid(importGrid);
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
      <div
        style={{
          flex: "auto",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
        {content}
      </div>
    </div>
  );
}

function AddStones({
  grid,
  updateGrid,
}: {
  grid: Grid;
  updateGrid: (newGrid: Grid) => void;
}) {
  const [_, setRandom] = React.useState(0);
  const rerender = React.useCallback(
    () => setRandom(Math.random()),
    [setRandom]
  );

  React.useEffect(() => {
    console.log("updating renderer listener");
    SetSolverListener((bestGrid, isDone) => {
      if (isDone) console.log("DONE!!");
      updateGrid(bestGrid);
    });
  }, [rerender]);

  const counts = GridCount(grid);
  const next = counts.length;
  const last = next - 1;

  const neighbors = GridSumNeighbors(grid);
  const possible = GridCount(neighbors);
  const maxPossible = possible.length - 1;
  const available: boolean[] = [];
  for (let i = next; i <= maxPossible; i++) {
    available[i] = possible[i] > 0;
  }

  return (
    <ContentBody
      header={[
        <div style={{ margin: ".5rem" }}>N: {counts[1]}</div>,
        <div style={{ marginRight: "auto" }}>
          Next: <span style={{ color: "red" }}>{next}</span>
        </div>,
        <button
          onClick={() => {
            console.log("solving....");
            BruteForceGridSolver(grid).then((solution) => {
              console.log("solution", solution);
              updateGrid(solution);
            });
          }}>
          Solve
        </button>,
        <div
          style={{
            margin: ".5rem",
            maxWidth: "80%",
            overflow: "auto",
          }}>
          Available:{" "}
          {available.map((isPossible, value) => (
            <span
              key={value}
              style={{ margin: 4, color: isPossible ? "black" : "red" }}>
              {value}
            </span>
          ))}
        </div>,
      ]}>
      <GridView
        placedColors={{ [last > 1 ? last : -1]: "green" }}
        possibleColors={{ [next]: "red" }}
        placed={grid}
        neighbors={neighbors}
        onClick={({ isPlaced, value, row, col }) => {
          console.log("clicked", isPlaced, value, row, col);

          if (value == next - 1 && isPlaced) {
            // we can go back a step.
            console.log("cleared tile.");
            const newGrid = GridCopy(grid);
            GridSet(newGrid, row, col, 0);
            updateGrid(newGrid);
            return;
          }

          /// any other values we should ignore clicks!
          if (value !== next) {
            return;
          }

          const newGrid = GridCopy(grid);
          GridSet(newGrid, row, col, value);
          updateGrid(newGrid);
        }}
      />
    </ContentBody>
  );
}

export default App;
