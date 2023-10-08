import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { createDynmr } from '../src/client';
import type { DynmrSchema } from '../src/client/types/repo';

const config = {
  user: {
    id: { type: 'S', gsi: { readCapacityUnits: 2, writeCapacityUnits: 2 } },
    name: { type: 'S', optional: true },
    age: { type: 'N', gsi: {} },
    sex: { type: 'S', enum: ['male', 'female'] as const },
  },
} satisfies DynmrSchema;

const client = createDynmr({
  dynamodb: new DynamoDBClient({}),
  tableName: 'xxx',
  schema: config,
});

await client.user.collect({
  where: { OR: [{ id: { eq: 'xxx' } }, { name: { contains: 'foo' } }] },
  scanLimit: 10,
  gsi: 'id',
});
const user = await client.user.pick({
  where: { OR: [{ id: { eq: 'xxx' } }, { name: { contains: 'foo' } }] },
});

if (user == null) {
  throw new Error('user not found');
}

const dynmrId = await client.user.put({
  ...user,
  age: user.age + 1,
});

await client.user.del(dynmrId);
