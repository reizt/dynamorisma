import type { Context } from '../context';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { collect } from './collect';
import { del } from './del';
import { delBatch } from './delBatch';
import { pick } from './pick';
import { put } from './put';
import { putBatch } from './putBatch';

export const createEntRepo = <E extends EntConfig>(entName: string, entSchema: E, ctx: Context): EntRepo<E> => {
  return {
    collect: async (input) => await collect({ entName, entSchema, input }, ctx),
    pick: async (input) => await pick({ entName, entSchema, input }, ctx),
    put: async (input) => await put({ entName, entSchema, input }, ctx),
    putBatch: async (input) => await putBatch({ entName, entSchema, input }, ctx),
    del: async (input) => await del({ entName, entSchema, input }, ctx),
    delBatch: async (input) => await delBatch({ entName, entSchema, input }, ctx),
  };
};
