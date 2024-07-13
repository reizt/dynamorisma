import { type CreateTableCommandInput, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import { type CapacitySettings, makeCreateCommandInput } from './make-create-command-input';
import type { TableInfo } from './types';

describe(makeCreateCommandInput.name, () => {
	test('no gsi', () => {
		const table: TableInfo = {
			attributes: [{ name: 'foo', type: 'S' }],
			indexes: [],
		};
		const capacity: CapacitySettings = {
			billingMode: 'PAY_PER_REQUEST',
		};
		const ctx: DynamorismaContext = {
			tableName: 'test',
			dynamodb: new DynamoDBClient({}),
		};
		const actual = makeCreateCommandInput(table, capacity, ctx);
		const want: CreateTableCommandInput = {
			TableName: 'test',
			AttributeDefinitions: [{ AttributeName: 'foo', AttributeType: 'S' }],
			KeySchema: [
				{ AttributeName: dynamorismaIdAttrName, KeyType: 'HASH' },
				{ AttributeName: entNameAttrName, KeyType: 'RANGE' },
			],
			GlobalSecondaryIndexes: [],
			BillingMode: 'PAY_PER_REQUEST',
			ProvisionedThroughput: undefined,
		};
		expect(actual).toEqual(want);
	});
	test('with gsi', () => {
		const table: TableInfo = {
			attributes: [{ name: 'foo', type: 'S' }],
			indexes: [{ name: 'byName', hashKey: 'name', rangeKey: 'age' }],
		};
		const capacity: CapacitySettings = {
			billingMode: 'PROVISIONED',
			readCapacityUnits: 1,
			writeCapacityUnits: 2,
		};
		const ctx: DynamorismaContext = {
			tableName: 'test',
			dynamodb: new DynamoDBClient({}),
		};
		const actual = makeCreateCommandInput(table, capacity, ctx);
		const want: CreateTableCommandInput = {
			TableName: 'test',
			KeySchema: [
				{ AttributeName: dynamorismaIdAttrName, KeyType: 'HASH' },
				{ AttributeName: entNameAttrName, KeyType: 'RANGE' },
			],
			AttributeDefinitions: [{ AttributeName: 'foo', AttributeType: 'S' }],
			GlobalSecondaryIndexes: [
				{
					IndexName: 'byName',
					KeySchema: [
						{ AttributeName: 'name', KeyType: 'HASH' },
						{ AttributeName: 'age', KeyType: 'RANGE' },
					],
					Projection: {
						ProjectionType: 'ALL',
					},
				},
			],
			BillingMode: 'PROVISIONED',
			ProvisionedThroughput: {
				ReadCapacityUnits: 1,
				WriteCapacityUnits: 2,
			},
		};
		expect(actual).toEqual(want);
	});
});
