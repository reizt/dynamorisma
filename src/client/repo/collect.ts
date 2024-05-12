import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { type Context, getTableName } from '../../context';
import { entNameGsiName, newGsiName } from '../../schema/gsi';
import { dynmrIdAttrName } from '../../schema/id';
import { buildConditions } from '../builder/build-conditions';
import { buildExpression } from '../builder/build-expression';
import type { EntConfig, InferEnt } from '../types/config';
import type { CollectIn, DynmrIdInfo, EntRepo } from '../types/repo';
import { pretty } from '../utils/pretty-print';
import { unmarshallEnt } from '../utils/unmarshall';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: CollectIn<E>;
};
export const collect = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): Promise<ReturnType<EntRepo<E>['collect']>> => {
  const out = buildConditions({
    entName,
    entConfig,
    where: input.where ?? {},
    gsiPropName: input.gsi,
  });
  const filterQ = out.filterConditions != null ? buildExpression(out.filterConditions) : undefined;
  const keyQ = out.keyConditions != null ? buildExpression(out.keyConditions) : undefined;

  const gsiName = input.gsi != null ? newGsiName(entName, input.gsi as string) : entNameGsiName;

  const command = new QueryCommand({
    TableName: getTableName(ctx.tableName, entName),
    IndexName: gsiName,
    ExpressionAttributeNames: { ...filterQ?.names, ...keyQ?.names },
    ExpressionAttributeValues: { ...filterQ?.values, ...keyQ?.values },
    KeyConditionExpression: keyQ?.expression,
    FilterExpression: filterQ?.expression,
    Limit: input.scanLimit,
  });

  if (ctx.options?.log?.query === true) {
    if (command.input.KeyConditionExpression != null) {
      pretty(`KeyConditionExpression: ${command.input.KeyConditionExpression}`, 'FgBlue');
    }
    if (command.input.FilterExpression != null) {
      pretty(`FilterExpression: ${command.input.FilterExpression}`, 'FgBlue');
    }
    if (command.input.ExpressionAttributeNames != null) {
      pretty(`ExpressionAttributeNames: ${JSON.stringify(command.input.ExpressionAttributeNames, null, 2)}`, 'FgBlue');
    }
    if (command.input.ExpressionAttributeValues != null) {
      pretty(`ExpressionAttributeValues: ${JSON.stringify(command.input.ExpressionAttributeValues, null, 2)}`, 'FgBlue');
    }
  }

  const commandOutput = await ctx.dynamodb.send(command);
  const items = commandOutput.Items ?? [];
  if (items.length === 0) {
    return [];
  }

  const entities: (InferEnt<E> & DynmrIdInfo)[] = items.map((item) => {
    const ent = unmarshallEnt(entName, entConfig, item);
    return {
      ...ent,
      __dynmrId: item[dynmrIdAttrName]!.S!,
    };
  });

  return entities;
};
