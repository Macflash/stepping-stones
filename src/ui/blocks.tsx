import React, { ReactNode } from "react";
import { BlocksExtract, GridFilter } from "../logic/buildingblock";
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

export function Blocks({
  grid,
  updateGrid,
}: {
  grid: Grid;
  updateGrid: (newGrid: Grid) => void;
}) {
  const neighbors = GridSumNeighbors(grid);
  const blocks = React.useMemo(() => BlocksExtract(grid), [grid]);
  return (
    <ContentBody
      header={blocks.map((g, i) => (
        <div style={{ border: "1px solid grey", margin: 1 }} key={i}>
          <GridView
            placed={GridFilter(g, (v) => v <= i)}
            neighbors={g}
            key={i}
            extra={0}
            placedColors={{ [i]: "red" }}
            possibleColors={{ 0: "black" }}
          />
        </div>
      ))}>
      <GridView placed={grid} neighbors={neighbors} />
    </ContentBody>
  );
}
