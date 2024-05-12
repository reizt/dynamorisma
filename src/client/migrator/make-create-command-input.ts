import type { AttributeDefinition, CreateTableCommandInput, GlobalSecondaryIndex, KeySchemaElement } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { TableInfo } from './types';

export type CapacitySettings = {
	billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
	readCapacityUnits?: number;
	writeCapacityUnits?: number;
};
export const makeCreateCommandInput = (table: TableInfo, capacity: CapacitySettings, ctx: Context): CreateTableCommandInput => {
	const AttributeDefinitions: AttributeDefinition[] = [];
	const KeySchema: KeySchemaElement[] = [
		{ AttributeName: dynmrIdAttrName, KeyType: 'HASH' },
		{ AttributeName: entNameAttrName, KeyType: 'RANGE' },
	];
	for (const attr of table.attributes) {
		AttributeDefinitions.push({
			AttributeName: attr.name,
			AttributeType: attr.type,
		});
	}

	const GlobalSecondaryIndexes: GlobalSecondaryIndex[] = [];
	for (const gsi of table.indexes) {
		const rangeKeySchema: KeySchemaElement[] = gsi.rangeKey != null ? [{ AttributeName: gsi.rangeKey, KeyType: 'RANGE' }] : [];
		GlobalSecondaryIndexes.push({
			IndexName: gsi.name,
			KeySchema: [{ AttributeName: gsi.hashKey, KeyType: 'HASH' }, ...rangeKeySchema],
			Projection: {
				ProjectionType: 'ALL',
			},
		});
	}

	return {
		TableName: ctx.tableName,
		AttributeDefinitions,
		KeySchema,
		GlobalSecondaryIndexes,
		BillingMode: capacity.billingMode,
		ProvisionedThroughput:
			capacity.readCapacityUnits != null || capacity.writeCapacityUnits != null
				? {
						ReadCapacityUnits: capacity.readCapacityUnits,
						WriteCapacityUnits: capacity.writeCapacityUnits,
					}
				: undefined,
	};
};
