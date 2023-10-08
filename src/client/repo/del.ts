import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  dynmrId: string;
};
export const del = async <E extends EntConfig>({ entName, entConfig, dynmrId }: Args<E>, ctx: Context): Promise<ReturnType<EntRepo<E>['del']>> => {
  const command = new DeleteItemCommand({
    TableName: ctx.tableName,
    Key: {
      [dynmrIdAttrName]: { S: dynmrId },
      [entNameAttrName]: { S: entName },
    },
  });

  await ctx.dynamodb.send(command);
};
