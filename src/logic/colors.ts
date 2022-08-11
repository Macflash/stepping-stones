export const COLORS = [
  "#e6194B",
  "#3cb44b",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#fabed4",
  "#469990",
  "#9A6324",
  "#800000",
  "#808000",
  "#000075",
  "#111",
  "grey",
];

export function GetColor(value: number): string | undefined {
  if (value <= 1) return;
  const index = Math.floor(value / 10);
  return COLORS[index];
}

const colorRange = 10;

export const COLOR_LIST = [
  ...COLORS.flatMap((c) => Array.from(Array(colorRange)).map(() => c)),
];

COLOR_LIST[0] = "black";
COLOR_LIST[1] = "black";

console.log(COLOR_LIST);
