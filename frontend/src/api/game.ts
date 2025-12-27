import { getAuthToken } from "../hooks/useAuth";

const API_URL = "http://localhost:8000/api"; // Should be env var in prod

export interface Game {
  id: string;
  mode: 'local' | 'online' | 'ai';
  status: 'waiting' | 'active' | 'finished' | 'aborted';
  player_x: string; // ID or username? Serializer returns ID usually, check serializer
  player_o: string | null;
  current_turn: 'X' | 'O';
  winner: string | null;
  move_count: number;
}

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export const createGame = async (mode: 'local' | 'online' = 'online'): Promise<Game> => {
  const response = await fetch(`${API_URL}/games/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ mode }), // Backend sets mode? CreateGameSerializer only looked at empty create but I should update backend to accept mode if I want to distinguishing. 
    // Wait, backend CreateGameView sets mode=GameMode.LOCAL hardcoded? 
    // Creating separate endpoints or update serializer. I need to check backend view.
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
};

export const joinGame = async (gameId: string): Promise<Game> => {
   const response = await fetch(`${API_URL}/games/join`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ game_id: gameId }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || err.detail || "Failed to join game");
  }

  return response.json();
};

export const getGame = async (gameId: string): Promise<Game> => {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game");
  }

  return response.json();
};
