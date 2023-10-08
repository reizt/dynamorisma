import type { Context } from '../../context';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { collect } from './collect';
import { create } from './create';
import { createBatch } from './createBatch';
import { del } from './del';
import { delBatch } from './delBatch';
import { pick } from './pick';
import { update } from './update';
import { updateBatch } from './updateBatch';

export const createEntRepo = <E extends EntConfig>(entName: string, entConfig: E, ctx: Context): EntRepo<E> => {
  return {
    collect: async (input) => await collect({ entName, entConfig, input }, ctx),
    pick: async (input) => await pick({ entName, entConfig, input }, ctx),
    create: async (ent) => await create({ entName, entConfig, ent }, ctx),
    createBatch: async (ents) => await createBatch({ entName, entConfig, ents }, ctx),
    update: async (ent) => await update({ entName, entConfig, ent }, ctx),
    updateBatch: async (ents) => await updateBatch({ entName, entConfig, ents }, ctx),
    del: async (dynmrId) => await del({ entName, entConfig, dynmrId }, ctx),
    delBatch: async (dynmrIds) => await delBatch({ entName, entConfig, dynmrIds }, ctx),
  };
};
