import type { Coord } from "./models/Coord";
import type { Move } from "./models/Move";

export function formatMove(move?: Move) {
  if (!move) return "None";
  return `(${move.block.row+1}, ${move.block.col+1}) -> (${move.cell.row+1}, ${move.cell.col+1})`;
}

export function toGlobalCoord(block: Coord, cell: Coord) {
  return { row: block.row * 3 + cell.row, col: block.col * 3 + cell.col };
}