import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export type DynmrContext = {
	dynamodb: DynamoDBClient;
	tableName: string;
	options?: {
		log?: {
			query?: boolean;
		};
	};
};
