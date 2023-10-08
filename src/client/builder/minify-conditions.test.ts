import type { Condition } from './build-expression';
import { minifyConditions } from './minify-conditions';

describe(minifyConditions.name, () => {
  const condition: Condition = {
    attrName: 'attrName',
    opr: '=',
    value: { S: 'value' },
  };

  test('no effect to condition', () => {
    expect(minifyConditions({ condition })).toEqual({ condition });
  });
  test('no effect to multi and', () => {
    expect(minifyConditions({ and: [{ condition }, { condition }] })).toEqual({ and: [{ condition }, { condition }] });
  });
  test('no effect to multi or', () => {
    expect(minifyConditions({ or: [{ condition }, { condition }] })).toEqual({ or: [{ condition }, { condition }] });
  });
  test('no effect to valid not', () => {
    expect(minifyConditions({ not: { condition } })).toEqual({ not: { condition } });
  });

  test('removes empty and', () => {
    expect(minifyConditions({ and: [] })).toBeUndefined();
  });
  test('removes empty or', () => {
    expect(minifyConditions({ or: [] })).toBeUndefined();
  });
  test('removes empty not', () => {
    expect(minifyConditions({ not: { and: [] } })).toBeUndefined();
  });

  test('shallow single and', () => {
    expect(minifyConditions({ and: [{ condition }] })).toEqual({ condition });
  });
  test('shallow single or', () => {
    expect(minifyConditions({ or: [{ condition }] })).toEqual({ condition });
  });

  test('removes empty and in and', () => {
    expect(minifyConditions({ and: [{ condition }, { and: [] }] })).toEqual({ condition });
  });
  test('removes empty or in and', () => {
    expect(minifyConditions({ and: [{ condition }, { or: [] }] })).toEqual({ condition });
  });
});
