import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../context';
import { dynmrIdAttrName } from '../rules/id';
import type { EntConfig } from '../types/config';
import type { DelManyIn, DelManyOut } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entSchema: E;
  input: DelManyIn<E>;
};
export const delBatch = async <E extends EntConfig>({ entName, entSchema, input }: Args<E>, ctx: Context): Promise<DelManyOut<E>> => {
  const command = new BatchWriteItemCommand({
    RequestItems: {
      [ctx.tableName]: input.dynmrIds.map((id) => ({
        DeleteRequest: {
          Key: { [dynmrIdAttrName]: { S: id } },
        },
      })),
    },
  });

  await ctx.dynamodb.send(command);
};
