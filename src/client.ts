import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { Context } from './context';
import { createEntRepo } from './repo';
import type { Dynmr, DynmrSchema } from './types/repo';

export type DynmrInit<S extends DynmrSchema> = {
  dynamodb: DynamoDBClient;
  tableName: string;
  schema: S;
};

export const createDynmr = <S extends DynmrSchema>({ dynamodb, tableName, schema }: DynmrInit<S>): Dynmr<S> => {
  const ctx: Context = {
    dynamodb,
    tableName,
  };

  const dynmr: Dynmr<S> = {} as any;
  for (const entName in schema) {
    dynmr[entName as keyof S] = createEntRepo(entName, schema[entName as keyof S], ctx);
  }

  return dynmr;
};
