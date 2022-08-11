import React, { ReactNode } from "react";
import { GridBounds, GridCount, BoundsForEach, GridGet } from "../logic/grid";
import { Grid } from "../logic/types";

export function ContentBody({
  header,
  children,
}: {
  header: ReactNode[] | ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div
        key='header'
        style={{
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          borderBottom: "1px solid black",
          marginBottom: 1,
        }}>
        {header}
      </div>
      <div key='body' style={{ flex: "auto", overflow: "auto" }}>
        {children}
      </div>
    </>
  );
}

export function GridView({
  placed,
  neighbors,
  onClick,
  placedColors,
  possibleColors,
  extra = 1,
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
  extra?: number;
}) {
  const size = 40;
  neighbors = neighbors || placed;
  const bounds = GridBounds(neighbors, true);
  const tiles: ReactNode[] = [];

  const maxFill = 200;
  const minFill = 150;

  const max = GridCount(neighbors).length;
  const min = GridCount(placed).length;
  // if you are next it's basically black and gets fainter to the max faintness
  BoundsForEach(
    neighbors,
    (neighborValue, row, col) => {
      const placedValue = GridGet(placed, row, col);
      const isPlaced = placedValue > 0; // || neighborValue === -1; // actually check if it is in PLACED!
      const value = isPlaced ? placedValue : neighborValue;
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
          title={`${row},${col}`}
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
            color: solidColor ? (color == "white" ? "black" : "white") : color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}>
          {isEmpty ? "." : value}
        </div>
      );
    },
    extra
  );

  return (
    <div
      style={{
        transition: "margin 1s ease-in-out",
        position: "relative",
        marginTop: -1 * (bounds.row.min - extra) * size,
        marginLeft: -1 * (bounds.col.min - extra) * size,
        width: (bounds.col.max - bounds.col.min + extra) * size,
        height: (bounds.row.max - bounds.row.min + extra) * size,
      }}>
      {tiles}
    </div>
  );
}
