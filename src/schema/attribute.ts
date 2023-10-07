import type { EntName, PropName } from '../client/types/config';

export const newAttributeName = (entName: EntName, propName: PropName): string => {
  return `${entName}_${propName}`;
};
