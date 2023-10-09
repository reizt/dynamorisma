import type { Context } from '../context';
import { createEntRepo } from './repo/index';
import type { Dynmr, DynmrSchema } from './types/repo';

export const createDynmr = <S extends DynmrSchema>(schema: S, ctx: Context): Dynmr<S> => {
  const dynmr: Dynmr<S> = {} as any;
  for (const entName in schema) {
    dynmr[entName as keyof S] = createEntRepo(entName, schema[entName as keyof S], ctx);
  }

  return dynmr;
};
