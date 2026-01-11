import b1 from "../assets/ranks/b1.svg";
import b2 from "../assets/ranks/b2.svg";
import b3 from "../assets/ranks/b3.svg";
import s1 from "../assets/ranks/s1.svg";
import s2 from "../assets/ranks/s2.svg";
import s3 from "../assets/ranks/s3.svg";
import g1 from "../assets/ranks/g1.svg";
import g2 from "../assets/ranks/g2.svg";
import g3 from "../assets/ranks/g3.svg";
import m from "../assets/ranks/m.svg";
import unranked from "../assets/ranks/unranked.svg";

export const RANK_MAP: Record<string, string> = {
  "Unranked": unranked,
  "Bronze 1": b1,
  "Bronze 2": b2,
  "Bronze 3": b3,
  "Silver 1": s1,
  "Silver 2": s2,
  "Silver 3": s3,
  "Gold 1": g1,
  "Gold 2": g2,
  "Gold 3": g3,
  "Master": m,
};

export const RANKS_ORDER = [
  "Bronze 1", "Bronze 2", "Bronze 3",
  "Silver 1", "Silver 2", "Silver 3",
  "Gold 1", "Gold 2", "Gold 3",
  "Master"
];

export const RANK_COLORS: Record<string, string> = {
  "Bronze": "bg-amber-700",
  "Silver": "bg-slate-400",
  "Gold": "bg-yellow-500",
  "Master": "bg-purple-600",
  "Unranked": "bg-slate-500"
};

export function getRankColor(rankName: string): string {
    if (rankName.includes("Bronze")) return RANK_COLORS["Bronze"];
    if (rankName.includes("Silver")) return RANK_COLORS["Silver"];
    if (rankName.includes("Gold")) return RANK_COLORS["Gold"];
    if (rankName.includes("Master")) return RANK_COLORS["Master"];
    return RANK_COLORS["Unranked"];
}

export function getRankTextColor(rankName: string): string {
    if (rankName.includes("Bronze")) return "text-amber-700";
    if (rankName.includes("Silver")) return "text-slate-500";
    if (rankName.includes("Gold")) return "text-yellow-600";
    if (rankName.includes("Master")) return "text-purple-600";
    return "text-slate-500";
}

export function getRankImage(rankName: string): string {
  return RANK_MAP[rankName] || unranked;
}

export function getNextRank(currentRank: string): string | null {
  if (currentRank === "Unranked") return "Bronze 1";
  const index = RANKS_ORDER.indexOf(currentRank);
  if (index === -1 || index === RANKS_ORDER.length - 1) return null;
  return RANKS_ORDER[index + 1];
}

export function getLpThreshold(rankName: string): number {
    if (rankName === "Unranked") return 0;
    const index = RANKS_ORDER.indexOf(rankName);
    if (index === -1) return 0;
    return index * 100;
}
