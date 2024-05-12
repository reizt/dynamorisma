import { DescribeTableCommand, ResourceNotFoundException, TableNotFoundException } from '@aws-sdk/client-dynamodb';
import { type Context, getTableName } from '../../context';
import type { TableInfo, TableInfoAttribute, TableInfoIndex } from './types';

export const getTableInfo = async (ctx: Context): Promise<TableInfo | null> => {
	try {
		const tableName = getTableName(ctx.tableName);
		const command = new DescribeTableCommand({
			TableName: tableName,
		});
		const output = await ctx.dynamodb.send(command);
		const table = output.Table;
		if (table == null) {
			throw new Error(`Table ${tableName} does not exist`);
		}

		const attributes: TableInfoAttribute[] = [];
		for (const key of table.AttributeDefinitions ?? []) {
			attributes.push({
				name: key.AttributeName!,
				type: key.AttributeType!,
			});
		}

		const indexes: TableInfoIndex[] = [];
		for (const gsi of table.GlobalSecondaryIndexes ?? []) {
			indexes.push({
				name: gsi.IndexName!,
				hashKey: gsi.KeySchema!.find((key) => key.KeyType === 'HASH')!.AttributeName!,
				rangeKey: gsi.KeySchema!.find((key) => key.KeyType === 'RANGE')?.AttributeName,
				readCapacityUnits: gsi.ProvisionedThroughput?.ReadCapacityUnits,
				writeCapacityUnits: gsi.ProvisionedThroughput?.WriteCapacityUnits,
			});
		}

		return { attributes, indexes };
	} catch (err) {
		if (err instanceof TableNotFoundException || err instanceof ResourceNotFoundException) {
			return null;
		}
		throw err;
	}
};
