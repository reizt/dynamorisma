Prisma-like AWS DynamoDB ORM

## Getting Started

```sh
npm i @reizt/dynamorisma
```

## Example

```ts
import { dynamorisma, type DynamorismaSchema } from '@reizt/dynamorisma';

const config = {
  user: {
    id: { type: 'S', gsi: { readCapacityUnits: 2, writeCapacityUnits: 2 } },
    name: { type: 'S', optional: true },
    age: { type: 'N', gsi: {} },
    sex: { type: 'S', enum: ['male', 'female'] as const },
  },
} satisfies DynamorismaSchema;

const client = dynamorisma(config, {
  clientConfig: {},
  tableName: 'xxx',
  options: {
    log: {
      query: true,
    },
  },
});

await client.user.$many({
  where: { OR: [{ id: { eq: 'xxx' } }, { name: { contains: 'foo' } }] },
  scanLimit: 10,
  gsi: 'id',
});
const user = await client.user.$one({
  where: { OR: [{ id: { eq: 'xxx' } }, { name: { contains: 'foo' } }] },
});

if (user == null) {
  throw new Error('user not found');
}

const updatedUser = await client.user.update({
  ...user,
  age: user.age + 1,
});

await client.user.$delete(updatedUser.__dynamorismaId);
```
