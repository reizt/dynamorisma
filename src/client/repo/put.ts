import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
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
export const put = async <E extends EntConfig>({ entName, entConfig, ent }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['put']> => {
  const dynmrId = newDynmrId();
  const item = buildItem(entName, entConfig, ent, dynmrId);

  const command = new PutItemCommand({
    TableName: ctx.tableName,
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
