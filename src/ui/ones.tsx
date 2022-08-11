import React, { ReactNode } from "react";
import { COLOR_LIST } from "../logic/colors";
import {
  GridSumNeighbors,
  GridCount,
  GridCopy,
  GridOnes,
  GridSet,
} from "../logic/grid";
import { N2_GRID, N4_GRID, N6_GRID } from "../logic/io";
import { Grid } from "../logic/types";
import { ContentBody, GridView } from "./grid";

export function Ones({
  grid,
  updateGrid,
}: {
  grid: Grid;
  updateGrid: (newGrid: Grid) => void;
}) {
  const neighbors = GridSumNeighbors(grid);
  const counts = GridCount(grid);

  return (
    <ContentBody
      header={[
        <span
          style={{
            margin: ".5rem",
          }}>
          N: {counts[1]}
        </span>,
        <select
          onChange={(ev) => {
            switch (ev.target.value) {
              case "2":
                updateGrid(N2_GRID());
                break;
              case "4":
                updateGrid(N4_GRID());
                break;
              case "6":
                updateGrid(N6_GRID());
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
        </select>,
        <button
          onClick={() => {
            updateGrid(GridOnes(grid));
          }}>
          Reset to just 1's
        </button>,
      ]}>
      <GridView
        placed={grid}
        neighbors={neighbors}
        placedColors={{ ...COLOR_LIST }}
        possibleColors={{ ...COLOR_LIST, 0: "black" }}
        onClick={({ isPlaced, value, row, col }) => {
          const newGrid = GridCopy(grid);
          GridSet(newGrid, row, col, isPlaced ? 0 : 1);
          updateGrid(newGrid);
        }}
      />
    </ContentBody>
  );
}
