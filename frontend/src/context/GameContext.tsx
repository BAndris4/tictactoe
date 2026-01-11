import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import type { Move } from "../models/Move";
import { isMoveValid } from "../rules/gameRule";
import { toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";
import { getAuthToken, useAuth } from "../hooks/useAuth";
import { getGame } from "../api/game";
import { useToast } from "./ToastContext";

type Player = "X" | "O";

interface GameContextType {
  currentPlayer: Player;
  cells: (string | null)[][];
  previousMove: Move | undefined;
  smallWinners: (string | undefined)[][];
  winner: string | undefined;

  makeMove: (move: Move) => void;
  joinGame: () => Promise<void>;

  flash: boolean;
  shake: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  triggerFlash: () => void;
  triggerShake: () => void;

  gameId?: string;
  isOnline: boolean;
  mode: string;
  status: string;
  players: { 
    x?: string | number | null; 
    o?: string | number | null;
    xName?: string | null;
    oName?: string | null;
  };
  // Matchmaking
  moves: any[];
  xpResults: any | null;

  isSearching: boolean;
  isSearchMinimized: boolean;
  searchStartTime: number | null;
  searchMode: 'unranked' | 'ranked';
  startSearch: (mode?: 'unranked' | 'ranked') => void;
  cancelSearch: () => void;
  minimizeSearch: (minimized: boolean) => void;

  matchFoundData: { gameId: string; opponent: string; opponentUsername?: string } | null;
  opponentStatus: 'active' | 'away';
  updatePlayerStatus: (status: 'active' | 'away') => void;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

export function GameProvider({ children, gameId }: { children: ReactNode; gameId?: string }) {
  const { showToast } = useToast();
  
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
  const [mode, setMode] = useState<string>("local");
  const [players, setPlayers] = useState<{ 
    x?: string | number | null; 
    o?: string | number | null;
    xName?: string | null;
    oName?: string | null;
  }>({});
  const [moves, setMoves] = useState<any[]>([]);
  const [xpResults, setXpResults] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  // Matchmaking State
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMinimized, setIsSearchMinimized] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchMode, setSearchMode] = useState<'unranked' | 'ranked'>('unranked');
  const [matchmakingSocket, setMatchmakingSocket] = useState<WebSocket | null>(null);
  
  // Match Found State for Modal
  const [matchFoundData, setMatchFoundData] = useState<{ gameId: string; opponent: string; opponentUsername?: string } | null>(null);
  
  const [opponentStatus, setOpponentStatus] = useState<'active' | 'away'>('active');
  
  const { user } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Matchmaking Effect
  useEffect(() => {
     if (isSearching && !matchmakingSocket) {
         const token = getAuthToken();
         const wsUrl = `ws://localhost:8000/ws/matchmaking/${token ? `?token=${token}` : ""}`;
         const ws = new WebSocket(wsUrl);
         
         ws.onopen = () => {
             console.log("Matchmaking connected");
             ws.send(JSON.stringify({ action: "search", mode: searchMode }));
         };
         
         ws.onmessage = (event) => {
             const data = JSON.parse(event.data);
             if (data.status === "match_found") {
                 console.log("Match found!", data);
                 setIsSearching(false);
                 setMatchmakingSocket(null);
                 ws.close();
                 
                 // Show Modal first, do NOT navigate yet
                 setMatchFoundData({
                     gameId: data.game_id,
                     opponent: data.opponent,
                     opponentUsername: data.opponent_username
                 });
             }
         };
         
         ws.onclose = () => {
             console.log("Matchmaking disconnected");
         }

         setMatchmakingSocket(ws);
     }
  }, [isSearching]);

  const startSearch = (mode: 'unranked' | 'ranked' = 'unranked') => {
      setSearchMode(mode);
      setIsSearching(true);
      setSearchStartTime(Date.now());
      setIsSearchMinimized(false);
      setMatchFoundData(null); // Clear previous match data
      setXpResults(null);      // Clear previous game results
  };

  const cancelSearch = () => {
      setIsSearching(false);
      setSearchStartTime(null);
      if (matchmakingSocket) {
          matchmakingSocket.send(JSON.stringify({ action: "cancel" }));
          matchmakingSocket.close();
          setMatchmakingSocket(null);
      }
  };

  const minimizeSearch = (minimized: boolean) => {
      setIsSearchMinimized(minimized);
  };

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
          setStatus(g.status);
          setMode(g.mode);
          setPlayers({ 
            x: g.player_x, 
            o: g.player_o,
            xName: g.player_x_name,
            oName: g.player_o_name
          });
          
          if (g.moves && g.moves.length > 0) {
              setMoves(g.moves);
              // Reconstruction of state
              g.moves.forEach((m: any) => {
                  const blockRow = Math.floor(m.cell / 3);
                  const blockCol = m.cell % 3;
                  const cellRow = Math.floor(m.subcell / 3);
                  const cellCol = m.subcell % 3;
                  
                  const move: Move = {
                      block: { row: blockRow, col: blockCol },
                      cell: { row: cellRow, col: cellCol },
                  };
                  applyMoveLocally(move, m.player as Player);
              });
          }
      }).catch(console.error);
    }
    setXpResults(null);
  }, [gameId]);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!gameId) return;

    const token = getAuthToken();
    const wsUrl = `ws://localhost:8000/ws/game/${gameId}/${token ? `?token=${token}` : ""}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WS Connected");
      socket.send(JSON.stringify({
          action: 'status_update',
          status: 'active'
      }));
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
        
        setMoves(prev => {
            if (prev.some(m => m.move_no === moveData.move_no)) {
                return prev;
            }
            return [...prev, moveData];
        });
        
        // Update local state (trusting server logic)
        // Note: In local game mode, makeMove() already called applyMoveLocally().
        // Calling it again is idempotent for 'cells' and 'currentPlayer' toggling (if data matches).
        // However, to be cleaner, we could avoid it if duplicate, but setMoves check handles the data.
        applyMoveLocally(move, moveData.player as Player);

      } else if (data.type === "game_started") {
          console.log("[GameContext] game_started received:", data);
          setStatus("active");
          if (data.mode) {
              setMode(data.mode);
          }
          setPlayers(prev => ({ 
            ...prev, 
            x: data.player_x_id || data.player_x,
            o: data.player_o_id || data.player_o, // Handle ID if sent
            xName: data.player_x_name || data.player_x,
            oName: data.player_o_name || data.player_o // fallback if only username
          })); 
      } else if (data.type === "game_over") {
          setStatus("finished");
          if (data.mode) {
              setMode(data.mode);
          }
          if (data.data && data.data.winner) {
              setWinner(data.data.winner);
          } else if (data.winner) {
              setWinner(data.winner);
          }

          // Build a unified results object collecting all IDs from different source fields
          const results: Record<string, any> = {};
          
          // Helper to safely merge by string ID from any source object
          const mergeSource = (source: any, fieldName?: string) => {
              if (!source || typeof source !== 'object') return;
              Object.entries(source).forEach(([uid, val]) => {
                  const sUid = String(uid);
                  if (!results[sUid]) results[sUid] = {};
                  if (fieldName) {
                      results[sUid][fieldName] = val;
                  } else if (val && typeof val === 'object') {
                      // Leveling results are an object itself (xp_gained, new_level, etc.)
                      results[sUid] = { ...results[sUid], ...val };
                  }
              });
          };

          mergeSource(data.xp_results); 
          mergeSource(data.mmr_results, 'mmr_change');
          mergeSource(data.lp_results, 'lp_change');
          mergeSource(data.ranks, 'rank_info');

          if (Object.keys(results).length > 0) {
              setXpResults(results);
          }
      } else if (data.type === "game_invitation_rejected") {
          showToast(`${data.user} declined your invitation.`, "warning");
          triggerShake();
          triggerShake();
          triggerFlash();
      } else if (data.type === "player_status") {
          
          const senderId = Number(data.sender);
          
          let myId: number | undefined;
          if (currentPlayer === 'X') myId = Number(players.x);
          else if (currentPlayer === 'O') myId = Number(players.o);
          
          if (myId && senderId === myId) {
              return;
          }
          
          setOpponentStatus(data.status);
      }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [gameId]);

  const join = async () => {
    if (!gameId) return;
    try {
      setError(null);
      const token = getAuthToken();
      console.log("Join attempt - Has token?", !!token);
      if (!token) {
        setError("You must be logged in to join a game");
        return;
      }
      const { joinGame: apiJoinGame } = await import("../api/game");
      console.log("Calling joinGame API for gameId:", gameId);
      const g = await apiJoinGame(gameId);
      console.log("Join successful:", g);
      setStatus(g.status);
      setMode(g.mode);
      setPlayers({ 
        x: g.player_x, 
        o: g.player_o,
        xName: g.player_x_name,
        oName: g.player_o_name
      });
    } catch (err: any) {
      console.error("Join failed:", err);
      setError(err.message || "Failed to join game");
    }
  };

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

    // Client-side draw detection: if board is full (81 cells) and no winner
    setCells((currentCells) => {
        const isFull = currentCells.every(row => row.every(cell => cell !== null));
        if (isFull) {
            setWinner(prev => prev || "D");
            setStatus(prev => (prev === "active" ? "finished" : prev));
        }
        return currentCells;
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

    if (gameId && ws.current && mode !== 'local') {
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
        // Offline or Local Mode: Apply locally
        applyMoveLocally(move, currentPlayer);

        // Add to history locally so it shows up immediately
        const cellIdx = move.block.row * 3 + move.block.col;
        const subcellIdx = move.cell.row * 3 + move.cell.col;
        const newMove = {
            move_no: moves.length + 1,
            player: currentPlayer,
            cell: cellIdx,
            subcell: subcellIdx,
            created_at: new Date().toISOString()
        };
        setMoves(prev => [...prev, newMove]);
        
        // Local games DO have a backend component. We want to persist the move.
        // So for local games, we should probably do BOTH: update locally immediately AND send to backend.
        
        if (gameId && ws.current && mode === 'local') {
             // Sync with backend for persistence, but don't wait for it
             const cIdx = move.block.row * 3 + move.block.col;
             const sIdx = move.cell.row * 3 + move.cell.col;
             ws.current.send(JSON.stringify({
                action: "move",
                cell: cIdx,
                subcell: sIdx
            }));
        }
    }
  };

  const updatePlayerStatus = (status: 'active' | 'away') => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
              action: 'status_update',
              status: status
          }));
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
        makeMove,
        joinGame: join,
        flash,
        shake,
        triggerFlash,
        triggerShake,
        gameId,
        isOnline: !!gameId,
        mode,
        status,
        players,
        moves,
        xpResults,
        error,
        setError,
        isSearching,
        isSearchMinimized,
        searchStartTime,
        searchMode,
        startSearch,
        cancelSearch,
        minimizeSearch,
        matchFoundData,
        opponentStatus,
        updatePlayerStatus,
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
