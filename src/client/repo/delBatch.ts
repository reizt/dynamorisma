import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  dynmrIds: string[];
};
export const delBatch = async <E extends EntConfig>({ entName, entConfig, dynmrIds }: Args<E>, ctx: Context): Promise<ReturnType<EntRepo<E>['delBatch']>> => {
  const command = new BatchWriteItemCommand({
    RequestItems: {
      [ctx.tableName]: dynmrIds.map((id) => ({
        DeleteRequest: {
          Key: {
            [dynmrIdAttrName]: { S: id },
            [entNameAttrName]: { S: entName },
          },
        },
      })),
    },
  });

  await ctx.dynamodb.send(command);
};
