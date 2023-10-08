import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export type Context = {
  dynamodb: DynamoDBClient;
  tableName: string;
  options?: {
    log?: {
      query?: boolean;
    };
  };
};
