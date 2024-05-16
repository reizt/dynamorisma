import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import type { DynmrContext } from 'context';
import { createEntRepo } from './repo/index';
import type { Dynmr, DynmrSchema } from './types/repo';

export type DynmrInit = {
	clientConfig: DynamoDBClientConfig;
	tableName: string;
	options?: {
		log?: {
			query?: boolean;
		};
	};
};

export const createDynmr = <S extends DynmrSchema>(schema: S, init: DynmrInit): Dynmr<S> => {
	const dynmr: Dynmr<S> = {} as any;
	const ctx: DynmrContext = {
		dynamodb: new DynamoDBClient(init.clientConfig),
		tableName: init.tableName,
		options: init.options,
	};
	for (const entName in schema) {
		dynmr[entName as keyof S] = createEntRepo(entName, schema[entName as keyof S], ctx);
	}

	return dynmr;
};
