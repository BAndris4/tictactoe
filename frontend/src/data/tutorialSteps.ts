import { type Move } from "../models/Move";

export type TutorialStep = {
  id: number;
  title: string;
  message: string;
  cells: (string | null)[][];
  previousMove: Move | undefined;
  targetMove: Move | null;
  validBlocks?: { row: number; col: number }[];
  expression?: "neutral" | "happy" | "sad" | "excited";
  currentPlayer?: "X" | "O";
};

export const createEmptyBoard = () =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

export const setCell = (
  board: (string | null)[][],
  bR: number,
  bC: number,
  cR: number,
  cC: number,
  val: "X" | "O" | null
) => {
  board[bR * 3 + cR][bC * 3 + cC] = val;
};

export const fillWinningBlock = (
  board: (string | null)[][],
  bR: number,
  bC: number,
  winner: "X" | "O" = "X"
) => {
  setCell(board, bR, bC, 0, 0, winner);
  setCell(board, bR, bC, 0, 1, winner);
  setCell(board, bR, bC, 0, 2, winner);

  const other: "X" | "O" = winner === "X" ? "O" : "X";
  setCell(board, bR, bC, 1, 0, other);
  setCell(board, bR, bC, 1, 1, other);
  setCell(board, bR, bC, 1, 2, winner);
  setCell(board, bR, bC, 2, 0, other);
  setCell(board, bR, bC, 2, 1, winner);
  setCell(board, bR, bC, 2, 2, other);
};

// ÚJ: Döntetlen blokk (tele van, de nincs nyertes)
export const fillDrawBlock = (
  board: (string | null)[][],
  bR: number,
  bC: number
) => {
  // X O X
  // O O X
  // X X O
  setCell(board, bR, bC, 0, 0, "X");
  setCell(board, bR, bC, 0, 1, "O");
  setCell(board, bR, bC, 0, 2, "X");
  setCell(board, bR, bC, 1, 0, "O");
  setCell(board, bR, bC, 1, 1, "O");
  setCell(board, bR, bC, 1, 2, "X");
  setCell(board, bR, bC, 2, 0, "X");
  setCell(board, bR, bC, 2, 1, "X");
  setCell(board, bR, bC, 2, 2, "O");
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome!",
    message:
      "I'm Kai, your guide. This is Ultimate Tic-Tac-Toe. It might look intimidating with 9 boards, but trust me, it's simple! Let's start: Click the CENTER of the MIDDLE board!",
    cells: createEmptyBoard(),
    previousMove: undefined,
    targetMove: { block: { row: 1, col: 1 }, cell: { row: 1, col: 1 } },
    currentPlayer: "X",
  },
  {
    id: 2,
    title: "The Send Rule (1/2)",
    message:
      "Nice! Here's the magic. Where you move on the SMALL board, you send your opponent to that position on the BIG board. Since you played center, your opponent must now play in the center big board.",
    cells: (() => {
      const b = createEmptyBoard();
      setCell(b, 1, 1, 1, 1, "X");
      return b;
    })(),
    previousMove: undefined,
    targetMove: null,
    expression: "happy",
    currentPlayer: "X",
  },
  {
    id: 3,
    title: "The Send Rule (2/2)",
    message:
      "The opponent played bottom-right in the center board. This sent YOU to the BOTTOM-RIGHT big board. See the yellow frame? You can only play there! Try it!",
    cells: (() => {
      const b = createEmptyBoard();
      setCell(b, 1, 1, 1, 1, "X");
      setCell(b, 1, 1, 2, 2, "O");
      return b;
    })(),
    previousMove: { block: { row: 1, col: 1 }, cell: { row: 2, col: 2 } },
    targetMove: { block: { row: 2, col: 2 }, cell: { row: 1, col: 1 } },
    currentPlayer: "X",
  },
  {
    id: 4,
    title: "Tactics",
    message:
      "Don't just think about where you place your X, but also where you SEND your opponent! Don't send them somewhere they can easily win. Now send them to the top-left corner.",
    cells: (() => {
      const b = createEmptyBoard();
      setCell(b, 1, 1, 1, 1, "X");
      setCell(b, 1, 1, 2, 2, "O");
      setCell(b, 2, 2, 1, 1, "X");
      setCell(b, 2, 2, 0, 2, "O");
      return b;
    })(),
    previousMove: { block: { row: 2, col: 2 }, cell: { row: 0, col: 2 } },
    targetMove: { block: { row: 0, col: 2 }, cell: { row: 0, col: 0 } },
    currentPlayer: "X",
  },
  {
    id: 5,
    title: "Small Win",
    message:
      "If you get 3 in a row on a small board, you win that entire block! The whole block becomes yours. Finish the row on the top-left board!",
    cells: (() => {
      const b = createEmptyBoard();
      setCell(b, 0, 0, 0, 0, "X");
      setCell(b, 0, 0, 0, 1, "X");
      return b;
    })(),
    previousMove: { block: { row: 1, col: 1 }, cell: { row: 0, col: 0 } },
    targetMove: { block: { row: 0, col: 0 }, cell: { row: 0, col: 2 } },
    expression: "excited",
    currentPlayer: "X",
  },
  {
    id: 6,
    title: "Big Board Status",
    message:
      "Awesome! You now have one 'Big X' in the top-left corner. The goal: Get 3 Big Xs in a row, column, or diagonal to win the entire game.",
    cells: (() => {
      const b = createEmptyBoard();
      fillWinningBlock(b, 0, 0, "X");
      return b;
    })(),
    previousMove: undefined,
    targetMove: null,
    currentPlayer: "X",
  },
  {
    id: 7,
    title: "Draw Block",
    message:
      "What if a small board fills up but nobody wins? That block becomes a 'Draw' and doesn't count for anyone. But the sending rules still apply! See the center board - it's full but no winner.",
    cells: (() => {
      const b = createEmptyBoard();
      // Középső tábla: döntetlen
      fillDrawBlock(b, 1, 1);
      return b;
    })(),
    previousMove: undefined,
    targetMove: null,
    currentPlayer: "X",
  },
  {
    id: 8,
    title: "The Joker Rule",
    message:
      "If you're sent to a full or won board, you get a FREE MOVE! You can play anywhere. Try it now!",
    cells: (() => {
      const b = createEmptyBoard();
      fillWinningBlock(b, 0, 0, "X");
      setCell(b, 1, 1, 0, 0, "O");
      return b;
    })(),
    previousMove: { block: { row: 1, col: 1 }, cell: { row: 0, col: 0 } },
    targetMove: null,
    validBlocks: [],
    currentPlayer: "X",
  },
  {
    id: 9,
    title: "Defense",
    message:
      "Now you're playing as O! Your opponent (X) has two big blocks on top. If they get the third, it's game over! You've been sent to the top-right. Block their win!",
    cells: (() => {
      const b = createEmptyBoard();
      fillWinningBlock(b, 0, 0, "X");
      fillWinningBlock(b, 0, 1, "X");
      setCell(b, 0, 2, 0, 0, "X");
      setCell(b, 0, 2, 1, 1, "X");
      return b;
    })(),
    previousMove: { block: { row: 1, col: 1 }, cell: { row: 0, col: 2 } },
    targetMove: { block: { row: 0, col: 2 }, cell: { row: 2, col: 2 } },
    currentPlayer: "O",
  },
  {
    id: 10,
    title: "The Final Strike",
    message:
      "Nice save! You're back to X. You've turned the tables and now have a chance to win. Land the winning blow!",
    cells: (() => {
      const b = createEmptyBoard();
      fillWinningBlock(b, 0, 0, "X");
      fillWinningBlock(b, 1, 1, "X");
      setCell(b, 2, 2, 0, 0, "X");
      setCell(b, 2, 2, 1, 1, "X");
      return b;
    })(),
    previousMove: { block: { row: 0, col: 2 }, cell: { row: 2, col: 2 } },
    targetMove: { block: { row: 2, col: 2 }, cell: { row: 2, col: 2 } },
    expression: "excited",
    currentPlayer: "X",
  },
];
