import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from 'context';
import { createEntRepo } from './repo/index';
import type { Dynamorisma, DynamorismaSchema } from './types/repo';

export type DynamorismaInit = {
	clientConfig: DynamoDBClientConfig;
	tableName: string;
	options?: {
		log?: {
			query?: boolean;
		};
	};
};

export const dynamorisma = <S extends DynamorismaSchema>(schema: S, init: DynamorismaInit): Dynamorisma<S> => {
	const dynamorisma: Dynamorisma<S> = {} as any;
	const ctx: DynamorismaContext = {
		dynamodb: new DynamoDBClient(init.clientConfig),
		tableName: init.tableName,
		options: init.options,
	};
	for (const entName in schema) {
		dynamorisma[entName as keyof S] = createEntRepo(entName, schema[entName as keyof S], ctx);
	}

	return dynamorisma;
};
