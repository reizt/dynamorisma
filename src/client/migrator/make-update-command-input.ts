import type {
  AttributeDefinition,
  CreateGlobalSecondaryIndexAction,
  UpdateGlobalSecondaryIndexAction,
  UpdateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import type { TableDiff, TableInfo } from './types';

export const makeUpdateCommandInput = (tableDiff: TableDiff, newTable: TableInfo, ctx: Context): UpdateTableCommandInput => {
  const AttributeDefinitions: AttributeDefinition[] = [];
  for (const attr of newTable.attributes) {
    AttributeDefinitions.push({
      AttributeName: attr.name,
      AttributeType: attr.type,
    });
  }

  const gsiCreates: CreateGlobalSecondaryIndexAction[] = [];
  for (const index of tableDiff.indexes.added) {
    gsiCreates.push({
      IndexName: index.name,
      KeySchema: [{ AttributeName: index.hashKey, KeyType: 'HASH' }, ...(index.rangeKey != null ? [{ AttributeName: index.rangeKey, KeyType: 'RANGE' }] : [])],
      Projection: { ProjectionType: 'ALL' },
    });
  }

  const gsiDeletes: string[] = [];
  for (const index of tableDiff.indexes.removed) {
    gsiDeletes.push(index.name);
  }

  const gsiUpdates: UpdateGlobalSecondaryIndexAction[] = [];
  for (const indexUpdate of tableDiff.indexes.changed) {
    gsiUpdates.push({
      IndexName: indexUpdate.name,
      ProvisionedThroughput: {
        ReadCapacityUnits: indexUpdate.new.readCapacityUnits,
        WriteCapacityUnits: indexUpdate.new.writeCapacityUnits,
      },
    });
  }

  const commandInput: UpdateTableCommandInput = {
    TableName: ctx.tableName,
    AttributeDefinitions,
    GlobalSecondaryIndexUpdates: [
      ...gsiCreates.map((create) => ({ Create: create })),
      ...gsiDeletes.map((deleteName) => ({ Delete: { IndexName: deleteName } })),
      ...gsiUpdates.map((update) => ({ Update: update })),
    ],
  };

  return commandInput;
};
