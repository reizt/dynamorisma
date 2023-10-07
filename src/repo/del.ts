import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../context';
import { dynmrIdAttrName } from '../rules/id';
import type { EntConfig } from '../types/config';
import type { DelIn, DelOut } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: DelIn<E>;
};
export const del = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): Promise<DelOut<E>> => {
  const command = new DeleteItemCommand({
    TableName: ctx.tableName,
    Key: {
      [dynmrIdAttrName]: { S: input.dynmrId },
    },
  });

  await ctx.dynamodb.send(command);
};
