import type {
  AttributeDefinition,
  CreateGlobalSecondaryIndexAction,
  DeleteGlobalSecondaryIndexAction,
  UpdateGlobalSecondaryIndexAction,
  UpdateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import type { AttributeType, TableDiff, TableInfo } from './types';

const isAvailableAttributeType = (type: AttributeType): boolean => {
  return ['S', 'N', 'B'].includes(type);
};

export const makeUpdateCommandInputs = (tableDiff: TableDiff, newTable: TableInfo, ctx: Context): UpdateTableCommandInput[] => {
  const AttributeDefinitions: AttributeDefinition[] = [];
  for (const attr of newTable.attributes) {
    if (!isAvailableAttributeType(attr.type)) continue;
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

  const gsiDeletes: DeleteGlobalSecondaryIndexAction[] = [];
  for (const index of tableDiff.indexes.removed) {
    gsiDeletes.push({ IndexName: index.name });
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

  const inputs: UpdateTableCommandInput[] = [];
  for (const gsiCreate of gsiCreates) {
    inputs.push({
      TableName: ctx.tableName,
      AttributeDefinitions,
      GlobalSecondaryIndexUpdates: [{ Create: gsiCreate }],
    });
  }
  for (const gsiDelete of gsiDeletes) {
    inputs.push({
      TableName: ctx.tableName,
      AttributeDefinitions,
      GlobalSecondaryIndexUpdates: [{ Delete: gsiDelete }],
    });
  }
  if (gsiUpdates.length > 0) {
    inputs.push({
      TableName: ctx.tableName,
      AttributeDefinitions,
      GlobalSecondaryIndexUpdates: gsiUpdates.map((update) => ({ Update: update })),
    });
  }

  return inputs;
};
