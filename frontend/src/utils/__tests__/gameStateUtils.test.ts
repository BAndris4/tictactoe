import { describe, it, expect } from 'vitest';
import {
  toGlobalCoord,
  formatMove,
  reconstructGameStateAtMove,
  getTotalPositions,
  isAtLivePosition,
} from '../gameStateUtils';
import type { Move } from '../../models/Move';

// Mock victoryWatcher if needed, or rely on real logic.
// For now, we'll rely on real logic but we could mock if it gets complex.
// If victoryWatcher has complex dependencies, uncomment below:
// vi.mock('../../rules/victoryWatcher', () => ({
//   getSmallTableWinner: vi.fn(),
//   getWinner: vi.fn(),
// }));

describe('gameStateUtils', () => {
  describe('toGlobalCoord', () => {
    it('should correctly convert (0,0) block and (0,0) cell to (0,0) global', () => {
      const global = toGlobalCoord({ row: 0, col: 0 }, { row: 0, col: 0 });
      expect(global).toEqual({ row: 0, col: 0 });
    });

    it('should correctly convert (2,2) block and (2,2) cell to (8,8) global', () => {
      const global = toGlobalCoord({ row: 2, col: 2 }, { row: 2, col: 2 });
      expect(global).toEqual({ row: 8, col: 8 });
    });

    it('should correctly convert (1,0) block and (1,2) cell to (4,2) global', () => {
      const global = toGlobalCoord({ row: 1, col: 0 }, { row: 1, col: 2 });
      // block (1,0) starts at row 3, col 0.
      // cell (1,2) adds row 1, col 2.
      // global: row 3+1=4, col 0+2=2.
      expect(global).toEqual({ row: 4, col: 2 });
    });
  });

  describe('formatMove', () => {
    it('should return "None" for undefined move', () => {
      expect(formatMove(undefined)).toBe('None');
    });

    it('should format a valid move string', () => {
      const move: Move = {
        block: { row: 0, col: 0 },
        cell: { row: 1, col: 1 },
      };
      // Expected: "(1, 1) -> (2, 2)" (1-based indexing)
      expect(formatMove(move)).toBe('(1, 1) -> (2, 2)');
    });
  });

  describe('reconstructGameStateAtMove', () => {
    it('should return initial empty state for targetIndex -1', () => {
      const moves: Move[] = [];
      const state = reconstructGameStateAtMove(moves, -1);
      
      expect(state.currentPlayer).toBe('X');
      expect(state.cells.flat().every(c => c === null)).toBe(true);
      expect(state.smallWinners.flat().every(w => w === undefined)).toBe(true);
      expect(state.winner).toBeUndefined();
      expect(state.previousMove).toBeUndefined();
    });

    it('should reconstruct state after one move', () => {
      const moves: any[] = [
        { player: 'X', cell: 0, subcell: 4 }, // Center of top-left block
      ];
      const state = reconstructGameStateAtMove(moves, 0);

      // (0,0) block, (1,1) cell -> global (1,1)
      expect(state.cells[1][1]).toBe('X');
      expect(state.currentPlayer).toBe('O');
      expect(state.previousMove).toEqual({
        block: { row: 0, col: 0 },
        cell: { row: 1, col: 1 },
      });
    });

    it('should identify a small board win', () => {
      // X wins top-left block (0)
      const moves: any[] = [
        { player: 'X', cell: 0, subcell: 0 },
        { player: 'O', cell: 0, subcell: 3 }, // distract
        { player: 'X', cell: 0, subcell: 1 },
        { player: 'O', cell: 0, subcell: 4 }, // distract
        { player: 'X', cell: 0, subcell: 2 }, // win line 0,1,2 in block 0
      ];
      
      const state = reconstructGameStateAtMove(moves, 4);
      expect(state.smallWinners[0][0]).toBe('X');
    });
  });

  describe('getTotalPositions', () => {
    it('should return moves length + 1', () => {
      expect(getTotalPositions([])).toBe(1);
      expect(getTotalPositions([1, 2, 3])).toBe(4);
    });
  });

  describe('isAtLivePosition', () => {
    it('should return true if currentIndex is null', () => {
      expect(isAtLivePosition(null, [1, 2])).toBe(true);
    });

    it('should return true if currentIndex is last index', () => {
      expect(isAtLivePosition(1, [1, 2])).toBe(true);
    });

    it('should return false if currentIndex is not last index', () => {
      expect(isAtLivePosition(0, [1, 2])).toBe(false);
    });
  });
});
