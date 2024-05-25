import type { DynmrContext } from '../../context';
import type { EntConfig } from '../types/config';
import type { CollectIn, EntRepo, PickIn } from '../types/repo';
import { $findMany } from './$findMany';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	input: PickIn<E>;
};
export const $findOne = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: DynmrContext): ReturnType<EntRepo<E>['$findOne']> => {
	const collectIn: CollectIn<E> = { where: input.where, gsi: input.gsi, scanLimit: input.scanLimit };
	const entities = await $findMany({ entName, entConfig, input: collectIn }, ctx);
	return entities[0] ?? null;
};
