import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	dynamorismaIds: string[];
};
export const $deleteMany = async <E extends EntConfig>({ entName, entConfig, dynamorismaIds }: Args<E>, ctx: DynamorismaContext): Promise<ReturnType<EntRepo<E>['$deleteMany']>> => {
	const tableName = ctx.tableName;
	const command = new BatchWriteItemCommand({
		RequestItems: {
			[tableName]: dynamorismaIds.map((id) => ({
				DeleteRequest: {
					Key: {
						[dynamorismaIdAttrName]: { S: id },
						[entNameAttrName]: { S: entName },
					},
				},
			})),
		},
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Delete Requests: ${JSON.stringify(command.input.RequestItems?.[tableName], null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(command);
};
