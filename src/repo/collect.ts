import { ScanCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../context';
import { buildConditions } from '../rules/build-conditions';
import { buildExpression, type Conditions } from '../rules/build-expression';
import { dynmrIdAttrName } from '../rules/id';
import type { EntConfig } from '../types/config';
import type { CollectIn, CollectOut } from '../types/repo';
import { unmarshallEnt } from '../utils/unmarshall';

type Args<E extends EntConfig> = {
  entName: string;
  entSchema: E;
  input: CollectIn<E>;
};
export const collect = async <E extends EntConfig>({ entName, entSchema, input }: Args<E>, ctx: Context): Promise<CollectOut<E>> => {
  const where = input.where;

  let conds: Conditions | undefined;
  let q: ReturnType<typeof buildExpression> | undefined;
  if (where != null) {
    conds = buildConditions(entName, entSchema, where);
    q = buildExpression(conds);
  }

  const command = new ScanCommand({
    TableName: ctx.tableName,
    ExpressionAttributeNames: q?.names,
    ExpressionAttributeValues: q?.values,
    FilterExpression: q?.expression,
    Limit: input.limit,
  });

  const commandOutput = await ctx.dynamodb.send(command);
  const items = commandOutput.Items ?? [];
  if (items.length === 0) {
    return { entities: [], dynmrIds: [] };
  }

  const entities = items.map((item) => unmarshallEnt(entName, entSchema, item));
  const dynmrIds = items.map((item) => item[dynmrIdAttrName]!.S!);

  return { entities, dynmrIds };
};
