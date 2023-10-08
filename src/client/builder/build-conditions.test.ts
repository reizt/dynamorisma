import { entNameAttrName } from '../../schema/id';
import type { EntConfig } from '../types/config';
import type { Where } from '../types/repo';
import { buildConditions } from './build-conditions';
import type { Conditions } from './build-expression';

describe(buildConditions.name, () => {
  describe('conditions', () => {
    const entName = 'Ent';
    const entConfig = {
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
    type E = typeof entConfig;

    describe('filters', () => {
      test('eq', () => {
        const where: Where<E> = {
          propS: { eq: 'propS_eq' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propS',
                opr: '=',
                value: { S: 'propS_eq' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('ne', () => {
        const where: Where<E> = {
          propS: { ne: 'propS_ne' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propS',
                opr: '<>',
                value: { S: 'propS_ne' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('beginsWith', () => {
        const where: Where<E> = {
          propS: { beginsWith: 'propS_beginsWith' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propS',
                opr: 'begins_with',
                value: { S: 'propS_beginsWith' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('contains', () => {
        const where: Where<E> = {
          propS: { contains: 'propS_contains' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propS',
                opr: 'contains',
                value: { S: 'propS_contains' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('gt', () => {
        const where: Where<E> = {
          propN: { gt: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propN',
                opr: '>',
                value: { N: '1' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('gte', () => {
        const where: Where<E> = {
          propN: { gte: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propN',
                opr: '>=',
                value: { N: '1' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('lt', () => {
        const where: Where<E> = {
          propN: { lt: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propN',
                opr: '<',
                value: { N: '1' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('lte', () => {
        const where: Where<E> = {
          propN: { lte: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propN',
                opr: '<=',
                value: { N: '1' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('between', () => {
        const where: Where<E> = {
          propN: { between: [1, 2] },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              condition: {
                attrName: 'Ent_propN',
                opr: 'between',
                valueFrom: { N: '1' },
                valueTo: { N: '2' },
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
    });

    describe('logical opers', () => {
      test('AND', () => {
        const where: Where<E> = {
          AND: [{ propS: { eq: 'propS_eq' } }, { propN: { gt: 1 } }],
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              and: [
                {
                  condition: {
                    attrName: 'Ent_propS',
                    opr: '=',
                    value: { S: 'propS_eq' },
                  },
                },
              ],
            },
            {
              and: [
                {
                  condition: {
                    attrName: 'Ent_propN',
                    opr: '>',
                    value: { N: '1' },
                  },
                },
              ],
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('OR', () => {
        const where: Where<E> = {
          OR: [{ propS: { eq: 'propS_eq' } }, { propN: { gt: 1 } }],
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              or: [
                {
                  and: [
                    {
                      condition: {
                        attrName: 'Ent_propS',
                        opr: '=',
                        value: { S: 'propS_eq' },
                      },
                    },
                  ],
                },
                {
                  and: [
                    {
                      condition: {
                        attrName: 'Ent_propN',
                        opr: '>',
                        value: { N: '1' },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
      test('NOT', () => {
        const where: Where<E> = {
          NOT: { propS: { eq: 'propS_eq' } },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const want: Conditions = {
          and: [
            {
              condition: {
                attrName: entNameAttrName,
                opr: '=',
                value: { S: entName },
              },
            },
            {
              not: {
                and: [
                  {
                    condition: {
                      attrName: 'Ent_propS',
                      opr: '=',
                      value: { S: 'propS_eq' },
                    },
                  },
                ],
              },
            },
          ],
        };
        expect(actual.filterConditions).toEqual(want);
      });
    });
  });
  describe('gsi', () => {
    const entName = 'Ent';
    const entConfig = {
      propSgsi: { type: 'S', gsi: { readCapacityUnits: 5, writeCapacityUnits: 2 } },
      propNgsi: { type: 'N', gsi: {} },
      propSngsi: { type: 'S' },
      propNngsi: { type: 'N' },
    } satisfies EntConfig;
    type E = typeof entConfig;
    test('valid operator included', () => {
      const where: Where<E> = {
        propSgsi: { eq: 'propS_eq' },
      };
      const actual = buildConditions({ entName, entConfig, where, gsiPropName: 'propSgsi' });
      const wantKeyConditions: Conditions = {
        and: [
          {
            condition: {
              attrName: 'Ent_propSgsi',
              opr: '=',
              value: { S: 'propS_eq' },
            },
          },
        ],
      };
      const wantFilterConditions: Conditions = {
        and: [
          {
            condition: {
              attrName: entNameAttrName,
              opr: '=',
              value: { S: entName },
            },
          },
        ],
      };
      expect(actual.filterConditions).toEqual(wantFilterConditions);
      expect(actual.keyConditions).toEqual(wantKeyConditions);
    });
    test('invalid operator excluded', () => {
      const where: Where<E> = {
        propSgsi: { contains: 'propS_contains' },
      };
      const actual = buildConditions({ entName, entConfig, where, gsiPropName: 'propSgsi' });
      const wantKeyConditions: Conditions = {
        and: [],
      };
      const wantFilterConditions: Conditions = {
        and: [
          {
            condition: {
              attrName: entNameAttrName,
              opr: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              attrName: 'Ent_propSgsi',
              opr: 'contains',
              value: { S: 'propS_contains' },
            },
          },
        ],
      };
      expect(actual.filterConditions).toEqual(wantFilterConditions);
      expect(actual.keyConditions).toEqual(wantKeyConditions);
    });
  });
});
