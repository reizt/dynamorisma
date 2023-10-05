import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { createDynmr } from '../src/client';
import type { DynmrSchema } from '../src/types/repo';

export const config = {
  user: {
    id: {
      type: 'S',
    },
    name: {
      type: 'S',
      optional: true,
    },
    age: {
      type: 'N',
    },
    sex: {
      type: 'S',
      enum: ['male', 'female'] as const,
    },
  },
} satisfies DynmrSchema;

const client = createDynmr({
  dynamodb: new DynamoDBClient({}),
  tableName: 'xxx',
  schema: config,
});

const { dynmrId } = await client.user.put({
  ent: {
    id: 'xxx',
    age: 18,
    sex: 'male',
  },
});

await client.user.del({ dynmrId });
