import { describe, expect, test } from 'vitest';
import { extractYellowValue, YELLOW_SRC_PROTOCOL } from '@/org.libersoft.messages/utils/yellowUtils.ts';

describe('extractYellowValue', () => {
  test('should extract value', () => {
    expect(extractYellowValue(`${YELLOW_SRC_PROTOCOL}1234`)).toBe('1234');
    expect(extractYellowValue(`${YELLOW_SRC_PROTOCOL}string`)).toBe('string');
  });

  test('should return null', () => {
    expect(extractYellowValue(`1234${YELLOW_SRC_PROTOCOL}1234`)).toBe(null);
    expect(extractYellowValue(`1234`)).toBe(null);
    expect(extractYellowValue(``)).toBe(null);
  });

  test('not expected values should return null', () => {
    // @ts-ignore
    expect(extractYellowValue(undefined)).toBe(null);
    // @ts-ignore
    expect(extractYellowValue(null)).toBe(null);
    // @ts-ignore

    expect(extractYellowValue(123)).toBe(null);
    // @ts-ignore
    expect(extractYellowValue(NaN)).toBe(null);
    // @ts-ignore
    expect(extractYellowValue(() => {})).toBe(null);
    // @ts-ignore
    expect(extractYellowValue({})).toBe(null);
    // @ts-ignore
    expect(extractYellowValue([])).toBe(null);
  });
});
