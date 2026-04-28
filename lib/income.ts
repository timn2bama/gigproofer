import { IncomeRecord } from './types';

/**
 * Calculates total income from a set of records
 */
export function calculateTotalIncome(records: IncomeRecord[]): number {
  return records.reduce((sum, record) => sum + record.amount, 0);
}

/**
 * Projects annual income based on existing records
 * If data spans less than a year, it extrapolates.
 */
export function projectAnnualIncome(records: IncomeRecord[]): number {
  if (records.length === 0) return 0;

  const dates = records.map(r => new Date(r.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  // Calculate duration in days (at least 1 day to avoid division by zero)
  const durationInDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const totalIncome = calculateTotalIncome(records);
  
  // Income per day * 365 days
  return (totalIncome / durationInDays) * 365;
}

/**
 * Groups income by platform
 */
export function groupIncomeByPlatform(records: IncomeRecord[]): Record<string, number> {
  return records.reduce((acc, record) => {
    acc[record.platform] = (acc[record.platform] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);
}
