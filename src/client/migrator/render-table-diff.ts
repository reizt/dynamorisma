import { pretty } from '../utils/pretty-print';
import type { AttributeType, TableDiff, TableInfoIndex } from './types';

export const renderTableDiff = (schemaDiff: TableDiff): void => {
  pretty('    Format', 'FgGray');
  pretty('  + Added', 'FgGreen');
  pretty('  - Removed', 'FgRed');
  pretty('  ~ Changed', 'FgYellow');
  pretty('Attribute Definitions:', 'BgBlue');
  pretty('    <attrName> (<type>)', 'FgGray');
  for (const attr of schemaDiff.attributes.added) {
    pretty(`  + ${attributeFormat(attr.name, attr.type)}`, 'FgGreen');
  }
  for (const attr of schemaDiff.attributes.removed) {
    pretty(`  - ${attributeFormat(attr.name, attr.type)}`, 'FgRed');
  }
  for (const { name, oldType, newType } of schemaDiff.attributes.changed) {
    pretty(`  ~ ${attributeFormat(name, oldType, newType)}`, 'FgYellow');
  }
  if (schemaDiff.attributes.added.length === 0 && schemaDiff.attributes.removed.length === 0 && schemaDiff.attributes.changed.length === 0) {
    pretty('  ~ No changes', 'FgGray');
  }

  pretty('Global Secondary Indexes:', 'BgBlue');
  pretty('    <indexName> (<hashKey>, <rangeKey>) R: <readCapacityUnits> W: <writeCapacityUnits>', 'FgGray');
  for (const index of schemaDiff.indexes.added) {
    pretty(`  + ${gsiFormat(index)}`, 'FgGreen');
  }
  for (const index of schemaDiff.indexes.removed) {
    pretty(`  - ${gsiFormat(index)}`, 'FgRed');
  }
  for (const { name, hashKey, rangeKey, old: indexOld, new: indexNew } of schemaDiff.indexes.changed) {
    pretty(
      `  ~ ${gsiFormat(
        {
          name,
          hashKey,
          rangeKey,
          readCapacityUnits: indexOld.readCapacityUnits,
          writeCapacityUnits: indexOld.writeCapacityUnits,
        },
        {
          name,
          hashKey,
          rangeKey,
          readCapacityUnits: indexNew.readCapacityUnits,
          writeCapacityUnits: indexNew.writeCapacityUnits,
        },
      )}`,
      'FgYellow',
    );
  }
  if (schemaDiff.indexes.added.length === 0 && schemaDiff.indexes.removed.length === 0 && schemaDiff.indexes.changed.length === 0) {
    pretty('  ~ No changes', 'FgGray');
  }
};

const attributeFormat = (name: string, type: AttributeType, newType?: AttributeType): string => {
  if (newType != null) {
    return `${name} (${type}) -> (${newType})`;
  }
  return `${name} (${type})`;
};

const gsiFormat = (index: TableInfoIndex, newIndex?: TableInfoIndex): string => {
  const NONE = '_';
  const base = `${index.name} (${index.hashKey}, ${index.rangeKey ?? NONE})`;
  if (newIndex != null) {
    const readFormat = `R: ${index.readCapacityUnits ?? NONE} -> ${newIndex.readCapacityUnits ?? NONE}`;
    const writeFormat = `W: ${index.writeCapacityUnits ?? NONE} -> ${newIndex.writeCapacityUnits ?? NONE}`;
    return `${base} ${readFormat} ${writeFormat}`;
  }
  const readFormat = `R: ${index.readCapacityUnits ?? NONE}`;
  const writeFormat = `W: ${index.writeCapacityUnits ?? NONE}`;
  return `${base} ${readFormat} ${writeFormat}`;
};
