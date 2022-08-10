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
} from "./logic/grid";
import { ExportGrid, ImportGrid, N2_GRID, N4_GRID, N6_GRID } from "./logic/io";
import { Grid, Bound } from "./logic/types";

var gameGrid: Grid = [[1]];

function GridView({
  placed,
  neighbors,
  onClick,
  placedColors,
  possibleColors,
}: {
  placed: Grid;
  neighbors?: Grid;
  onClick?: (data: {
    value: number;
    isPlaced: boolean;
    row: number;
    col: number;
  }) => void;
  placedColors?: { [n: number]: string };
  possibleColors?: { [n: number]: string };
}) {
  const size = 40;
  neighbors = neighbors || placed;
  const bounds = GridBounds(neighbors);
  const tiles: ReactNode[] = [];

  const maxFill = 200;
  const minFill = 150;

  const max = GridCount(neighbors).length;
  const min = GridCount(placed).length;
  // if you are next it's basically black and gets fainter to the max faintness
  BoundsForEach(
    neighbors,
    (neighborValue, row, col) => {
      const isPlaced = neighborValue === -1;
      const value = isPlaced ? gameGrid[row][col] : neighborValue;
      const isEmpty = value == 0;

      let color = "black";
      if (isPlaced) {
        color = placedColors?.[value] || color;
      } else {
        const percent = (value - min) / (max - min);
        const colorShade = percent * (maxFill - minFill) + minFill;
        color =
          possibleColors?.[value] ||
          `rgb(${colorShade}, ${colorShade}, ${colorShade})`; // "#AAA";
      }

      const solidColor = isPlaced && color !== "black";
      const backgroundColor = solidColor
        ? color
        : value == 1 && isPlaced
        ? "#CCC"
        : "transparent";

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
            backgroundColor,
            cursor: isPlaced ? "grab" : "pointer",
            position: "absolute",
            left: col * size + 2,
            top: row * size + 2,
            fontSize: size / 2,
            height: size - 4,
            width: size - 4,
            borderRadius: size,
            border: isPlaced ? `1px solid ${color}` : "1px solid transparent",
            color: solidColor ? "white" : color,
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
          onClick={() => {
            gameGrid = [[1]];
            setMode("placeones");
            rerender();
          }}>
          Clear Grid
        </button>
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

function OnePlacer() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const neighbors = GridSumNeighbors(gameGrid);

  const counts = GridCount(gameGrid);

  return (
    <>
      <div
        style={{
          fontSize: "1.2rem",
          display: "flex",
        }}>
        <span
          style={{
            margin: ".5rem",
          }}>
          N: {counts[1]}
        </span>
        <select
          onChange={(ev) => {
            switch (ev.target.value) {
              case "2":
                gameGrid = GridCopy(N2_GRID);
                rerender();
                break;
              case "4":
                gameGrid = GridCopy(N4_GRID);
                rerender();
                break;
              case "6":
                gameGrid = GridCopy(N6_GRID);
                rerender();
                break;
            }
            ev.target.value = "";
          }}
          style={{
            margin: ".5rem",
          }}>
          <option value=''>Load grid...</option>
          <option value='2'>N=2 16</option>
          <option value='4'>N=4 38</option>
          <option value='6'>N=4 60</option>
        </select>
      </div>
      <div style={{ flex: "auto", overflow: "auto" }}>
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
    </>
  );
}

function AddStones() {
  const [_, setRandom] = React.useState(0);
  const rerender = () => setRandom(Math.random());

  const neighbors = GridSumNeighbors(gameGrid);

  const counts = GridCount(gameGrid);
  const possible = GridCount(neighbors);
  console.log("possible", possible);

  const next = counts.length;
  const last = next - 1;

  const maxPossible = possible.length - 1;
  console.log("maxPossible", maxPossible);

  const available: boolean[] = [];
  for (let i = next; i <= maxPossible; i++) {
    available[i] = possible[i] > 0;
  }
  console.log("available", available);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          fontSize: "1.2rem",
        }}>
        <div style={{ margin: ".5rem" }}>N: {counts[1]}</div>
        <div style={{ marginRight: "auto" }}>
          Next: <span style={{ color: "red" }}>{next}</span>
        </div>
        <div
          style={{
            margin: ".5rem",
            maxWidth: "80%",
            overflow: "auto",
          }}>
          Available:{" "}
          {available.map((isPossible, value) => (
            <span style={{ margin: 4, color: isPossible ? "black" : "red" }}>
              {value}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: "auto", overflow: "auto" }}>
        <GridView
          placedColors={{ [last > 1 ? last : -1]: "green" }}
          possibleColors={{ [next]: "red" }}
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
    </>
  );
}

export default App;
