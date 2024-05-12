import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import yargs from 'yargs';
import { syncSchema } from '../client/migrator/sync-schema';

const args = yargs(process.argv)
  .command('sync', 'Sync the schema with the database')
  .options({
    schema: {
      alias: 's',
      type: 'string',
      description: 'Path to schema file',
    },
    'table-name': {
      alias: 't',
      type: 'string',
      description: 'Name of the DynamoDB table to sync',
    },
    'aws-region': {
      alias: 'r',
      type: 'string',
      description: 'AWS region',
    },
  })
  .check((args) => {
    if (args.schema == null || !existsSync(args.schema)) {
      throw new Error('Schema file does not exist');
    }
    if (args['table-name'] == null) {
      throw new Error('Table name is required');
    }
    return true;
  })
  .parseSync();

const command = process.argv[2];

type Command = 'sync';

const isValidCommand = (command: string): command is Command => {
  return ['sync'].includes(command);
};

if (command == null || !isValidCommand(command)) {
  console.error('Invalid command');
  process.exit(1);
}

const schemaPath = resolve(args.schema!);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require(schemaPath);
syncSchema(schema, {
  dynamodb: new DynamoDBClient({ region: args['aws-region'] }),
  tableName: args['table-name']!,
})
  .then(() => {
    console.log('Sync completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
