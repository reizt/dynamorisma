import type { Context } from '../context';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { collect } from './collect';
import { del } from './del';
import { delBatch } from './delBatch';
import { pick } from './pick';
import { put } from './put';
import { putBatch } from './putBatch';

export const createEntRepo = <E extends EntConfig>(entName: string, entConfig: E, ctx: Context): EntRepo<E> => {
  return {
    collect: async (input) => await collect({ entName, entConfig, input }, ctx),
    pick: async (input) => await pick({ entName, entConfig, input }, ctx),
    put: async (input) => await put({ entName, entConfig, input }, ctx),
    putBatch: async (input) => await putBatch({ entName, entConfig, input }, ctx),
    del: async (input) => await del({ entName, entConfig, input }, ctx),
    delBatch: async (input) => await delBatch({ entName, entConfig, input }, ctx),
  };
};
