import { newAttributeName } from '../../schema/attribute';
import { newGsiName } from '../../schema/gsi';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { DynmrSchema } from '../types/repo';
import type { TableInfo, TableInfoAttribute, TableInfoIndex } from './types';

export const schemaToTableInfo = (schema: DynmrSchema): TableInfo => {
  const attributes: TableInfoAttribute[] = [];
  const indexes: TableInfoIndex[] = [];

  attributes.push({ name: dynmrIdAttrName, type: 'S' }, { name: entNameAttrName, type: 'S' });

  for (const entName in schema) {
    const entConfig = schema[entName]!;
    for (const propName in entConfig) {
      const propConfig = entConfig[propName]!;
      const attrName = newAttributeName(entName, propName);
      attributes.push({ name: attrName, type: propConfig.type });
      if (propConfig.gsi != null) {
        const gsiName = newGsiName(entName, propName);
        indexes.push({
          name: gsiName,
          hashKey: entNameAttrName,
          rangeKey: attrName,
          readCapacityUnits: propConfig.gsi.readCapacityUnits,
          writeCapacityUnits: propConfig.gsi.writeCapacityUnits,
        });
      }
    }
  }

  return { attributes, indexes };
};
