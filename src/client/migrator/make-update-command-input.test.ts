import { DynamoDBClient, type UpdateTableCommandInput } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { makeUpdateCommandInput } from './make-update-command-input';
import type { TableDiff, TableInfo } from './types';

describe(makeUpdateCommandInput.name, () => {
  test('no changes', () => {
    const diff: TableDiff = {
      attributes: { added: [], removed: [], changed: [] },
      indexes: { added: [], removed: [], changed: [] },
    };
    const newTable: TableInfo = {
      attributes: [
        { name: 'foo', type: 'S' },
        { name: 'bar', type: 'N' },
      ],
      indexes: [
        {
          name: 'test-index',
          hashKey: 'foo',
          rangeKey: 'bar',
        },
      ],
    };
    const ctx: Context = {
      dynamodb: new DynamoDBClient({}),
      tableName: 'test-table',
    };
    const actual = makeUpdateCommandInput(diff, newTable, ctx);
    const want: UpdateTableCommandInput = {
      TableName: 'test-table',
      AttributeDefinitions: [
        { AttributeName: 'foo', AttributeType: 'S' },
        { AttributeName: 'bar', AttributeType: 'N' },
      ],
      GlobalSecondaryIndexUpdates: [],
    };
    expect(actual).toEqual(want);
  });
  test('add index', () => {
    const diff: TableDiff = {
      attributes: { added: [], removed: [], changed: [] },
      indexes: {
        added: [
          {
            name: 'test-index',
            hashKey: 'foo',
            rangeKey: 'bar',
          },
        ],
        removed: [],
        changed: [],
      },
    };
    const newTable: TableInfo = {
      attributes: [
        { name: 'foo', type: 'S' },
        { name: 'bar', type: 'N' },
      ],
      indexes: [
        {
          name: 'test-index',
          hashKey: 'foo',
          rangeKey: 'bar',
        },
      ],
    };
    const ctx: Context = {
      dynamodb: new DynamoDBClient({}),
      tableName: 'test-table',
    };
    const actual = makeUpdateCommandInput(diff, newTable, ctx);
    const want: UpdateTableCommandInput = {
      TableName: 'test-table',
      AttributeDefinitions: [
        { AttributeName: 'foo', AttributeType: 'S' },
        { AttributeName: 'bar', AttributeType: 'N' },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'test-index',
            KeySchema: [
              { AttributeName: 'foo', KeyType: 'HASH' },
              { AttributeName: 'bar', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        },
      ],
    };
    expect(actual).toEqual(want);
  });
  test('remove index', () => {
    const diff: TableDiff = {
      attributes: { added: [], removed: [], changed: [] },
      indexes: {
        added: [],
        removed: [
          {
            name: 'test-index',
            hashKey: 'foo',
            rangeKey: 'bar',
          },
        ],
        changed: [],
      },
    };
    const newTable: TableInfo = {
      attributes: [
        { name: 'foo', type: 'S' },
        { name: 'bar', type: 'N' },
      ],
      indexes: [],
    };
    const ctx: Context = {
      dynamodb: new DynamoDBClient({}),
      tableName: 'test-table',
    };
    const actual = makeUpdateCommandInput(diff, newTable, ctx);
    const want: UpdateTableCommandInput = {
      TableName: 'test-table',
      AttributeDefinitions: [
        { AttributeName: 'foo', AttributeType: 'S' },
        { AttributeName: 'bar', AttributeType: 'N' },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Delete: { IndexName: 'test-index' },
        },
      ],
    };
    expect(actual).toEqual(want);
  });
  test('change index keys', () => {
    const diff: TableDiff = {
      attributes: { added: [], removed: [], changed: [] },
      indexes: {
        added: [],
        removed: [],
        changed: [
          {
            name: 'test-index',
            hashKey: 'foo',
            rangeKey: 'bar',
            old: {
              readCapacityUnits: 1,
              writeCapacityUnits: 1,
            },
            new: {
              readCapacityUnits: 2,
              writeCapacityUnits: 2,
            },
          },
        ],
      },
    };
    const newTable: TableInfo = {
      attributes: [
        { name: 'foo', type: 'S' },
        { name: 'bar', type: 'N' },
        { name: 'baz', type: 'B' },
      ],
      indexes: [
        {
          name: 'test-index',
          hashKey: 'bar',
          rangeKey: 'baz',
          readCapacityUnits: 2,
          writeCapacityUnits: 2,
        },
      ],
    };
    const ctx: Context = {
      dynamodb: new DynamoDBClient({}),
      tableName: 'test-table',
    };
    const actual = makeUpdateCommandInput(diff, newTable, ctx);
    const want: UpdateTableCommandInput = {
      TableName: 'test-table',
      AttributeDefinitions: [
        { AttributeName: 'foo', AttributeType: 'S' },
        { AttributeName: 'bar', AttributeType: 'N' },
        { AttributeName: 'baz', AttributeType: 'B' },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Update: {
            IndexName: 'test-index',
            ProvisionedThroughput: { ReadCapacityUnits: 2, WriteCapacityUnits: 2 },
          },
        },
      ],
    };

    expect(actual).toEqual(want);
  });
});
