import { QueryCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { entNameGsiName, newGsiName } from '../../schema/gsi';
import { dynamorismaIdAttrName } from '../../schema/id';
import { buildConditions } from '../builder/build-conditions';
import { buildExpression } from '../builder/build-expression';
import type { EntConfig, InferEnt } from '../types/config';
import type { CollectIn, DynamorismaIdInfo, EntRepo } from '../types/repo';
import { pretty } from '../utils/pretty-print';
import { unmarshallEnt } from '../utils/unmarshall';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	input: CollectIn<E>;
};
export const $findMany = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: DynamorismaContext): Promise<ReturnType<EntRepo<E>['$findMany']>> => {
	const out = buildConditions({
		entName,
		entConfig,
		where: input.where ?? {},
		gsiPropName: input.gsi,
	});
	const filterQ = out.filterConditions != null ? buildExpression(out.filterConditions) : undefined;
	const keyQ = out.keyConditions != null ? buildExpression(out.keyConditions) : undefined;

	const gsiName = input.gsi != null ? newGsiName(entName, input.gsi as string) : entNameGsiName;

	const command = new QueryCommand({
		TableName: ctx.tableName,
		IndexName: gsiName,
		ExpressionAttributeNames: { ...filterQ?.names, ...keyQ?.names },
		ExpressionAttributeValues: { ...filterQ?.values, ...keyQ?.values },
		KeyConditionExpression: keyQ?.expression,
		FilterExpression: filterQ?.expression,
		Limit: input.scanLimit,
	});

	if (ctx.options?.log?.query === true) {
		if (command.input.KeyConditionExpression != null) {
			pretty(`KeyConditionExpression: ${command.input.KeyConditionExpression}`, 'FgBlue');
		}
		if (command.input.FilterExpression != null) {
			pretty(`FilterExpression: ${command.input.FilterExpression}`, 'FgBlue');
		}
		if (command.input.ExpressionAttributeNames != null) {
			pretty(`ExpressionAttributeNames: ${JSON.stringify(command.input.ExpressionAttributeNames, null, 2)}`, 'FgBlue');
		}
		if (command.input.ExpressionAttributeValues != null) {
			pretty(`ExpressionAttributeValues: ${JSON.stringify(command.input.ExpressionAttributeValues, null, 2)}`, 'FgBlue');
		}
	}

	const commandOutput = await ctx.dynamodb.send(command);
	const items = commandOutput.Items ?? [];
	if (items.length === 0) {
		return [];
	}

	const entities: (InferEnt<E> & DynamorismaIdInfo)[] = items.map((item) => {
		const ent = unmarshallEnt(entName, entConfig, item);
		return {
			...ent,
			__dynamorismaId: item[dynamorismaIdAttrName]!.S!,
		};
	});

	return entities;
};
