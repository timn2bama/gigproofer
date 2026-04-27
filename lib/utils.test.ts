import { describe, it, expect } from 'vitest';
import { cn, formatDuration } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      const result = cn('bg-red-500', 'text-white', { 'opacity-50': true });
      expect(result).toContain('bg-red-500');
      expect(result).toContain('text-white');
      expect(result).toContain('opacity-50');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes to hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(0)).toBe('0m');
    });
  });
});
