import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, PutIn } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: PutIn<E>;
};
export const put = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['put']> => {
  const ent = input.ent;

  const dynmrId = newDynmrId();
  const item = buildItem(entName, entConfig, ent, dynmrId);

  const command = new PutItemCommand({
    TableName: ctx.tableName,
    Item: item,
  });

  await ctx.dynamodb.send(command);

  return { dynmrId };
};
