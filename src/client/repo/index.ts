import type { Context } from '../../context';
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
    put: async (ent) => await put({ entName, entConfig, ent }, ctx),
    putBatch: async (ents) => await putBatch({ entName, entConfig, ents }, ctx),
    del: async (dynmrId) => await del({ entName, entConfig, dynmrId }, ctx),
    delBatch: async (dynmrIds) => await delBatch({ entName, entConfig, dynmrIds }, ctx),
  };
};
