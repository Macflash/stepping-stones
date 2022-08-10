export type Grid = number[][];

export interface Bound {
  min: number;
  max: number;
}

export interface Bounds {
  row: Bound;
  col: Bound;
}
