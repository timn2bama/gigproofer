import { describe, it, expect } from 'vitest';
import { calculateTotalIncome, projectAnnualIncome, groupIncomeByPlatform } from './income';
import { IncomeRecord } from './types';

describe('income utils', () => {
  const mockRecords: IncomeRecord[] = [
    {
      userId: 'user1',
      date: new Date('2026-01-01'),
      amount: 100,
      platform: 'Uber',
    },
    {
      userId: 'user1',
      date: new Date('2026-01-15'),
      amount: 200,
      platform: 'DoorDash',
    },
    {
      userId: 'user1',
      date: new Date('2026-01-31'),
      amount: 300,
      platform: 'Uber',
    },
  ];

  describe('calculateTotalIncome', () => {
    it('should sum all income records', () => {
      expect(calculateTotalIncome(mockRecords)).toBe(600);
    });

    it('should return 0 for empty records', () => {
      expect(calculateTotalIncome([])).toBe(0);
    });
  });

  describe('groupIncomeByPlatform', () => {
    it('should group income correctly', () => {
      const grouped = groupIncomeByPlatform(mockRecords);
      expect(grouped['Uber']).toBe(400);
      expect(grouped['DoorDash']).toBe(200);
    });
  });

  describe('projectAnnualIncome', () => {
    it('should project annual income based on 30 days of data', () => {
      // 600 earned over 30 days = 20/day
      // 20 * 365 = 7300
      const projected = projectAnnualIncome(mockRecords);
      expect(projected).toBeCloseTo(7300);
    });

    it('should return 0 for no records', () => {
      expect(projectAnnualIncome([])).toBe(0);
    });
  });
});
