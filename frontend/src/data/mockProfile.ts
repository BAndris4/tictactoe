export interface MatchHistoryItem {
  id: number;
  opponent: string;
  result: "WIN" | "LOSS" | "DRAW";
  date: string;
  lpChange: number;
  mode?: "Ranked" | "Unranked" | "Local";
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
      lpChange: 25,
    },
    {
      id: 2,
      opponent: "TactixMaster",
      result: "LOSS",
      date: "5h ago",
      lpChange: -18,
    },
    {
      id: 3,
      opponent: "NoobSlayer",
      result: "WIN",
      date: "1d ago",
      lpChange: 22,
    },
    {
      id: 4,
      opponent: "DrawKing",
      result: "DRAW",
      date: "2d ago",
      lpChange: 5,
    },
  ],
};
