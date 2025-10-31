import type { Coord } from "../models/Coord";
import { toGlobalCoord } from "../utils";

type CellValue = string | null;

function checkLine(cells: (string | null)[][], coords: Coord[], block?: Coord): CellValue {
  const firstCoord = block ? toGlobalCoord(block, coords[0]) : coords[0];
  const firstValue = cells[firstCoord.row][firstCoord.col];
  if (!firstValue) return null;

  for (let i = 1; i < coords.length; i++) {
    const c = block ? toGlobalCoord(block, coords[i]) : coords[i];
    if (cells[c.row][c.col] !== firstValue) return null;
  }
  return firstValue;
}

export function getRowWinner(cells: (string | null)[][], block?: Coord): CellValue {
  for (let row = 0; row < 3; row++) {
    const winner = checkLine(
      cells,
      Array.from({ length: 3 }, (_, col) => ({ row, col })),
      block
    );
    if (winner) return winner;
  }
  return null;
}

export function getColWinner(cells: (string | null)[][], block?: Coord): CellValue {
  for (let col = 0; col < 3; col++) {
    const winner = checkLine(
      cells,
      Array.from({ length: 3 }, (_, row) => ({ row, col })),
      block
    );
    if (winner) return winner;
  }
  return null;
}

export function getDiagonalWinner(cells: (string | null)[][], block?: Coord): CellValue {
  const diag1 = checkLine(
    cells,
    [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
    block
  );
  if (diag1) return diag1;

  const diag2 = checkLine(
    cells,
    [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
    block
  );
  return diag2;
}

export function getSmallTableWinner(cells: (string | null)[][], block: Coord): CellValue {
  return getRowWinner(cells, block) ??
         getColWinner(cells, block) ??
         getDiagonalWinner(cells, block);
}

export function getWinner(cells: (string | undefined)[][]): string | undefined {
  return getRowWinner(cells as (string | null)[][]) ??
         getColWinner(cells as (string | null)[][]) ??
         getDiagonalWinner(cells as (string | null)[][]) ??
         undefined;
}