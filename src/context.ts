import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const getTableName = (tableName: Context['tableName'], entName?: string): string => {
  if (typeof tableName === 'string') {
    return tableName;
  }
  if (typeof tableName === 'function' && entName != null) {
    return tableName(entName);
  }
  throw new Error('Invalid tableName');
};

export type Context = {
  dynamodb: DynamoDBClient;
  tableName: string | ((entÑame: string) => string);
  options?: {
    log?: {
      query?: boolean;
    };
  };
};
