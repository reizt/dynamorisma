import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export type DynamorismaContext = {
	dynamodb: DynamoDBClient;
	tableName: string;
	options?: {
		log?: {
			query?: boolean;
		};
	};
};
