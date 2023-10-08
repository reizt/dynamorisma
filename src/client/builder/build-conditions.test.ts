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

    const entNameCond: Conditions = {
      condition: {
        attrName: entNameAttrName,
        opr: '=',
        value: { S: entName },
      },
    };

    describe('filters', () => {
      test('eq', () => {
        const where: Where<E> = {
          propS: { eq: 'propS_eq' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propS',
            opr: '=',
            value: { S: 'propS_eq' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('ne', () => {
        const where: Where<E> = {
          propS: { ne: 'propS_ne' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propS',
            opr: '<>',
            value: { S: 'propS_ne' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('beginsWith', () => {
        const where: Where<E> = {
          propS: { beginsWith: 'propS_beginsWith' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propS',
            opr: 'begins_with',
            value: { S: 'propS_beginsWith' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('contains', () => {
        const where: Where<E> = {
          propS: { contains: 'propS_contains' },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propS',
            opr: 'contains',
            value: { S: 'propS_contains' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('gt', () => {
        const where: Where<E> = {
          propN: { gt: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propN',
            opr: '>',
            value: { N: '1' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('gte', () => {
        const where: Where<E> = {
          propN: { gte: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propN',
            opr: '>=',
            value: { N: '1' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('lt', () => {
        const where: Where<E> = {
          propN: { lt: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propN',
            opr: '<',
            value: { N: '1' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('lte', () => {
        const where: Where<E> = {
          propN: { lte: 1 },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propN',
            opr: '<=',
            value: { N: '1' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('between', () => {
        const where: Where<E> = {
          propN: { between: [1, 2] },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = entNameCond;
        const wantFilter: Conditions = {
          condition: {
            attrName: 'Ent_propN',
            opr: 'between',
            valueFrom: { N: '1' },
            valueTo: { N: '2' },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
    });

    describe('logical opers', () => {
      test('AND', () => {
        const where: Where<E> = {
          AND: [{ propS: { eq: 'propS_eq' } }, { propN: { gt: 1 } }],
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = {
          condition: {
            attrName: entNameAttrName,
            opr: '=',
            value: { S: entName },
          },
        };
        const wantFilter: Conditions = {
          and: [
            {
              condition: {
                attrName: 'Ent_propS',
                opr: '=',
                value: { S: 'propS_eq' },
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
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('OR', () => {
        const where: Where<E> = {
          OR: [{ propS: { eq: 'propS_eq' } }, { propN: { gt: 1 } }],
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = {
          condition: {
            attrName: entNameAttrName,
            opr: '=',
            value: { S: entName },
          },
        };
        const wantFilter: Conditions = {
          or: [
            {
              condition: {
                attrName: 'Ent_propS',
                opr: '=',
                value: { S: 'propS_eq' },
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
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
      });
      test('NOT', () => {
        const where: Where<E> = {
          NOT: { propS: { eq: 'propS_eq' } },
        };
        const actual = buildConditions({ entName, entConfig, where });
        const wantKey: Conditions = {
          condition: {
            attrName: entNameAttrName,
            opr: '=',
            value: { S: entName },
          },
        };
        const wantFilter: Conditions = {
          not: {
            condition: {
              attrName: 'Ent_propS',
              opr: '=',
              value: { S: 'propS_eq' },
            },
          },
        };
        expect(actual.keyConditions).toEqual(wantKey);
        expect(actual.filterConditions).toEqual(wantFilter);
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
              attrName: entNameAttrName,
              opr: '=',
              value: { S: entName },
            },
          },
          {
            condition: {
              attrName: 'Ent_propSgsi',
              opr: '=',
              value: { S: 'propS_eq' },
            },
          },
        ],
      };
      const wantFilterConditions = undefined;
      expect(actual.filterConditions).toEqual(wantFilterConditions);
      expect(actual.keyConditions).toEqual(wantKeyConditions);
    });
    test('invalid operator excluded', () => {
      const where: Where<E> = {
        propSgsi: { contains: 'propS_contains' },
      };
      const actual = buildConditions({ entName, entConfig, where, gsiPropName: 'propSgsi' });
      const wantKeyConditions: Conditions = {
        condition: {
          attrName: entNameAttrName,
          opr: '=',
          value: { S: entName },
        },
      };
      const wantFilterConditions: Conditions = {
        condition: {
          attrName: 'Ent_propSgsi',
          opr: 'contains',
          value: { S: 'propS_contains' },
        },
      };
      expect(actual.filterConditions).toEqual(wantFilterConditions);
      expect(actual.keyConditions).toEqual(wantKeyConditions);
    });
  });
});
