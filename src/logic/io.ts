import { GridBounds, GridGet, GridSet } from "./grid";
import { Grid } from "./types";

/** Exports a grid in AZ format */
export function ExportGrid(grid: Grid): string {
  let rowStrs: string[] = [];
  const bounds = GridBounds(grid);
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

/** Imports a grid in AZ format */
export function ImportGrid(str: string): Grid {
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

// Simple dot format
export function ImportDotFormat(str: string): Grid {
  const grid: Grid = [];
  const rows = str.split("\n").filter((s) => s);
  rows.forEach((row_arr, row) => {
    const elements = row_arr.split(" ").filter((s) => s);
    elements.forEach((s, col) => {
      const value = Number(s);
      if (!value || isNaN(value)) return;
      GridSet(grid, row, col, value);
    });
  });

  return grid;
}

/**n=2 gets 16 */
const n2_16 = `
 9  5 10 11  .  .
 .  4  1  .  .  .
12  8  3  2  . 16
 .  .  .  6  1 15
 .  .  13 7 14  .`;

/** n=4 with max 38 */
const n4_38 = `
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .

. 35 18 36  . 23  . 21  . 32  .  .  .  .  .

.  . 17  1  . 14  9  . 12 20  .  .  .  .  .

.  . 34 16 15  .  5  4  8  .  . 26 27  .  .

.  .  .  . 31  . 10  1  3 19 25  .  1 28  .

.  .  .  .  .  . 11  .  2  6  . 33  . 29  .

.  .  .  .  .  . 24 13 22  1  7  .  .  .  .

.  .  .  .  .  . 37  .  . 30 38  .  .  .  .

.  .  .  .  .  .  .  .  .  .  .  .  .  .  . `;

/** n=6 with max of 60 */
const n6_60 = `
.  .  .  .  .  .  .  .  .  .  .  .  . 47 24 48  .

.  .  .  .  .  .  .  .  .  .  .  .  .  . 23  1 49

.  .  .  .  .  .  .  .  .  .  .  . 41  . 22  . 50

.  .  .  .  .  .  .  . 51  . 36  . 20 21 43  .  .

.  .  .  .  .  .  .  . 34 17  . 19  1  .  .  .  .

.  .  .  .  .  .  .  . 16  1 18 38 58 59  .  .  .

.  .  .  .  . 37 30 15 40  . 57  .  .  .  .  .  .

.  .  .  .  .  .  7  8  .  .  .  .  .  .  .  .  .

.  .  . 35 46  6  1 25 33  .  .  .  .  .  .  .  .

. 60 32  .  3  2  9  .  .  .  .  .  .  .  .  .  .

.  . 28  4  1 31 11 45  . 52  .  .  .  .  .  .  .

. 42 14 10  5  .  . 12 13 39  .  .  .  .  .  .  .

. 56  . 29 44  .  .  1 26  .  .  .  .  .  .  .  .

.  .  .  .  .  . 55 54 27 53  .  .  .  .  .  .  . `;

export const N2_GRID = ImportDotFormat(n2_16);
export const N4_GRID = ImportDotFormat(n4_38);
export const N6_GRID = ImportDotFormat(n6_60);
