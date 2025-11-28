import { toGlobalCoord } from "../utils";

export type WinningLine =
  | { type: "row"; index: number }
  | { type: "col"; index: number }
  | { type: "diag-main" }
  | { type: "diag-anti" };

export function getWinningLineInBlock(
  allCells: (string | null)[][],
  blockRow: number,
  blockCol: number,
  smallWinner: string | undefined
): WinningLine | null {
  if (!smallWinner) return null;

  const local: (string | null)[][] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => {
      const g = toGlobalCoord(
        { row: blockRow, col: blockCol },
        { row: r, col: c }
      );
      return allCells[g.row][g.col];
    })
  );

  const w = smallWinner;

  for (let r = 0; r < 3; r++) {
    if (local[r][0] === w && local[r][1] === w && local[r][2] === w) {
      return { type: "row", index: r };
    }
  }

  for (let c = 0; c < 3; c++) {
    if (local[0][c] === w && local[1][c] === w && local[2][c] === w) {
      return { type: "col", index: c };
    }
  }

  if (local[0][0] === w && local[1][1] === w && local[2][2] === w) {
    return { type: "diag-main" };
  }

  if (local[0][2] === w && local[1][1] === w && local[2][0] === w) {
    return { type: "diag-anti" };
  }

  return null;
}
