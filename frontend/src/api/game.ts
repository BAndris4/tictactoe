import { API_URL, getHeaders } from "./client";

export interface GameMove {
  move_no: number;
  player: 'X' | 'O';
  cell: number;
  subcell: number;
  created_at: string;
}

export interface Game {
  id: string;
  mode: 'local' | 'custom' | 'ai';
  status: 'waiting' | 'active' | 'finished' | 'aborted';
  player_x: string | number;
  player_o: string | number | null;
  player_x_name: string;
  player_o_name: string | null;
  current_turn: 'X' | 'O';
  winner: string | null;
  move_count: number;
  moves: GameMove[];
  created_at: string;
}

export const createGame = async (mode: 'local' | 'custom' = 'custom'): Promise<Game> => {
  const response = await fetch(`${API_URL}/games/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ mode }),
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
};

export const joinGame = async (gameId: string): Promise<Game> => {
   const response = await fetch(`${API_URL}/games/join/`, {
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
  const response = await fetch(`${API_URL}/games/${gameId}/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game");
  }

  return response.json();
};

export const forfeitGame = async (gameId: string): Promise<Game> => {
  const response = await fetch(`${API_URL}/games/${gameId}/forfeit/`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to forfeit game");
  }

  return response.json();
};

export const getUserGames = async (): Promise<Game[]> => {
  const response = await fetch(`${API_URL}/games/my-games/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user games");
  }

  return response.json();
};
