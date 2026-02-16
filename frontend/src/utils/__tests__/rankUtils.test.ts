import { describe, it, expect } from 'vitest';
import {
  getRankIndex,
  getRankBaseName,
  getRankColor,
  getRankTextColor,
  getNextRank,
  getLpThreshold,
  RANKS_ORDER
} from '../rankUtils';

describe('rankUtils', () => {
  describe('getRankIndex', () => {
    it('should return -1 for Unranked', () => {
      expect(getRankIndex('Unranked')).toBe(-1);
    });

    it('should return correct index for valid ranks', () => {
      expect(getRankIndex('Bronze 1')).toBe(0);
      expect(getRankIndex('Master')).toBe(RANKS_ORDER.length - 1);
    });

    it('should return -1 for invalid rank', () => {
      expect(getRankIndex('Invalid Rank')).toBe(-1);
    });
  });

  describe('getRankBaseName', () => {
    it('should return correct base name', () => {
      expect(getRankBaseName('Bronze 1')).toBe('Bronze');
      expect(getRankBaseName('Silver 2')).toBe('Silver');
      expect(getRankBaseName('Gold 3')).toBe('Gold');
      expect(getRankBaseName('Master')).toBe('Master');
    });

    it('should return Unranked for Unranked or unknown', () => {
      expect(getRankBaseName('Unranked')).toBe('Unranked');
      expect(getRankBaseName('Plastic 4')).toBe('Unranked');
    });
  });

  describe('getRankColor', () => {
    it('should return correct Tailwind background color class', () => {
      expect(getRankColor('Bronze 1')).toBe('bg-amber-700');
      expect(getRankColor('Silver 3')).toBe('bg-slate-400');
      expect(getRankColor('Gold 2')).toBe('bg-yellow-500');
      expect(getRankColor('Master')).toBe('bg-purple-600');
    });

    it('should return Unranked color for Unranked', () => {
      expect(getRankColor('Unranked')).toBe('bg-slate-500');
    });
  });

  describe('getRankTextColor', () => {
    it('should return correct Tailwind text color class', () => {
      expect(getRankTextColor('Bronze 1')).toBe('text-amber-700');
      expect(getRankTextColor('Silver 3')).toBe('text-slate-500');
      expect(getRankTextColor('Gold 2')).toBe('text-yellow-600');
      expect(getRankTextColor('Master')).toBe('text-purple-600');
    });

    it('should return Unranked color for Unranked', () => {
      expect(getRankTextColor('Unranked')).toBe('text-slate-500');
    });
  });

  describe('getNextRank', () => {
    it('should return Bronze 1 for Unranked', () => {
      expect(getNextRank('Unranked')).toBe('Bronze 1');
    });

    it('should return next rank in sequence', () => {
      expect(getNextRank('Bronze 1')).toBe('Bronze 2');
      expect(getNextRank('Bronze 3')).toBe('Silver 1');
    });

    it('should return null for Master (last rank)', () => {
      expect(getNextRank('Master')).toBeNull();
    });

    it('should return null for invalid rank', () => {
      expect(getNextRank('Invalid')).toBeNull();
    });
  });

  describe('getLpThreshold', () => {
    it('should return 0 for Unranked', () => {
      expect(getLpThreshold('Unranked')).toBe(0);
    });

    it('should return correct threshold based on index', () => {
      // Bronze 1 is index 0 -> 0 LP
      expect(getLpThreshold('Bronze 1')).toBe(0);
      // Bronze 2 is index 1 -> 100 LP
      expect(getLpThreshold('Bronze 2')).toBe(100);
      // Silver 1 (should be index 3) -> 300 LP
      expect(getLpThreshold('Silver 1')).toBe(300);
    });
    
    it('should return 0 for invalid rank', () => {
        expect(getLpThreshold('Invalid')).toBe(0);
    });
  });
});
