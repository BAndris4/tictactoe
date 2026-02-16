import { describe, it, expect } from 'vitest';
import { isFull, isMoveValid } from '../gameRule';
import type { Move } from '../../models/Move';

describe('gameRule', () => {
    // Helper to create an empty 9x9 grid
    const createEmptyCells = (): (string | null)[][] =>
        Array(9).fill(null).map(() => Array(9).fill(null));

    // Helper to create an empty 3x3 small winners grid
    const createEmptySmallWinners = (): (string | undefined)[][] =>
        Array(3).fill(undefined).map(() => Array(3).fill(undefined));

    describe('isFull', () => {
        it('should return false for an empty block', () => {
            const cells = createEmptyCells();
            expect(isFull(cells, { row: 0, col: 0 })).toBe(false);
        });

        it('should return false for a partially filled block', () => {
            const cells = createEmptyCells();
            // Fill 8 cells in block (0,0)
            // Block (0,0) corresponds to global rows 0-2, cols 0-2
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (r === 2 && c === 2) continue; // Leave one empty
                    cells[r][c] = 'X';
                }
            }
            expect(isFull(cells, { row: 0, col: 0 })).toBe(false);
        });

        it('should return true for a full block', () => {
            const cells = createEmptyCells();
            // Fill all cells in block (0,0)
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    cells[r][c] = 'O';
                }
            }
            expect(isFull(cells, { row: 0, col: 0 })).toBe(true);
        });
    });

    describe('isMoveValid', () => {
        const defaultMove: Move = {
            block: { row: 1, col: 1 }, // Global target: rows 3-5, cols 3-5
            cell: { row: 0, col: 0 }
        };

        it('should throw error if the target cell is already occupied', () => {
            const cells = createEmptyCells();
            // Occupy the specific cell: Block (1,1), Cell (0,0) -> Global (3,3)
            // Block row 1*3 + cell row 0 = 3
            // Block col 1*3 + cell col 0 = 3
            cells[3][3] = 'O';

            expect(() => isMoveValid(cells, defaultMove, undefined)).toThrow("Invalid move: Occupied");
        });

        it('should allow any move if it is the first move (no previousMove)', () => {
            const cells = createEmptyCells();
            expect(isMoveValid(cells, defaultMove, undefined)).toBe(true);
        });

        it('should allow a move to the correct block dictated by previousMove', () => {
            const cells = createEmptyCells();
            const prevMove: Move = {
                block: { row: 0, col: 0 },
                cell: { row: 1, col: 1 }, // Must play in block (1,1)
            };
            
            // defaultMove is to block (1,1), so it should be valid
            expect(isMoveValid(cells, defaultMove, prevMove)).toBe(true);
        });

        it('should throw error if moving to a wrong block', () => {
            const cells = createEmptyCells();
            const prevMove: Move = {
                block: { row: 0, col: 0 },
                cell: { row: 0, col: 0 }, // Must play in block (0,0)
            };

            // defaultMove is to block (1,1), which is wrong
            expect(() => isMoveValid(cells, defaultMove, prevMove)).toThrow(/Invalid move: You can move only to block/);
        });

        it('should allow moving anywhere if the target block is full', () => {
            const cells = createEmptyCells();
            
            // Fill block (0,0) completely
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    cells[r][c] = 'X';
                }
            }

            // Previous move sent us to block (0,0)
            const prevMove: Move = {
                block: { row: 1, col: 1 },
                cell: { row: 0, col: 0 }, // Sent to block (0,0)
            };

            // We want to move to block (1,1). Even though prevMove sent us to (0,0),
            // (0,0) is full, so we can go anywhere (except occupied cells).
            // defaultMove is to block (1,1), cell (0,0). ensure it's empty.
            expect(isMoveValid(cells, defaultMove, prevMove)).toBe(true);
        });

        it('should allow moving anywhere if the target block is already won', () => {
            const cells = createEmptyCells();
            const smallWinners = createEmptySmallWinners();
            
            // Mark block (0,0) as won by 'X'
            smallWinners[0][0] = 'X';

            // Previous move sent us to block (0,0)
            const prevMove: Move = {
                block: { row: 1, col: 1 },
                cell: { row: 0, col: 0 }, // Sent to block (0,0)
            };

            // defaultMove is to block (1,1).
            // Since target block (0,0) is won, we can play anywhere.
            expect(isMoveValid(cells, defaultMove, prevMove, smallWinners)).toBe(true);
        });
        
        it('should still respect occupancy when allowed to move anywhere', () => {
             const cells = createEmptyCells();
             const smallWinners = createEmptySmallWinners();

             // Mark block (0,0) as won
             smallWinners[0][0] = 'X';

             // Previous move sent to (0,0)
             const prevMove: Move = {
                 block: { row: 1, col: 1 },
                 cell: { row: 0, col: 0 },
             };

             // We try to move to block (1,1), cell (0,0) -> global (3,3)
             // But let's make that cell occupied
             cells[3][3] = 'X';

             // Even though we can move anywhere, we can't move to an occupied cell
             expect(() => isMoveValid(cells, defaultMove, prevMove, smallWinners)).toThrow("Invalid move: Occupied");
        });
    });
});
