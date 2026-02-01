import type { Move } from "../models/Move";
import { toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";

export interface ReconstructedGameState {
  cells: (string | null)[][];
  smallWinners: (string | undefined)[][];
  currentPlayer: "X" | "O";
  previousMove: Move | undefined;
  winner: string | undefined;
}

/**
 * Reconstructs the complete game state up to a specific move index
 * @param moves - Complete move history from the game
 * @param targetIndex - Index to reconstruct to (-1 = initial state, 0 = after first move, etc.)
 * @returns Complete game state at that point
 */
export function reconstructGameStateAtMove(
  moves: any[],
  targetIndex: number
): ReconstructedGameState {
  // Initialize empty board
  const cells: (string | null)[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
  
  const smallWinners: (string | undefined)[][] = Array(3)
    .fill(undefined)
    .map(() => Array(3).fill(undefined));

  let currentPlayer: "X" | "O" = "X";
  let previousMove: Move | undefined = undefined;
  let winner: string | undefined = undefined;

  // Replay moves up to targetIndex (inclusive)
  const movesToReplay = moves.slice(0, targetIndex + 1);

  for (const move of movesToReplay) {
    const player = move.player;
    
    // Convert cell/subcell indices to global coordinates
    const blockRow = Math.floor(move.cell / 3);
    const blockCol = move.cell % 3;
    const cellRow = Math.floor(move.subcell / 3);
    const cellCol = move.subcell % 3;

    const global = toGlobalCoord(
      { row: blockRow, col: blockCol },
      { row: cellRow, col: cellCol }
    );

    // Place the move
    cells[global.row][global.col] = player;

    // Update previous move
    previousMove = {
      block: { row: blockRow, col: blockCol },
      cell: { row: cellRow, col: cellCol },
    };

    // Check for small board win
    const smallWinner = getSmallTableWinner(cells, { row: blockRow, col: blockCol });
    if (smallWinner && !smallWinners[blockRow][blockCol]) {
      smallWinners[blockRow][blockCol] = smallWinner;
    }

    // Toggle player
    currentPlayer = player === "X" ? "O" : "X";
  }

  // Check for overall winner
  winner = getWinner(smallWinners);

  return {
    cells,
    smallWinners,
    currentPlayer,
    previousMove,
    winner,
  };
}

/**
 * Get the total number of positions available (including initial state)
 * @param moves - Complete move history
 * @returns Number of positions (initial + all moves)
 */
export function getTotalPositions(moves: any[]): number {
  return moves.length + 1; // +1 for initial empty board
}

/**
 * Check if we're at the latest/live position
 * @param currentIndex - Current position index
 * @param moves - Complete move history
 * @returns True if at live position
 */
export function isAtLivePosition(currentIndex: number | null, moves: any[]): boolean {
  return currentIndex === null || currentIndex === moves.length - 1;
}
