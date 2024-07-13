import { type AttributeValue, BatchGetItemCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, InferEntWithId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	ents: InferEntWithId<E>[];
};
export const $updateMany = async <E extends EntConfig>({ entName, entConfig, ents }: Args<E>, ctx: DynamorismaContext): ReturnType<EntRepo<E>['$updateMany']> => {
	const tableName = ctx.tableName;
	const items: Record<string, AttributeValue>[] = [];
	const out: InferEntWithId<E>[] = [];

	const batchGetItemCommand = new BatchGetItemCommand({
		RequestItems: {
			[tableName]: {
				Keys: ents.map((ent) => ({
					[dynamorismaIdAttrName]: { S: ent.__dynamorismaId },
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
		const dynamorismaId = ent.__dynamorismaId;
		out.push({ ...ent, __dynamorismaId: dynamorismaId });
		const item = buildItem(entName, entConfig, ent, dynamorismaId);
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
