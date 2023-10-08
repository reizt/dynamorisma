import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { createInterface } from 'node:readline/promises';
import type { Context } from '../../context';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';

const question = {
  billingMode: 'Select billing mode: 1) PAY_PER_REQUEST, 2) PROVISIONED: ',
  readCapacityUnits: 'Enter read capacity units: ',
  writeCapacityUnits: 'Enter write capacity units: ',
};
const invalidMessage = {
  billingMode: 'Select 1 or 2.',
  readCapacityUnits: 'Enter a positive integer.',
  writeCapacityUnits: 'Enter a positive integer.',
};

const askUntilValid = async <V extends string>(question: string, validator: (input: string) => input is V, invalidMessage: string): Promise<V> => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  let input = await readline.question(question);
  while (!validator(input)) {
    console.log(invalidMessage);
    input = await readline.question(question);
  }
  readline.close();
  return input;
};

export const createTableInteractive = async (ctx: Context): Promise<void> => {
  const billingMode = await askUntilValid(
    question.billingMode,
    (input): input is '1' | '2' => {
      return input === '1' || input === '2';
    },
    invalidMessage.billingMode,
  );

  let readCapacityUnits: string | undefined;
  let writeCapacityUnits: string | undefined;

  if (billingMode === '2') {
    readCapacityUnits = await askUntilValid(
      question.readCapacityUnits,
      (input): input is string => {
        return /^[1-9]\d*$/.test(input);
      },
      'Enter a positive integer.',
    );
    writeCapacityUnits = await askUntilValid(
      question.writeCapacityUnits,
      (input): input is string => {
        return /^[1-9]\d*$/.test(input);
      },
      invalidMessage.writeCapacityUnits,
    );
  }

  const command = new CreateTableCommand({
    TableName: ctx.tableName,
    AttributeDefinitions: [
      { AttributeName: dynmrIdAttrName, AttributeType: 'S' },
      { AttributeName: entNameAttrName, AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: dynmrIdAttrName, KeyType: 'HASH' },
      { AttributeName: entNameAttrName, KeyType: 'RANGE' },
    ],
    BillingMode: { 1: 'PAY_PER_REQUEST', 2: 'PROVISIONED' }[billingMode],
    ProvisionedThroughput: {
      ReadCapacityUnits: readCapacityUnits != null ? Number(readCapacityUnits) : undefined,
      WriteCapacityUnits: writeCapacityUnits != null ? Number(writeCapacityUnits) : undefined,
    },
  });

  await ctx.dynamodb.send(command);
};
