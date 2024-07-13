import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, InferEntWithId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	ent: InferEntWithId<E>;
};
export const $update = async <E extends EntConfig>({ entName, entConfig, ent }: Args<E>, ctx: DynamorismaContext): ReturnType<EntRepo<E>['$update']> => {
	const tableName = ctx.tableName;
	const dynamorismaId = ent.__dynamorismaId;
	const item = buildItem(entName, entConfig, ent, dynamorismaId);

	const getItemCommand = new GetItemCommand({
		TableName: tableName,
		Key: {
			[dynamorismaIdAttrName]: { S: dynamorismaId },
			[entNameAttrName]: { S: entName },
		},
	});
	const output = await ctx.dynamodb.send(getItemCommand);
	if (output.Item == null) {
		throw new Error('Item not found');
	}

	const putItemCommand = new PutItemCommand({
		TableName: tableName,
		Item: item,
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Put Item: ${JSON.stringify(item, null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(putItemCommand);

	return {
		...ent,
		__dynamorismaId: dynamorismaId,
	};
};
