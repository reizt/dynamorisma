import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getTableName, type Context } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig, InferEnt } from '../types/config';
import type { EntRepo } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  ent: InferEnt<E>;
};
export const create = async <E extends EntConfig>({ entName, entConfig, ent }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['update']> => {
  const tableName = getTableName(ctx.tableName, entName);
  const dynmrId = newDynmrId();
  const item = buildItem(entName, entConfig, ent, dynmrId);

  const command = new PutItemCommand({
    TableName: tableName,
    Item: item,
  });

  if (ctx.options?.log?.query === true) {
    pretty(`Put Item: ${JSON.stringify(item, null, 2)}`, 'FgBlue');
  }

  await ctx.dynamodb.send(command);

  return {
    ...ent,
    __dynmrId: dynmrId,
  };
};
