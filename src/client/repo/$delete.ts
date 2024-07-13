import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	dynamorismaId: string;
};
export const $delete = async <E extends EntConfig>({ entName, entConfig, dynamorismaId }: Args<E>, ctx: DynamorismaContext): Promise<ReturnType<EntRepo<E>['$delete']>> => {
	const tableName = ctx.tableName;
	const command = new DeleteItemCommand({
		TableName: tableName,
		Key: {
			[dynamorismaIdAttrName]: { S: dynamorismaId },
			[entNameAttrName]: { S: entName },
		},
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Delete Key: ${JSON.stringify(command.input.Key, null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(command);
};
