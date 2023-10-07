import type { Context } from '../../context';
import type { EntConfig } from '../types/config';
import type { CollectIn, EntRepo, PickIn } from '../types/repo';
import { collect } from './collect';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: PickIn<E>;
};
export const pick = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['pick']> => {
  const collectIn: CollectIn<E> = { where: input.where, scanLimit: 1 };
  const { entities, dynmrIds } = await collect({ entName, entConfig, input: collectIn }, ctx);
  return {
    entity: entities[0] ?? null,
    dynmrId: dynmrIds[0] ?? null,
  };
};
