import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { Move } from "../models/Move";
import { isMoveValid, isFull } from "../rules/gameRule";
import { toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";
import { getAuthToken } from "../hooks/useAuth";
import { getGame } from "../api/game";

type Player = "X" | "O";

interface GameContextType {
  currentPlayer: Player;
  cells: (string | null)[][];
  previousMove: Move | undefined;
  smallWinners: (string | undefined)[][];
  winner: string | undefined;

  makeMove: (move: Move) => void;

  flash: boolean;
  shake: boolean;
  triggerFlash: () => void;
  triggerShake: () => void;

  gameId?: string;
  isOnline: boolean;
  status: string;
  players: { x?: string | number | null; o?: string | number | null };
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

export function GameProvider({ children, gameId }: { children: ReactNode; gameId?: string }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [cells, setCells] = useState<(string | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );

  const [previousMove, setPreviousMove] = useState<Move | undefined>(undefined);
  const [smallWinners, setSmallWinners] = useState<(string | undefined)[][]>(
    Array(3).fill(undefined).map(() => Array(3).fill(undefined))
  );
  const [winner, setWinner] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string>("local");
  const [players, setPlayers] = useState<{ x?: string | number | null; o?: string | number | null }>({});

  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  // WebSocket ref
  const ws = useRef<WebSocket | null>(null);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  // 1. Initial Fetch if Online
  useEffect(() => {
    if (gameId) {
      getGame(gameId).then((g) => {
          // Sync state from server game object
          // Note: Server has different structure (flat moves list).
          // We need to replay moves or trust server state?
          // Server endpoint returns `moves` list. We can replay them or just use them to build state.
          // Simplest is to just set mode to online and wait for WS to sync?
          // Actually, WS might not send full state on connect.
          // For now, let's just use it to check status.
          setStatus(g.status);
          // Assuming API returns player_x and player_o as IDs or objects. 
          // Serializer returns user ID (check serializer).
          // Serializer default ModelSerializer uses PK (id) for FK unless nested.
          setPlayers({ x: g.player_x, o: g.player_o });
      }).catch(console.error);
    }
  }, [gameId]);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!gameId) return;

    const token = getAuthToken();
    const wsUrl = `ws://localhost:8000/ws/game/${gameId}/${token ? `?token=${token}` : ""}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WS Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_move") {
        const moveData = data.move; 
        // Server sends: { player: 'X', cell: 0-8, subcell: 0-8, move_no: 1 }
        // We need to convert to our coordinates
        const blockRow = Math.floor(moveData.cell / 3);
        const blockCol = moveData.cell % 3;
        const cellRow = Math.floor(moveData.subcell / 3);
        const cellCol = moveData.subcell % 3;

        const move: Move = {
          block: { row: blockRow, col: blockCol },
          cell: { row: cellRow, col: cellCol },
        };
        
        // Update local state (trusting server logic)
        applyMoveLocally(move, moveData.player as Player);
      } else if (data.type === "game_started") {
          setStatus("active");
          setPlayers(prev => ({ ...prev, o: parseInt(data.player_o) || data.player_o })); 
      } else if (data.type === "error") {
          console.error("WS Error:", data.message);
          triggerShake();
          triggerFlash();
      }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [gameId]);

  const applyMoveLocally = (move: Move, player: Player) => {
    const global = toGlobalCoord(move.block, move.cell);
    
    setCells((prev) => {
        const newCells = prev.map((r) => [...r]);
        newCells[global.row][global.col] = player;
        
        // Check small winner (OPTIMIZATION: could be done better)
        const smallWinner = getSmallTableWinner(newCells, move.block);
         if (smallWinner) {
             setSmallWinners((prevSw) => {
                 const newSw = prevSw.map(r => [...r]);
                 if (!newSw[move.block.row][move.block.col]) {
                     newSw[move.block.row][move.block.col] = smallWinner;
                     // Check big winner
                     const bigWinner = getWinner(newSw);
                     if (bigWinner) setWinner(bigWinner);
                     return newSw;
                 }
                 return prevSw;
             });
         }
        return newCells;
    });

    setPreviousMove(move);
    setCurrentPlayer(player === "X" ? "O" : "X");
  };

  const makeMove = (move: Move) => {
    if (winner) return;

    // 1. Validate locally first (for UX)
    try {
      isMoveValid(cells, move, previousMove);
    } catch (err) {
      triggerFlash();
      triggerShake();
      return;
    }

    if (gameId && ws.current) {
        // Online Mode: Send to Server
        // Convert to server coords
        // Block (0-8) = row*3 + col
        const cellIdx = move.block.row * 3 + move.block.col;
        const subcellIdx = move.cell.row * 3 + move.cell.col;

        ws.current.send(JSON.stringify({
            action: "move",
            cell: cellIdx,
            subcell: subcellIdx
        }));
    } else {
        // Offline Mode: Apply locally
        applyMoveLocally(move, currentPlayer);
    }
  };

  return (
    <GameContext.Provider
      value={{
        currentPlayer,
        cells,
        previousMove,
        smallWinners,
        winner,
        makeMove, // Exposed function
        flash,
        shake,
        triggerFlash,
        triggerShake,
        gameId,
        isOnline: !!gameId,
        status,
        players
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
