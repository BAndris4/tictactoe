import type { Coord } from "../models/Coord";
import type { Move } from "../models/Move";

function isFull(cells: (string | null)[][], blockCoord: Coord) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (!cells[blockCoord.row + row][blockCoord.col + col]) return false;
        }
    }
    return true;
}

function isOccupied(cells: (string | null)[][], move: Move) {
    const globalRow = move.block.row * 3 + move.cell.row;
    const globalCol = move.block.col * 3 + move.cell.col;
    return !!cells[globalRow][globalCol];
}

export function isMoveValid(cells: (string | null)[][], move: Move, previousMove: Move | null) {

    if (isOccupied(cells, move)) {
        console.log("Invalid move: Occupied");
        return false;
    };

    if (!previousMove) return true;
    
    if (isFull(cells, previousMove.cell)) return true;
    
    if (previousMove.cell.col == move.block.col &&
        previousMove.cell.row == move.block.row) return true;
    
    console.log(`Invalid move: You can move just to ${previousMove.block.row}, ${previousMove.block.col} block`);
    return false;
}