import type { EntConfig } from '../types/config';
import type { Filter, Where } from '../types/repo';
import { marshallValue } from '../utils/marshall';
import { newAttributeName } from './attribute';
import type { Condition, Conditions } from './build-expression';
import { entNameAttrName } from './id';

export const buildConditions = <E extends EntConfig>(entName: string, entConfig: E, where: Where<E>): Conditions => {
  // Only the root where clause needs to add the ent name filter.
  return buildConditionsRecursive(entName, entConfig, where, true);
};

const buildConditionsRecursive = <E extends EntConfig>(entName: string, entConfig: E, where: Where<E>, addEntNameFilter: boolean): Conditions => {
  const conds: Conditions = {} as any;

  if (addEntNameFilter) {
    conds.and = conds.and ?? [];
    const entNameCond: Condition = {
      attrName: entNameAttrName,
      operator: '=',
      value: marshallValue(entName),
    };
    conds.and.push({ condition: entNameCond });
  }

  if (where.AND != null) {
    conds.and = conds.and ?? [];
    for (const andWhere of where.AND) {
      const andConds = buildConditionsRecursive(entName, entConfig, andWhere, false);
      conds.and.push(andConds);
    }
  }

  if (where.OR != null) {
    conds.or = [];
    for (const orWhere of where.OR) {
      const orConds = buildConditionsRecursive(entName, entConfig, orWhere, false);
      conds.or.push(orConds);
    }
  }

  if (where.NOT != null) {
    const notConds = buildConditionsRecursive(entName, entConfig, where.NOT, false);
    conds.not = notConds;
  }

  conds.and = conds.and ?? [];

  for (const propName in entConfig) {
    const propConfig = entConfig[propName as keyof E];
    const filter = where[propName as unknown as Exclude<keyof Where<E>, 'AND' | 'OR' | 'NOT'>];
    if (propConfig == null || filter == null) continue;

    const attrName = newAttributeName(entName, propName);
    const propConds: Condition[] = [];
    if (filter.eq != null) {
      propConds.push({ attrName, operator: '=', value: marshallValue(filter.eq) });
    }
    if (filter.ne != null) {
      propConds.push({ attrName, operator: '<>', value: marshallValue(filter.ne) });
    }
    if (filter.in != null) {
      propConds.push({ attrName, operator: 'in', valueIn: marshallValue(filter.in) });
    }
    if (propConfig.type === 'S') {
      const filterS = filter as Filter<{ type: 'S' }>;
      if (filterS.beginsWith != null) {
        propConds.push({ attrName, operator: 'begins_with', value: marshallValue(filterS.beginsWith) });
      }
      if (filterS.contains != null) {
        propConds.push({ attrName, operator: 'contains', value: marshallValue(filterS.contains) });
      }
    }
    if (propConfig.type === 'N') {
      const filterN = filter as Filter<{ type: 'N' }>;
      if (filterN.gt != null) {
        propConds.push({ attrName, operator: '>', value: marshallValue(filterN.gt) });
      }
      if (filterN.gte != null) {
        propConds.push({ attrName, operator: '>=', value: marshallValue(filterN.gte) });
      }
      if (filterN.lt != null) {
        propConds.push({ attrName, operator: '<', value: marshallValue(filterN.lt) });
      }
      if (filterN.lte != null) {
        propConds.push({ attrName, operator: '<=', value: marshallValue(filterN.lte) });
      }
      if (filterN.between != null) {
        propConds.push({ attrName, operator: 'between', valueFrom: marshallValue(filterN.between[0]), valueTo: marshallValue(filterN.between[1]) });
      }
    }
    conds.and.push(...propConds.map((c) => ({ condition: c })));
  }

  if (conds.and.length === 1) {
    return { condition: conds.and[0]!.condition! };
  }

  if (conds.or?.length === 1) {
    return { condition: conds.or[0]!.condition! };
  }

  return conds;
};
