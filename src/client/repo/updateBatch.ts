import { type AttributeValue, BatchGetItemCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynmrContext } from '../../context';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, InferEntWithId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	ents: InferEntWithId<E>[];
};
export const updateBatch = async <E extends EntConfig>({ entName, entConfig, ents }: Args<E>, ctx: DynmrContext): ReturnType<EntRepo<E>['updateBatch']> => {
	const tableName = ctx.tableName;
	const items: Record<string, AttributeValue>[] = [];
	const out: InferEntWithId<E>[] = [];

	const batchGetItemCommand = new BatchGetItemCommand({
		RequestItems: {
			[tableName]: {
				Keys: ents.map((ent) => ({
					[dynmrIdAttrName]: { S: ent.__dynmrId },
					[entNameAttrName]: { S: entName },
				})),
			},
		},
	});
	const output = await ctx.dynamodb.send(batchGetItemCommand);
	const existingItems = output.Responses?.[tableName] ?? [];
	if (existingItems.length !== ents.length) {
		throw new Error('Not all items found');
	}

	for (const ent of ents) {
		const dynmrId = ent.__dynmrId;
		out.push({ ...ent, __dynmrId: dynmrId });
		const item = buildItem(entName, entConfig, ent, dynmrId);
		items.push(item);
	}

	const batchWriteItemCommand = new BatchWriteItemCommand({
		RequestItems: {
			[tableName]: items.map((item) => ({
				PutRequest: { Item: item },
			})),
		},
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Put Items: ${JSON.stringify(items, null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(batchWriteItemCommand);

	return out;
};
