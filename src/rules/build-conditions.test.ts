import type { EntConfig } from '../types/config';
import type { Where } from '../types/repo';
import { buildConditions } from './build-conditions';
import type { Conditions } from './build-expression';
import { entNameAttrName } from './id';

describe(buildConditions.name, () => {
  const entName = 'Ent';
  const ent = {
    propS: { type: 'S' },
    propN: { type: 'N' },
    propBOOL: { type: 'BOOL' },
    propB: { type: 'B' },
    propSS: { type: 'SS' },
    propNS: { type: 'NS' },
    propBS: { type: 'BS' },
    propL: { type: 'L', items: { type: 'S' } },
    propM: {
      type: 'M',
      props: {
        propsMPropsS: { type: 'S' },
        propsMPropsN: { type: 'N' },
      },
    },
  } satisfies EntConfig;
  type E = typeof ent;

  describe('filters', () => {
    test('eq', () => {
      const where: Where<E> = {
        propS: { eq: 'propS_eq' },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propS',
              operator: '=',
              value: { S: 'propS_eq' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('ne', () => {
      const where: Where<E> = {
        propS: { ne: 'propS_ne' },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propS',
              operator: '<>',
              value: { S: 'propS_ne' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('beginsWith', () => {
      const where: Where<E> = {
        propS: { beginsWith: 'propS_beginsWith' },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propS',
              operator: 'begins_with',
              value: { S: 'propS_beginsWith' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('contains', () => {
      const where: Where<E> = {
        propS: { contains: 'propS_contains' },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propS',
              operator: 'contains',
              value: { S: 'propS_contains' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('gt', () => {
      const where: Where<E> = {
        propN: { gt: 1 },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: '>',
              value: { N: '1' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('gte', () => {
      const where: Where<E> = {
        propN: { gte: 1 },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: '>=',
              value: { N: '1' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('lt', () => {
      const where: Where<E> = {
        propN: { lt: 1 },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: '<',
              value: { N: '1' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('lte', () => {
      const where: Where<E> = {
        propN: { lte: 1 },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: '<=',
              value: { N: '1' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
    test('between', () => {
      const where: Where<E> = {
        propN: { between: [1, 2] },
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: 'between',
              valueFrom: { N: '1' },
              valueTo: { N: '2' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
  });

  describe('logical operators', () => {
    test('AND', () => {
      const where: Where<E> = {
        AND: [{ propS: { eq: 'propS_eq' } }, { propN: { gt: 1 } }],
      };
      const actual = buildConditions(entName, ent, where);
      const want: Conditions = {
        and: [
          {
            condition: {
              name: entNameAttrName,
              operator: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              name: 'Ent_propS',
              operator: '=',
              value: { S: 'propS_eq' },
            },
          },
          {
            condition: {
              name: 'Ent_propN',
              operator: '>',
              value: { N: '1' },
            },
          },
        ],
      };
      expect(actual).toEqual(want);
    });
  });
});
