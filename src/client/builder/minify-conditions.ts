import type { Conditions } from './build-expression';

export const minifyConditions = (conds: Conditions | undefined): Conditions | undefined => {
  if (conds == null) {
    return undefined;
  }

  if (conds.and != null) {
    if (conds.and.length === 0) {
      return undefined;
    }
    if (conds.and.length === 1) {
      return minifyConditions(conds.and[0]);
    }
    const and: Conditions[] = [];
    for (const andCond of conds.and) {
      const minified = minifyConditions(andCond);
      if (minified != null) {
        and.push(minified);
      }
    }
    if (and.length === 0) {
      return undefined;
    }
    if (and.length === 1) {
      return and[0];
    }
    return { and };
  }

  if (conds.or != null) {
    if (conds.or.length === 0) {
      return undefined;
    }
    if (conds.or.length === 1) {
      return minifyConditions(conds.or[0]);
    }
    const or: Conditions[] = [];
    for (const orCond of conds.or) {
      const minified = minifyConditions(orCond);
      if (minified != null) {
        or.push(minified);
      }
    }
    if (or.length === 0) {
      return undefined;
    }
    if (or.length === 1) {
      return or[0];
    }
    return { or };
  }

  if (conds.not != null) {
    const notConds = minifyConditions(conds.not);
    if (notConds == null) {
      return undefined;
    }
    return { not: notConds };
  }

  return conds;
};
