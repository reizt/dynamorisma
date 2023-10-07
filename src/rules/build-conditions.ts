import type { EntConfig } from '../types/config';
import type { AvailableGsiPropName, Filter, Where } from '../types/repo';
import { marshallValue } from '../utils/marshall';
import { newAttributeName } from './attribute';
import type { Condition, ConditionWithoutAttrName, Conditions } from './build-expression';
import { entNameAttrName } from './id';

type Input<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  where: Where<E>;
  gsiPropName?: AvailableGsiPropName<E>;
};

type Output = {
  keyConditions?: Conditions;
  filterConditions?: Conditions;
};

export const buildConditions = <E extends EntConfig>(input: Input<E>): Output => {
  const filterConds: Conditions = { and: [] };
  const { filterConditions: subFilterConds, keyConditions: subKeyConds } = recursiveBuildConditions(input);

  if (subFilterConds != null) {
    if (subFilterConds.and != null) {
      filterConds.and.push(...subFilterConds.and);
    }
    if (subFilterConds.or != null) {
      filterConds.and.push({ or: subFilterConds.or });
    }
    if (subFilterConds.not != null) {
      filterConds.and.push({ not: subFilterConds.not });
    }
    if (subFilterConds.condition != null) {
      filterConds.and.push({ condition: subFilterConds.condition });
    }
  }

  // Add the ent name filter
  const entNameCond: Condition = {
    attrName: entNameAttrName,
    opr: '=',
    value: marshallValue(input.entName),
  };
  filterConds.and.unshift({ condition: entNameCond });

  return { filterConditions: filterConds, keyConditions: subKeyConds };
};

const recursiveBuildConditions = <E extends EntConfig>(input: Input<E>): Output => {
  const { entName, entConfig, where, gsiPropName } = input;

  if (where.AND != null) {
    const andFilter: Conditions[] = [];
    const andKey: Conditions[] = [];
    for (const andWhere of where.AND) {
      const andOut = recursiveBuildConditions({ entName, entConfig, where: andWhere });
      if (andOut.filterConditions != null) {
        andFilter.push(andOut.filterConditions);
      }
      if (andOut.keyConditions != null) {
        andKey.push(andOut.keyConditions);
      }
    }
    return {
      filterConditions: { and: andFilter },
      keyConditions: { and: andKey },
    };
  }

  if (where.OR != null) {
    const orFilter: Conditions[] = [];
    const orKey: Conditions[] = [];
    for (const orWhere of where.OR) {
      const orOut = recursiveBuildConditions({ entName, entConfig, where: orWhere });
      if (orOut.filterConditions != null) {
        orFilter.push(orOut.filterConditions);
      }
      if (orOut.keyConditions != null) {
        orKey.push(orOut.keyConditions);
      }
    }
    return {
      filterConditions: { or: orFilter },
      keyConditions: { or: orKey },
    };
  }

  if (where.NOT != null) {
    const notOut = recursiveBuildConditions({ entName, entConfig, where: where.NOT });
    return {
      filterConditions: notOut.filterConditions != null ? { not: notOut.filterConditions } : undefined,
      keyConditions: notOut.keyConditions != null ? { not: notOut.keyConditions } : undefined,
    };
  }

  const filterConds: Conditions = { and: [] };
  const keyConds: Conditions = { and: [] };

  for (const propName in entConfig) {
    const propConfig = entConfig[propName as keyof E];
    const filter = where[propName as unknown as Exclude<keyof Where<E>, 'AND' | 'OR' | 'NOT'>];
    if (propConfig == null || filter == null) continue;

    const attrName = newAttributeName(entName, propName);
    const propFilterConds: Condition[] = [];
    const propKeyConds: Condition[] = [];

    const addCondition = (cond: ConditionWithoutAttrName) => {
      if (gsiPropName === (propName as keyof E) && isValidKeyConditionOperator(cond.opr)) {
        propKeyConds.push({ attrName, ...cond });
      } else {
        propFilterConds.push({ attrName, ...cond });
      }
    };

    if (filter.eq != null) {
      addCondition({ opr: '=', value: marshallValue(filter.eq) });
    }
    if (filter.ne != null) {
      addCondition({ opr: '<>', value: marshallValue(filter.ne) });
    }
    if (filter.in != null) {
      addCondition({ opr: 'in', valueIn: marshallValue(filter.in) });
    }
    if (propConfig.type === 'S') {
      const filterS = filter as Filter<{ type: 'S' }>;
      if (filterS.beginsWith != null) {
        addCondition({ opr: 'begins_with', value: marshallValue(filterS.beginsWith) });
      }
      if (filterS.contains != null) {
        addCondition({ opr: 'contains', value: marshallValue(filterS.contains) });
      }
    }
    if (propConfig.type === 'N') {
      const filterN = filter as Filter<{ type: 'N' }>;
      if (filterN.gt != null) {
        addCondition({ opr: '>', value: marshallValue(filterN.gt) });
      }
      if (filterN.gte != null) {
        addCondition({ opr: '>=', value: marshallValue(filterN.gte) });
      }
      if (filterN.lt != null) {
        addCondition({ opr: '<', value: marshallValue(filterN.lt) });
      }
      if (filterN.lte != null) {
        addCondition({ opr: '<=', value: marshallValue(filterN.lte) });
      }
      if (filterN.between != null) {
        addCondition({ opr: 'between', valueFrom: marshallValue(filterN.between[0]), valueTo: marshallValue(filterN.between[1]) });
      }
    }
    filterConds.and.push(...propFilterConds.map((c) => ({ condition: c })));
    keyConds.and.push(...propKeyConds.map((c) => ({ condition: c })));
  }

  return { filterConditions: filterConds, keyConditions: keyConds };
};

const isValidKeyConditionOperator = (opr: Condition['opr']): boolean => {
  if (opr === 'contains' || opr === 'in') {
    return false;
  }

  return true;
};
