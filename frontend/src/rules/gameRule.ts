import type { Coord } from "../models/Coord";
import type { Move } from "../models/Move";
import { toGlobalCoord } from "../utils";

export function isFull(cells: (string | null)[][], blockCoord: Coord) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const { row: globalRow, col: globalCol } = toGlobalCoord(blockCoord, { row, col });
            if (!cells[globalRow][globalCol]) return false;
        }
    }
    return true;
}

function isOccupied(cells: (string | null)[][], move: Move) {
    const { row: globalRow, col: globalCol } = toGlobalCoord(move.block, move.cell);
    return !!cells[globalRow][globalCol];
}

export function isMoveValid(
    cells: (string | null)[][], 
    move: Move, 
    previousMove: Move | undefined,
    smallWinners?: (string | undefined)[][]
) {

    if (isOccupied(cells, move)) throw new Error("Invalid move: Occupied");

    if (!previousMove) return true;
    
    // Check if the board we are sent to is full
    if (isFull(cells, previousMove.cell)) return true;

    // Check if the board we are sent to is already won (if we have that info)
    if (smallWinners) {
        const targetBlockWinner = smallWinners[previousMove.cell.row][previousMove.cell.col];
        if (targetBlockWinner) return true; // Can play anywhere if target board is won
    }
    
    if (previousMove.cell.col === move.block.col &&
        previousMove.cell.row === move.block.row) return true;
    
    throw new Error(
        `Invalid move: You can move only to block (${previousMove.cell.row}, ${previousMove.cell.col})`
    );
}