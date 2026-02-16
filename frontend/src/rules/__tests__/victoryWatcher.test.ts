import { describe, it, expect } from 'vitest';
import {
  getRowWinner,
  getColWinner,
  getDiagonalWinner,
  getSmallTableWinner,
  getWinner
} from '../victoryWatcher';

describe('victoryWatcher', () => {
  // Helper to create an empty 9x9 grid
  const createEmptyCells = (): (string | null)[][] =>
    Array(9).fill(null).map(() => Array(9).fill(null));

  // Helper to create an empty 3x3 small winners grid
  const createEmptySmallWinners = (): (string | undefined)[][] =>
      Array(3).fill(undefined).map(() => Array(3).fill(undefined));

  describe('getRowWinner', () => {
    it('should detect a row winner in a specific block', () => {
      const cells = createEmptyCells();
      // Block (0,0) -> global rows 0-2, cols 0-2.
      // Fill row 0 of block (0,0) -> global row 0, cols 0,1,2
      cells[0][0] = 'X';
      cells[0][1] = 'X';
      cells[0][2] = 'X';

      const winner = getRowWinner(cells, { row: 0, col: 0 });
      expect(winner).toBe('X');
    });

    it('should return null if no row winner', () => {
      const cells = createEmptyCells();
      cells[0][0] = 'X';
      cells[0][1] = 'O';
      cells[0][2] = 'X';
      expect(getRowWinner(cells, { row: 0, col: 0 })).toBeNull();
    });
  });

  describe('getColWinner', () => {
    it('should detect a column winner in a specific block', () => {
        const cells = createEmptyCells();
        // Block (1,1) -> global rows 3-5, cols 3-5
        // Fill col 1 of block (1,1) -> global cols 4 (3+1)
        // Rows: 3,4,5
        cells[3][4] = 'O';
        cells[4][4] = 'O';
        cells[5][4] = 'O';

        const winner = getColWinner(cells, { row: 1, col: 1 });
        expect(winner).toBe('O');
    });
  });

  describe('getDiagonalWinner', () => {
      it('should detect main diagonal winner', () => {
          const cells = createEmptyCells();
          // Block (0,0)
          cells[0][0] = 'X';
          cells[1][1] = 'X';
          cells[2][2] = 'X';
          expect(getDiagonalWinner(cells, { row: 0, col: 0 })).toBe('X');
      });

      it('should detect anti-diagonal winner', () => {
        const cells = createEmptyCells();
        // Block (0,0) -> rows 0-2, cols 0-2
        // Anti-diagonal: (0,2), (1,1), (2,0)
        cells[0][2] = 'O';
        cells[1][1] = 'O';
        cells[2][0] = 'O';
        expect(getDiagonalWinner(cells, { row: 0, col: 0 })).toBe('O');
    });
  });

  describe('getSmallTableWinner', () => {
      it('should return winner if any line check passes', () => {
          const cells = createEmptyCells();
          cells[0][0] = 'X';
          cells[0][1] = 'X';
          cells[0][2] = 'X';
          expect(getSmallTableWinner(cells, { row: 0, col: 0 })).toBe('X');
      });

      it('should return null if no winner', () => {
          const cells = createEmptyCells();
          expect(getSmallTableWinner(cells, { row: 0, col: 0 })).toBeNull();
      });
  });

  describe('getWinner (Global)', () => {
      it('should detect global winner from small board winners', () => {
          const smallWinners = createEmptySmallWinners();
          // X wins top row blocks
          smallWinners[0][0] = 'X';
          smallWinners[0][1] = 'X';
          smallWinners[0][2] = 'X';
          
          expect(getWinner(smallWinners)).toBe('X');
      });

      it('should return undefined if no global winner', () => {
        const smallWinners = createEmptySmallWinners();
        smallWinners[0][0] = 'X';
        smallWinners[0][1] = 'O';
        expect(getWinner(smallWinners)).toBeUndefined();
      });
  });
});
