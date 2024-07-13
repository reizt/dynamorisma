import { type DescribeTableCommandOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { getTableInfo } from './get-table-info';
import type { TableInfo } from './types';

describe(getTableInfo.name, () => {
	const ctx: DynamorismaContext = {
		dynamodb: new DynamoDBClient({}),
		tableName: 'test-table',
	};
	test('empty table', async () => {
		const mockOutput: DescribeTableCommandOutput = {
			$metadata: {},
			Table: {
				AttributeDefinitions: [],
			},
		};
		vi.spyOn(ctx.dynamodb, 'send').mockResolvedValue(mockOutput as any);

		const actual = await getTableInfo(ctx);
		const want: TableInfo = {
			attributes: [],
			indexes: [],
		};
		expect(actual).toEqual(want);
	});
	test('simple table', async () => {
		const mockOutput: DescribeTableCommandOutput = {
			$metadata: {},
			Table: {
				AttributeDefinitions: [
					{ AttributeName: 'foo', AttributeType: 'S' },
					{ AttributeName: 'bar', AttributeType: 'N' },
				],
			},
		};
		vi.spyOn(ctx.dynamodb, 'send').mockResolvedValue(mockOutput as any);

		const actual = await getTableInfo(ctx);
		const want: TableInfo = {
			attributes: [
				{
					name: 'foo',
					type: 'S',
				},
				{
					name: 'bar',
					type: 'N',
				},
			],
			indexes: [],
		};
		expect(actual).toEqual(want);
	});
	test('gsi without range', async () => {
		const mockOutput: DescribeTableCommandOutput = {
			$metadata: {},
			Table: {
				AttributeDefinitions: [
					{ AttributeName: 'foo', AttributeType: 'S' },
					{ AttributeName: 'bar', AttributeType: 'N' },
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: 'foo_gsi',
						KeySchema: [{ AttributeName: 'foo', KeyType: 'HASH' }],
						ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 2 },
					},
				],
			},
		};
		vi.spyOn(ctx.dynamodb, 'send').mockResolvedValue(mockOutput as any);

		const actual = await getTableInfo(ctx);
		const want: TableInfo = {
			attributes: [
				{
					name: 'foo',
					type: 'S',
				},
				{
					name: 'bar',
					type: 'N',
				},
			],
			indexes: [
				{
					name: 'foo_gsi',
					hashKey: 'foo',
					rangeKey: undefined,
					readCapacityUnits: 5,
					writeCapacityUnits: 2,
				},
			],
		};
		expect(actual).toEqual(want);
	});
	test('gsi with range', async () => {
		const mockOutput: DescribeTableCommandOutput = {
			$metadata: {},
			Table: {
				AttributeDefinitions: [
					{ AttributeName: 'foo', AttributeType: 'S' },
					{ AttributeName: 'bar', AttributeType: 'N' },
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: 'foo_bar_gsi',
						KeySchema: [
							{ AttributeName: 'foo', KeyType: 'HASH' },
							{ AttributeName: 'bar', KeyType: 'RANGE' },
						],
						ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 2 },
					},
				],
			},
		};
		vi.spyOn(ctx.dynamodb, 'send').mockResolvedValue(mockOutput as any);

		const actual = await getTableInfo(ctx);
		const want: TableInfo = {
			attributes: [
				{
					name: 'foo',
					type: 'S',
				},
				{
					name: 'bar',
					type: 'N',
				},
			],
			indexes: [
				{
					name: 'foo_bar_gsi',
					hashKey: 'foo',
					rangeKey: 'bar',
					readCapacityUnits: 5,
					writeCapacityUnits: 2,
				},
			],
		};
		expect(actual).toEqual(want);
	});
});
