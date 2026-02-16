export interface MatchHistoryItem {
  id: number;
  opponent: string;
  opponent_username?: string;
  result: "WIN" | "LOSS" | "DRAW";
  date: string;
  lp_change?: number;
  xp_gained?: number;
  mode: "ranked" | "unranked" | "local" | "ai" | "custom";
}

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  history: MatchHistoryItem[];
  profile?: {
      level: number;
      current_xp: number;
      next_level_xp: number;
      mmr: number | null;
      placement_games_played: number;
      total_lp: number;
      rank: string;
      lp_in_division: number;
      avatar_config?: any;
      gender?: 'M' | 'F';
      demotion_shield: number;
      current_streak: number;
  };
}
