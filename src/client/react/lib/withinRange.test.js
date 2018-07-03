import withinRange from './withinRange';

describe('withinRange', () => {
  describe('the number is within range', () => {
    it('just returns the number', () => {
      expect(withinRange(5, 7)).toEqual(5);
    });
  });

  describe('the number is outside the range', () => {
    it('wraps the number until within range', () => {
      expect(withinRange(-1, 6)).toEqual(6);
      expect(withinRange(7, 6)).toEqual(0);
      expect(withinRange(-20, 6)).toEqual(1);
      expect(withinRange(20, 6)).toEqual(6);
    });
  });
});
