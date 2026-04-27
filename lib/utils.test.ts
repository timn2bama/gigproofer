import { describe, it, expect } from 'vitest';
import { cn, formatDuration } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      const result = cn('bg-red-500', 'text-white', { 'bg-blue-500': true });
      expect(result).toContain('bg-blue-500');
      expect(result).not.toContain('bg-red-500'); // Assuming tailwind-merge resolves conflicting bg colors
      expect(result).toContain('text-white');
    });

    it('should handle undefined and null values', () => {
      const result = cn('flex', undefined, null, 'items-center');
      expect(result).toBe('flex items-center');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to HH:MM:SS', () => {
      expect(formatDuration(0)).toBe('00:00:00');
      expect(formatDuration(61)).toBe('00:01:01');
      expect(formatDuration(3600)).toBe('01:00:00');
      expect(formatDuration(3665)).toBe('01:01:05');
    });
  });
});
