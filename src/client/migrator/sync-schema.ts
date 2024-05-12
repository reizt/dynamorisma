import { CreateTableCommand, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { type Context, getTableName } from '../../context';
import type { DynmrSchema } from '../types/repo';
import { confirm } from '../utils/cli';
import { calcTableDiff } from './calc-table-diff';
import { askCreateTableInputInteractively } from './create-table-interactive';
import { getTableInfo } from './get-table-info';
import { makeCreateCommandInput } from './make-create-command-input';
import { makeUpdateCommandInputs } from './make-update-command-inputs';
import { renderTableDiff } from './render-table-diff';
import { schemaToTableInfo } from './schema-to-table-info';
import { tableDiffIsEmpty } from './table-diff-is-empty';
import { waitUntilGsiUpdateApplied } from './wait-until-index-update-applied';

export const syncSchema = async (schema: DynmrSchema, ctx: Context) => {
	const tableName = getTableName(ctx.tableName);
	let beforeTableInfo = await getTableInfo(ctx);
	const tableExists = beforeTableInfo != null;
	if (beforeTableInfo == null) {
		console.log(`Table ${tableName} does not exist. (region: ${await ctx.dynamodb.config.region()})`);
		const createOk = await confirm('Do you want to create it here?');
		if (!createOk) {
			console.log('Cancelled');
			return;
		}
		beforeTableInfo = {
			attributes: [],
			indexes: [],
		};
	}
	const afterTableInfo = schemaToTableInfo(schema);

	const tableDiff = calcTableDiff(beforeTableInfo, afterTableInfo);
	renderTableDiff(tableDiff);

	const noChanges = tableDiffIsEmpty(tableDiff);
	if (noChanges) {
		return;
	}

	const applyOk = await confirm('Do you want to apply these changes?');
	if (!applyOk) {
		console.log('Cancelled');
		return;
	}

	if (tableExists) {
		console.log('Applying changes...');
		const commandInputs = makeUpdateCommandInputs(tableDiff, afterTableInfo, ctx);
		if (commandInputs.length === 0) {
			return;
		}
		for (const input of commandInputs.slice(0, 5)) {
			const command = new UpdateTableCommand(input);
			await ctx.dynamodb.send(command);
			const progressingUpdate = input.GlobalSecondaryIndexUpdates?.find((gsi) => (gsi.Create ?? gsi.Delete) != null);
			const progressingIndexName = progressingUpdate?.Create?.IndexName ?? progressingUpdate?.Delete?.IndexName;
			if (progressingIndexName != null) {
				const initialStatus = progressingUpdate?.Create != null ? 'CREATING' : 'DELETING';
				await waitUntilGsiUpdateApplied(progressingIndexName, initialStatus, ctx);
			}
		}
	} else {
		const tableInit = await askCreateTableInputInteractively(ctx);
		const input = makeCreateCommandInput(afterTableInfo, tableInit, ctx);
		const command = new CreateTableCommand(input);
		console.log('Creating table...');
		await ctx.dynamodb.send(command);
	}
};
