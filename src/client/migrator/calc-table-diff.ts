import type { TableDiff, TableInfo, TableInfoIndex } from './types';

export const calcTableDiff = (tableX: TableInfo, tableY: TableInfo): TableDiff => {
  const diff: TableDiff = {
    attributes: { added: [], removed: [], changed: [] },
    indexes: { added: [], removed: [], changed: [] },
  };

  const attributesMapX = new Map(tableX.attributes.map((attr) => [attr.name, attr]));
  const attributesMapY = new Map(tableY.attributes.map((attr) => [attr.name, attr]));
  for (const [name, attrX] of attributesMapX) {
    const attrY = attributesMapY.get(name);
    if (attrY === undefined) {
      diff.attributes.removed.push(attrX);
    } else if (attrX.type !== attrY.type) {
      diff.attributes.changed.push({ name, oldType: attrX.type, newType: attrY.type });
    }
    attributesMapY.delete(name);
  }

  // attributesMapY now contains only attributes that were not in attributesMapX
  for (const [, attrY] of attributesMapY) {
    diff.attributes.added.push(attrY);
  }

  const indexesMapX = new Map(tableX.indexes.map((index) => [index.name, index]));
  const indexesMapY = new Map(tableY.indexes.map((index) => [index.name, index]));
  for (const [name, indexX] of indexesMapX) {
    const indexY = indexesMapY.get(name);
    if (indexY === undefined) {
      diff.indexes.removed.push(indexX);
      indexesMapY.delete(name);
    } else if (indexX.hashKey !== indexY.hashKey || indexX.rangeKey !== indexY.rangeKey) {
      diff.indexes.removed.push(indexX);
      // Do not delete from mapY to recreate with new keys
    } else if (indexX.readCapacityUnits !== indexY.readCapacityUnits || indexX.writeCapacityUnits !== indexY.writeCapacityUnits) {
      diff.indexes.changed.push({ name, hashKey: indexX.hashKey, rangeKey: indexX.rangeKey, old: pickThroughput(indexX), new: pickThroughput(indexY) });
      indexesMapY.delete(name);
    } else {
      indexesMapY.delete(name);
    }
  }

  // indexesMapY now contains only indexes that were not in indexesMapX
  for (const [, indexY] of indexesMapY) {
    diff.indexes.added.push(indexY);
  }

  return diff;
};

const pickThroughput = (index: TableInfoIndex): Pick<TableInfoIndex, 'readCapacityUnits' | 'writeCapacityUnits'> => {
  return {
    readCapacityUnits: index.readCapacityUnits,
    writeCapacityUnits: index.writeCapacityUnits,
  };
};
