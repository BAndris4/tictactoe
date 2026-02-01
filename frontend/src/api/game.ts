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
  mode: 'local' | 'custom' | 'ai' | 'ranked' | 'unranked' | 'bot_easy' | 'bot_medium';
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
  player_x_xp_gained?: number;
  player_o_xp_gained?: number;
  player_x_lp_change?: number;
  player_o_lp_change?: number;
  player_x_avatar?: any;
  player_o_avatar?: any;
  chat_messages?: any[];
}

export const createGame = async (payload: string | { mode: string; [key: string]: any }): Promise<Game> => {
  const data = typeof payload === 'string' ? { mode: payload } : payload;
  
  const response = await fetch(`${API_URL}/games/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
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
export interface GameInvitation {
  id: number;
  game: string;
  from_user: number;
  from_user_name: string;
  from_user_avatar?: any;
  to_user: number;
  to_user_name: string;
  to_user_avatar?: any;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const inviteFriend = async (gameId: string, userId: number): Promise<GameInvitation> => {
  const response = await fetch(`${API_URL}/games/invitations/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ game: gameId, to_user: userId }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to invite friend");
  }

  return response.json();
};

export const getPendingInvitations = async (): Promise<GameInvitation[]> => {
  const response = await fetch(`${API_URL}/games/invitations/pending/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pending invitations");
  }

  return response.json();
};

export const respondToGameInvitation = async (invitationId: number, action: 'accepted' | 'rejected'): Promise<GameInvitation> => {
  const response = await fetch(`${API_URL}/games/invitations/${invitationId}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error("Failed to respond to invitation");
  }

  return response.json();
};

export const getBotStats = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/games/bot-stats/`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch bot stats");
    }

    return response.json();
};

export interface EvaluationNode {
    move_no: number;
    score: number;
}

export const getGameEvaluation = async (gameId: string): Promise<EvaluationNode[]> => {
    const response = await fetch(`${API_URL}/games/${gameId}/evaluation/`, {
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch game evaluation");
    }

    return response.json();
};
