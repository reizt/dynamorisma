Dynmr is a library to use AWS DynamoDB type-safely.

## Getting Started

```sh
npm i dynmr
```

## Example

```ts
import { createDynmr, type DynmrSchema } from 'dynmr';

const config = {
  user: {
    id: { type: 'S', gsi: { readCapacityUnits: 2, writeCapacityUnits: 2 } },
    name: { type: 'S', optional: true },
    age: { type: 'N', gsi: {} },
    sex: { type: 'S', enum: ['male', 'female'] as const },
  },
} satisfies DynmrSchema;

const client = createDynmr(config, {
  clientConfig: {},
  tableName: 'xxx',
  options: {
    log: {
      query: true,
    },
  },
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

const updatedUser = await client.user.update({
  ...user,
  age: user.age + 1,
});

await client.user.del(updatedUser.__dynmrId);
```
