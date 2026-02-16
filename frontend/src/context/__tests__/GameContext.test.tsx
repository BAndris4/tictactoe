import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, useGame } from '../GameContext';
import * as authHook from '../../hooks/useAuth';
import * as toastContext from '../ToastContext';
import * as gameApi from '../../api/game';
import React from 'react';

// Mock dependencies
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
  getAuthToken: vi.fn(() => 'fake-token'),
}));

vi.mock('../ToastContext', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../api/game', () => ({
  getGame: vi.fn(),
  getGameEvaluation: vi.fn(),
}));

describe('GameContext / GameProvider', () => {
  const mockShowToast = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (authHook.useAuth as any).mockReturnValue({ user: { id: 1, username: 'TestUser' }, loading: false });
    (toastContext.useToast as any).mockReturnValue({ showToast: mockShowToast });
    (gameApi.getGame as any).mockResolvedValue({});
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  it('initializes with default state', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    expect(result.current.currentPlayer).toBe('X');
    expect(result.current.cells).toHaveLength(9);
    expect(result.current.winner).toBeUndefined();
    expect(result.current.mode).toBe('local');
    expect(result.current.moves).toHaveLength(0);
  });

  it('executes a valid move correctly', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    // X moves to Block(0,0), Cell(0,0) -> Global(0,0)
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
      });
    });

    // Check cells update
    expect(result.current.cells[0][0]).toBe('X');
    
    // Check player toggle
    expect(result.current.currentPlayer).toBe('O');

    // Check previousMove used for next validation
    expect(result.current.previousMove).toEqual({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
    });

    // Check moves history
    expect(result.current.moves).toHaveLength(1);
    expect(result.current.moves[0].player).toBe('X');
  });

  it('rejects an occupied cell move', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    // X occupies (0,0)
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
      });
    });

    // O tries to take (0,0) again
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
      });
    });

    // Should stay O's turn (move rejected)
    expect(result.current.currentPlayer).toBe('O');
    // Cell should remain X
    expect(result.current.cells[0][0]).toBe('X');
  });

  it('rejects move to incorrect block', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    // X moves B(0,0), C(0,0) -> Sends O to B(0,0)
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
      });
    });

    // O tries to move in B(1,1) -> Invalid
    act(() => {
      result.current.makeMove({
        block: { row: 1, col: 1 },
        cell: { row: 0, col: 0 },
      });
    });

    // Move rejected, still O's turn
    expect(result.current.currentPlayer).toBe('O');
    // B(1,1) C(0,0) -> Global (3,3) should be empty
    expect(result.current.cells[3][3]).toBeNull();
  });

  it('navigates history correctly', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    // Make 2 moves
    // 1. X -> B(0,0), C(0,0)
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 0 },
      });
    });

    // 2. O -> B(0,0), C(0,1)
    act(() => {
      result.current.makeMove({
        block: { row: 0, col: 0 },
        cell: { row: 0, col: 1 },
      });
    });

    expect(result.current.cells[0][0]).toBe('X');
    expect(result.current.cells[0][1]).toBe('O');
    expect(result.current.moves).toHaveLength(2);

    // Go back to start (-1)
    act(() => {
        result.current.goToStart();
    });
    expect(result.current.cells[0][0]).toBeNull();
    expect(result.current.currentPlayer).toBe('X');

    // Go forward 1 step (X moved)
    act(() => {
        result.current.stepForward();
    });
    expect(result.current.cells[0][0]).toBe('X');
    expect(result.current.cells[0][1]).toBeNull();
    expect(result.current.currentPlayer).toBe('O');

    // Go to live (both moved)
    act(() => {
        // Need to use goToLive from context
        result.current.goToLive();
    });
    expect(result.current.cells[0][1]).toBe('O');
  });
});
