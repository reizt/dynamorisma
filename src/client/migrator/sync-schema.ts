import { UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import type { DynmrSchema } from '../types/repo';
import { calcTableDiff } from './calc-table-diff';
import { createTableInteractive } from './create-table-interactive';
import { getTableInfo } from './get-table-info';
import { makeUpdateCommandInput } from './make-update-command-input';
import { renderTableDiff } from './render-table-diff';
import { schemaToTableInfo } from './schema-to-table-info';

export const syncSchema = async (schema: DynmrSchema, ctx: Context) => {
  let beforeTableInfo = await getTableInfo(ctx);
  while (beforeTableInfo == null) {
    console.log(`Table ${ctx.tableName} does not exist. (region: ${await ctx.dynamodb.config.region()})`);
    const createOk = confirm(`Do you want to create it here?`);
    if (!createOk) {
      throw new Error('Cancelled');
    }
    await createTableInteractive(ctx);
    beforeTableInfo = await getTableInfo(ctx);
  }
  const afterTableInfo = schemaToTableInfo(schema);
  const tableDiff = calcTableDiff(beforeTableInfo, afterTableInfo);
  renderTableDiff(tableDiff);
  const updateOk = confirm('Do you want to apply these changes?');
  if (!updateOk) {
    throw new Error('Cancelled');
  }
  const commandInput = makeUpdateCommandInput(tableDiff, afterTableInfo, ctx);
  const command = new UpdateTableCommand(commandInput);
  await ctx.dynamodb.send(command);
};
