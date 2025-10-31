import type { Coord } from "../models/Coord";
import { toGlobalCoord } from "../utils";

type CellValue = 'X' | 'O' | null;

function getSmallTableRowWinner(cells: (string | null)[][], block: Coord): CellValue {
    for (let row = 0; row < 3; row++) {
        const { row: gRow, col: gCol } = toGlobalCoord(block, { row, col: 0 });
        if (
            (cells[gRow][gCol] === 'X' || cells[gRow][gCol] === 'O') &&
            cells[gRow][gCol] === cells[gRow][gCol + 1] &&
            cells[gRow][gCol] === cells[gRow][gCol + 2]
        ) {
            return cells[gRow][gCol] as 'X' | 'O';
        }
    }
    return null;
}

function getSmallTableColWinner(cells: (string | null)[][], block: Coord): CellValue {
    for (let col = 0; col < 3; col++) {
        const { row: gRow, col: gCol } = toGlobalCoord(block, { row: 0, col });
        if (
            (cells[gRow][gCol] === 'X' || cells[gRow][gCol] === 'O') &&
            cells[gRow][gCol] === cells[gRow + 1][gCol] &&
            cells[gRow][gCol] === cells[gRow + 2][gCol]
        ) {
            return cells[gRow][gCol] as 'X' | 'O';
        }
    }
    return null;
}

function getSmallTableDiagonalWinner(cells: (string | null)[][], block: Coord): CellValue {
    const { row: gRow, col: gCol } = toGlobalCoord(block, { row: 0, col: 0 });

    if (
        (cells[gRow][gCol] === 'X' || cells[gRow][gCol] === 'O') &&
        cells[gRow][gCol] === cells[gRow + 1][gCol + 1] &&
        cells[gRow][gCol] === cells[gRow + 2][gCol + 2]
    ) return cells[gRow][gCol] as 'X' | 'O';

    if (
        (cells[gRow + 2][gCol] === 'X' || cells[gRow + 2][gCol] === 'O') &&
        cells[gRow + 2][gCol] === cells[gRow + 1][gCol + 1] &&
        cells[gRow + 2][gCol] === cells[gRow][gCol + 2]
    ) return cells[gRow + 2][gCol] as 'X' | 'O';

    return null;
}

export function getSmallTableWinner(cells: (string | null)[][], block: Coord): CellValue {
    return getSmallTableRowWinner(cells, block) ??
           getSmallTableColWinner(cells, block) ??
           getSmallTableDiagonalWinner(cells, block) ??
           null;
}

function getRowWinner(cells: (string | null)[][]): CellValue {
    for (let row = 0; row < 3; row++) {
        if (getSmallTableWinner(cells, { row, col: 0 }) &&
            getSmallTableWinner(cells, { row, col: 0 }) === getSmallTableWinner(cells, { row, col: 1 }) &&
            getSmallTableWinner(cells, { row, col: 0 }) === getSmallTableWinner(cells, { row, col: 2 })) {
                return getSmallTableWinner(cells, { row, col: 0 }) as 'X' | 'O';
            }
    }
    return null;
}

function getColWinner(cells: (string | null)[][]): CellValue {
    for (let col = 0; col < 3; col++) {
        if (getSmallTableWinner(cells, { row: 0, col }) &&
            getSmallTableWinner(cells, { row: 0, col }) === getSmallTableWinner(cells, { row: 1, col }) &&
            getSmallTableWinner(cells, { row: 0, col }) === getSmallTableWinner(cells, { row: 2, col })) {
                return getSmallTableWinner(cells, { row: 0, col }) as 'X' | 'O';
            }
    }
    return null;
}

function getDiagonalWinner(cells: (string | null)[][]): CellValue {
    if (getSmallTableWinner(cells, { row: 0, col: 0 }) &&
        getSmallTableWinner(cells, { row: 0, col: 0 }) === getSmallTableWinner(cells, { row: 1, col: 1 }) &&
        getSmallTableWinner(cells, { row: 0, col: 0 }) === getSmallTableWinner(cells, { row: 2, col: 2 })) {
            return getSmallTableWinner(cells, { row: 0, col: 0 }) as 'X' | 'O';
        }
    if (getSmallTableWinner(cells, { row: 2, col: 0 }) &&
        getSmallTableWinner(cells, { row: 2, col: 0 }) === getSmallTableWinner(cells, { row: 1, col: 1 }) &&
        getSmallTableWinner(cells, { row: 2, col: 0 }) === getSmallTableWinner(cells, { row: 0, col: 2 })) {
            return getSmallTableWinner(cells, { row: 2, col: 0 }) as 'X' | 'O';
        }
    return null;
}
export function getWinner(cells: (string | null)[][]): CellValue {
     return getRowWinner(cells) ??
           getColWinner(cells) ??
           getDiagonalWinner(cells) ??
           null;
}