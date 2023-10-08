import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type AttributeType = keyof AttributeValue;
export type TableInfoAttribute = {
  name: string;
  type: AttributeType;
};
export type TableInfoIndex = {
  name: string;
  hashKey: string;
  rangeKey?: string;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
};
export type TableInfo = {
  attributes: TableInfoAttribute[];
  indexes: TableInfoIndex[];
};

export type TableDiff = {
  attributes: {
    added: TableInfoAttribute[];
    removed: TableInfoAttribute[];
    changed: {
      name: string;
      oldType: AttributeType;
      newType: AttributeType;
    }[];
  };
  indexes: {
    added: TableInfoIndex[];
    removed: TableInfoIndex[];
    changed: {
      name: string;
      hashKey: string;
      rangeKey?: string;
      old: Pick<TableInfoIndex, 'readCapacityUnits' | 'writeCapacityUnits'>;
      new: Pick<TableInfoIndex, 'readCapacityUnits' | 'writeCapacityUnits'>;
    }[];
  };
};
