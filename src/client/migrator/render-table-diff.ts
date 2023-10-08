import type { AttributeType, TableDiff, TableInfoIndex } from './types';

const colors = {
  Reset: '\u001B[0m',
  Bright: '\u001B[1m',
  Dim: '\u001B[2m',
  Underscore: '\u001B[4m',
  Blink: '\u001B[5m',
  Reverse: '\u001B[7m',
  Hidden: '\u001B[8m',

  FgBlack: '\u001B[30m',
  FgRed: '\u001B[31m',
  FgGreen: '\u001B[32m',
  FgYellow: '\u001B[33m',
  FgBlue: '\u001B[34m',
  FgMagenta: '\u001B[35m',
  FgCyan: '\u001B[36m',
  FgWhite: '\u001B[37m',
  FgGray: '\u001B[90m',

  BgBlack: '\u001B[40m',
  BgRed: '\u001B[41m',
  BgGreen: '\u001B[42m',
  BgYellow: '\u001B[43m',
  BgBlue: '\u001B[44m',
  BgMagenta: '\u001B[45m',
  BgCyan: '\u001B[46m',
  BgWhite: '\u001B[47m',
  BgGray: '\u001B[100m',
};

const p = (msg: string, color?: keyof typeof colors) => {
  console.log(color == null ? msg : colors[color] + msg + colors.Reset);
};

export const renderTableDiff = (schemaDiff: TableDiff): void => {
  p('    Format', 'FgGray');
  p('  + Added', 'FgGreen');
  p('  - Removed', 'FgRed');
  p('  ~ Changed', 'FgYellow');
  p('Attribute Definitions:', 'BgBlue');
  p('    <attrName> (<type>)', 'FgGray');
  for (const attr of schemaDiff.attributes.added) {
    p(`  + ${attributeFormat(attr.name, attr.type)}`, 'FgGreen');
  }
  for (const attr of schemaDiff.attributes.removed) {
    p(`  - ${attributeFormat(attr.name, attr.type)}`, 'FgRed');
  }
  for (const { name, oldType, newType } of schemaDiff.attributes.changed) {
    p(`  ~ ${attributeFormat(name, oldType, newType)}`, 'FgYellow');
  }

  p('Global Secondary Indexes:', 'BgBlue');
  p('    <indexName> (<hashKey>, <rangeKey>) R: <readCapacityUnits> W: <writeCapacityUnits>', 'FgGray');
  for (const index of schemaDiff.indexes.added) {
    p(`  + ${gsiFormat(index)}`, 'FgGreen');
  }
  for (const index of schemaDiff.indexes.removed) {
    p(`  - ${gsiFormat(index)}`, 'FgRed');
  }
  for (const { name, hashKey, rangeKey, old: indexOld, new: indexNew } of schemaDiff.indexes.changed) {
    p(
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
