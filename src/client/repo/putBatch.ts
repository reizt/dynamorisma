import { BatchWriteItemCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig, InferEnt } from '../types/config';
import type { EntRepo, ReturnedEnt } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  ents: InferEnt<E>[];
};
export const putBatch = async <E extends EntConfig>({ entName, entConfig, ents }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['putBatch']> => {
  const items: Record<string, AttributeValue>[] = [];
  const out: ReturnedEnt<E>[] = [];

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

  await ctx.dynamodb.send(command);

  return out;
};
