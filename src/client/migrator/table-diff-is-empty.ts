import type { TableDiff } from './types';

export const tableDiffIsEmpty = (tableDiff: TableDiff): boolean => {
  return (
    tableDiff.attributes.added.length === 0 &&
    tableDiff.attributes.removed.length === 0 &&
    tableDiff.attributes.changed.length === 0 &&
    tableDiff.indexes.added.length === 0 &&
    tableDiff.indexes.removed.length === 0 &&
    tableDiff.indexes.changed.length === 0
  );
};
