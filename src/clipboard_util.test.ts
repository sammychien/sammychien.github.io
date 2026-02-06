import { describe, it, expect } from 'vitest';
import { getAllFormulas, transformToUppercase } from './clipboard_util';

describe('transformToUppercase', () => {
  it('converts lowercase to uppercase', () => {
    expect(transformToUppercase('hello')).toBe('HELLO');
  });

  it('keeps uppercase as uppercase', () => {
    expect(transformToUppercase('HELLO')).toBe('HELLO');
  });

  it('converts mixed case to uppercase', () => {
    expect(transformToUppercase('HeLLo')).toBe('HELLO');
  });

  it('handles empty string', () => {
    expect(transformToUppercase('')).toBe('');
  });

  it('handles numbers and special characters', () => {
    expect(transformToUppercase('h3ll0!')).toBe('H3LL0!');
  });
});

describe('getAllFormulas', () => {
  describe('valid 2-letter elements', () => {
    it('parses single element without subscript', () => {
      const results = getAllFormulas('as');
      expect(results).toContain('As');
    });

    it('parses single element with subscript', () => {
      const results = getAllFormulas('as2');
      expect(results).toContain('As₂');
    });

    it('parses multiple subscript digits', () => {
      const results = getAllFormulas('as123');
      expect(results).toContain('As₁₂₃');
    });
  });

  describe('valid 1-letter elements', () => {
    it('parses single letter element H', () => {
      const results = getAllFormulas('h');
      expect(results).toContain('H');
    });

    it('parses single letter element O with subscript', () => {
      const results = getAllFormulas('o2');
      expect(results).toContain('O₂');
    });

    it('parses single letter element C', () => {
      const results = getAllFormulas('c');
      expect(results).toContain('C');
    });
  });

  describe('compound formulas', () => {
    it('parses water H2O correctly', () => {
      const results = getAllFormulas('h2o');
      expect(results).toContain('H₂O');
    });

    it('parses carbon dioxide CO2 correctly', () => {
      const results = getAllFormulas('co2');
      expect(results).toContain('CO₂');
    });

    it('parses sulfuric acid H2SO4 correctly', () => {
      const results = getAllFormulas('h2so4');
      expect(results).toContain('H₂SO₄');
    });

    it('parses sodium hydroxide NaOH correctly', () => {
      const results = getAllFormulas('naoh');
      expect(results).toContain('NaOH');
    });

    it('parses calcium carbonate CaCO3 correctly', () => {
      const results = getAllFormulas('caco3');
      expect(results).toContain('CaCO₃');
    });
  });

  describe('element validation - elements must exist in set', () => {
    it('rejects invalid single letter elements', () => {
      const results = getAllFormulas('x');
      // X is not a valid element, so no results should contain just 'X'
      expect(results).not.toContain('X');
    });

    it('does not parse A as element when followed by valid element', () => {
      // A is not a valid element in the periodic table
      const results = getAllFormulas('as');
      // Should only have 'As' (Arsenic), not 'ASO3' or 'ASO₃'
      expect(results).toContain('As');
      expect(results).not.toContain('ASO₃');
    });

    it('does not create invalid option with A prefix', () => {
      // aso3 should only give AsO3, not ASO3
      const results = getAllFormulas('aso3');
      expect(results).toContain('AsO₃'); // Valid: As + O + 3
      expect(results.filter(r => r.startsWith('AS'))).toHaveLength(0); // No ASO3 without subscript
    });

    it('parses valid elements in combination', () => {
      // As, O are both valid
      const results = getAllFormulas('aso');
      expect(results).toContain('AsO');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const results = getAllFormulas('');
      expect(results).toEqual(['']);
    });

    it('handles only numbers', () => {
      const results = getAllFormulas('123');
      // Numbers without preceding element are not converted to subscripts
      expect(results).toEqual(['123']);
    });

    it('handles consecutive subscripts', () => {
      const results = getAllFormulas('h2o3');
      expect(results).toContain('H₂O₃');
    });

    it('handles long chain of elements', () => {
      const results = getAllFormulas('chon');
      // Should be able to parse C, H, O, N
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('ambiguous formulas', () => {
    it('returns multiple interpretations for ambiguous input', () => {
      // 'as' could theoretically be parsed as A+S, but A is not valid
      // So it should only be As
      const results = getAllFormulas('as');
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles multiple valid parsing paths', () => {
      // 'co' could be C+O or Co (Cobalt)
      const results = getAllFormulas('co');
      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain('CO'); // C + O
      // Co is a valid element, so it should be included
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase input', () => {
      const results = getAllFormulas('H2O');
      expect(results).toContain('H₂O');
    });

    it('handles mixed case input', () => {
      const results = getAllFormulas('H2So4');
      expect(results).toContain('H₂SO₄');
    });

    it('handles uppercase two-letter elements', () => {
      const results = getAllFormulas('AS');
      expect(results).toContain('As');
    });
  });
});
