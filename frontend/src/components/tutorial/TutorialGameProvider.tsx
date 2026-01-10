import React, { useEffect, useMemo, useState } from "react";
import { GameContext } from "../../context/GameContext";
import type { Move } from "../../models/Move";
import { toGlobalCoord } from "../../utils";
import { getSmallTableWinner } from "../../rules/victoryWatcher";
import { TUTORIAL_STEPS } from "../../data/tutorialSteps";

type Expression = "neutral" | "happy" | "sad" | "excited";

interface Props {
  children: React.ReactNode;
  stepIndex: number;
  setStepIndex: (fn: (prev: number) => number) => void;
  setExpression: (e: Expression) => void;
  onComplete: () => void;
}

export default function TutorialGameProvider({
  children,
  stepIndex,
  setStepIndex,
  setExpression,
  onComplete,
}: Props) {
  const step = TUTORIAL_STEPS[stepIndex];

  const [cells, setCells] = useState<(string | null)[][]>(step.cells);
  const [previousMove, setPreviousMove] = useState<Move | undefined>(
    step.previousMove
  );

  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  useEffect(() => {
    setCells(step.cells);
    setPreviousMove(step.previousMove);
    setExpression(step.expression ?? "neutral");
  }, [stepIndex]);

  const smallWinners = useMemo<(string | undefined)[][]>(() => {
    const sw = Array(3)
      .fill(undefined)
      .map(() => Array(3).fill(undefined));

    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const w = getSmallTableWinner(cells, { row: br, col: bc });
        if (w) sw[br][bc] = w;
      }
    }
    return sw;
  }, [cells]);

  const currentPlayer = (step.currentPlayer ?? "X") as "X" | "O";

  const advance = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((p) => p + 1);
    } else {
      onComplete();
    }
  };

  const makeMove = (move: Move) => {
    if (step.targetMove === null && step.id !== 8) {
      setExpression("sad");
      triggerFlash();
      triggerShake();
      setTimeout(() => setExpression(step.expression ?? "neutral"), 900);
      return;
    }

    if (step.id === 8 && step.targetMove === null) {
      const g = toGlobalCoord(move.block, move.cell);
      if (cells[g.row][g.col] !== null) {
        setExpression("sad");
        triggerFlash();
        triggerShake();
        setTimeout(() => setExpression(step.expression ?? "neutral"), 900);
        return;
      }

      const next = cells.map((r) => [...r]);
      next[g.row][g.col] = currentPlayer;
      setCells(next);
      setPreviousMove(move);
      setExpression("happy");
      setTimeout(advance, 450);
      return;
    }

    if (step.targetMove) {
      const t = step.targetMove;
      const ok =
        move.block.row === t.block.row &&
        move.block.col === t.block.col &&
        move.cell.row === t.cell.row &&
        move.cell.col === t.cell.col;

      if (!ok) {
        setExpression("sad");
        triggerFlash();
        triggerShake();
        setTimeout(() => setExpression(step.expression ?? "neutral"), 900);
        return;
      }

      const g = toGlobalCoord(move.block, move.cell);
      const next = cells.map((r) => [...r]);
      next[g.row][g.col] = currentPlayer;

      setCells(next);
      setPreviousMove(move);
      setExpression("happy");
      setTimeout(advance, 450);
    }
  };

  const value: any = {
    currentPlayer,
    cells,
    previousMove,
    smallWinners,
    winner: undefined,
    makeMove,

    joinGame: async () => {},
    flash,
    shake,
    error: null,
    setError: () => {},
    triggerFlash,
    triggerShake,

    gameId: undefined,
    isOnline: false,
    mode: "tutorial",
    status: "active",
    players: {
      xName: "You",
      oName: "Kai",
    },
    moves: [],
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
