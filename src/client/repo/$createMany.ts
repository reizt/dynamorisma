import { type AttributeValue, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynmrContext } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, InferEntWithId, InferEntWithOptionalId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	ents: InferEntWithOptionalId<E>[];
};
export const $createMany = async <E extends EntConfig>({ entName, entConfig, ents }: Args<E>, ctx: DynmrContext): ReturnType<EntRepo<E>['$updateMany']> => {
	const tableName = ctx.tableName;
	const items: Record<string, AttributeValue>[] = [];
	const out: InferEntWithId<E>[] = [];

	for (const ent of ents) {
		const dynmrId = ent.__dynmrId ?? newDynmrId();
		out.push({ ...ent, __dynmrId: dynmrId });
		const item = buildItem(entName, entConfig, ent, dynmrId);
		items.push(item);
	}

	const command = new BatchWriteItemCommand({
		RequestItems: {
			[tableName]: items.map((item) => ({
				PutRequest: { Item: item },
			})),
		},
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Put Items: ${JSON.stringify(items, null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(command);

	return out;
};
