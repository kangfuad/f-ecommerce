import {
  addDays,
  calculateDaysBetween,
  extractInitials,
  formatDateToYMD,
  slugify,
} from './helpers.util';

describe('Helpers Utility Functions', () => {
  describe('extractInitials', () => {
    it('should extract initials for single name', () => {
      expect(extractInitials('Auri')).toBe('AU');
    });

    it('should extract initials for multi-word name', () => {
      expect(extractInitials('Auri Fuad')).toBe('AF');
      expect(extractInitials('Budi Santoso Pratama')).toBe('BP');
    });

    it('should handle empty name gracefully', () => {
      expect(extractInitials('')).toBe('EP');
    });
  });

  describe('slugify', () => {
    it('should convert strings to URL-friendly slugs', () => {
      expect(slugify('Sony FX3 Cinema Line Camera')).toBe('sony-fx3-cinema-line-camera');
      expect(slugify('DJI Mavic 3 Pro (Cine Combo!)')).toBe('dji-mavic-3-pro-cine-combo');
    });
  });

  describe('date utilities', () => {
    it('should calculate days between two dates', () => {
      const days = calculateDaysBetween('2026-08-27', '2026-08-30');
      expect(days).toBe(3);
    });

    it('should add days to a date', () => {
      const start = new Date('2026-08-27');
      const extended = addDays(start, 2);
      expect(formatDateToYMD(extended)).toBe('2026-08-29');
    });
  });
});
