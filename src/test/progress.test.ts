import { describe, it, expect } from 'vitest';

function calculateReadingProgress(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
  return Math.round((safeCurrent / totalPages) * 100);
}

describe('calculateReadingProgress', () => {
  it('should calculate 0% or start page progress correctly', () => {
    expect(calculateReadingProgress(1, 10)).toBe(10);
  });

  it('should calculate 50% midpoint progress correctly', () => {
    expect(calculateReadingProgress(5, 10)).toBe(50);
  });

  it('should calculate 100% completed progress correctly', () => {
    expect(calculateReadingProgress(10, 10)).toBe(100);
  });

  it('should clamp page numbers outside bounds', () => {
    expect(calculateReadingProgress(15, 10)).toBe(100);
    expect(calculateReadingProgress(-2, 10)).toBe(10);
  });
});
