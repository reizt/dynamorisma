import { BatchWriteItemCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig, InferEnt } from '../types/config';
import type { EntRepo, InferEntWithId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  ents: InferEnt<E>[];
};
export const createBatch = async <E extends EntConfig>({ entName, entConfig, ents }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['updateBatch']> => {
  const items: Record<string, AttributeValue>[] = [];
  const out: InferEntWithId<E>[] = [];

  for (const ent of ents) {
    const dynmrId = newDynmrId();
    out.push({ ...ent, __dynmrId: dynmrId });
    const item = buildItem(entName, entConfig, ent, dynmrId);
    items.push(item);
  }

  const command = new BatchWriteItemCommand({
    RequestItems: {
      [ctx.tableName]: items.map((item) => ({
        PutRequest: { Item: item },
      })),
    },
  });

  if (ctx.options?.log?.query === true) {
    pretty(`Put Items: ${JSON.stringify(items, null, 2)}`, 'FgBlue');
  }

  await ctx.dynamodb.send(command);

  return out;
};
