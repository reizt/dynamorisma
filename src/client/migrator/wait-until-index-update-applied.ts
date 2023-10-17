import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { getTableName, type Context } from '../../context';

const secondsFormat = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = (seconds % 60).toFixed(0);
  if (minutes === 0) {
    return `${restSeconds}s`;
  }
  return `${minutes}m${restSeconds}s`;
};

export const waitUntilGsiUpdateApplied = async (indexName: string, initialStatus: 'CREATING' | 'DELETING', ctx: Context): Promise<void> => {
  const tableName = getTableName(ctx.tableName);
  const interval = 10_000;

  let retry = 0;
  let prevStatus: string | undefined = initialStatus;
  for (;;) {
    const epalsedSeconds = retry * (interval / 1000);
    const { Table } = await ctx.dynamodb.send(new DescribeTableCommand({ TableName: tableName }));
    const gsi = Table?.GlobalSecondaryIndexes?.find((i) => i.IndexName === indexName);

    if (prevStatus === 'CREATING') {
      if (gsi == null) {
        throw new Error(`Index ${indexName} is not found`);
      }
      if (gsi.IndexStatus === 'ACTIVE') {
        console.log(`Index ${indexName} is now ACTIVE`);
        return;
      }
      console.log(`Creating index: ${indexName} ... (epalsed: ${secondsFormat(epalsedSeconds)})`);
      prevStatus = gsi.IndexStatus;
    }

    if (prevStatus === 'DELETING') {
      if (gsi == null) {
        console.log(`Index ${indexName} is now DELETED`);
        return;
      }
      console.log(`Deleting index: ${indexName} ... (epalsed: ${secondsFormat(epalsedSeconds)})`);
      prevStatus = gsi.IndexStatus;
    }

    retry++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};
