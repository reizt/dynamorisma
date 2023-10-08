import { newAttributeName } from '../../schema/attribute';
import { entNameGsiName, newGsiName } from '../../schema/gsi';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { DynmrSchema } from '../types/repo';
import type { TableInfo, TableInfoAttribute, TableInfoIndex } from './types';

export const schemaToTableInfo = (schema: DynmrSchema): TableInfo => {
  const attributes: TableInfoAttribute[] = [];
  const indexes: TableInfoIndex[] = [];

  attributes.push({ name: dynmrIdAttrName, type: 'S' }, { name: entNameAttrName, type: 'S' });
  indexes.push({ name: entNameGsiName, hashKey: entNameAttrName, readCapacityUnits: 0, writeCapacityUnits: 0 });

  for (const entName in schema) {
    const entConfig = schema[entName]!;
    for (const propName in entConfig) {
      const propConfig = entConfig[propName]!;
      if (propConfig.gsi == null) continue;

      const attrName = newAttributeName(entName, propName);
      const gsiName = newGsiName(entName, propName);

      attributes.push({ name: attrName, type: propConfig.type });
      indexes.push({
        name: gsiName,
        hashKey: entNameAttrName,
        rangeKey: attrName,
        readCapacityUnits: propConfig.gsi.readCapacityUnits,
        writeCapacityUnits: propConfig.gsi.writeCapacityUnits,
      });
    }
  }

  return { attributes, indexes };
};
