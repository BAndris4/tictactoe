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

export const mockUser: UserProfile = {
  id: 1,
  username: "PixelWarrior",
  firstName: "Andris",
  lastName: "Kovacs",
  email: "andris@example.com",
  phoneNumber: "+36 30 123 4567",
  history: [
    {
      id: 1,
      opponent: "SpeedDemon",
      result: "WIN",
      date: "2h ago",
      lp_change: 25,
      mode: "ranked"
    },
    {
      id: 2,
      opponent: "TactixMaster",
      result: "LOSS",
      date: "5h ago",
      lp_change: -18,
      mode: "ranked"
    },
    {
      id: 3,
      opponent: "NoobSlayer",
      result: "WIN",
      date: "1d ago",
      lp_change: 22,
      mode: "ranked"
    },
    {
      id: 4,
      opponent: "DrawKing",
      result: "DRAW",
      date: "2d ago",
      lp_change: 5,
      mode: "unranked"
    },
  ],
  profile: {
      level: 5,
      current_xp: 450,
      next_level_xp: 1000,
      mmr: 1000,
      placement_games_played: 10,
      total_lp: 235,
      rank: "Bronze 3",
      lp_in_division: 35,
      demotion_shield: 0,
      current_streak: 0
  }
};
