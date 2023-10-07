import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { newAttributeName } from '../../schema/attribute';
import { dynmrIdAttrName, entNameAttrName } from '../../schema/id';
import type { EntConfig, InferEnt } from '../types/config';
import { marshallValue } from '../utils/marshall';

export const buildItem = <E extends EntConfig>(entName: string, entConfig: E, ent: InferEnt<E>, dynmrId: string): Record<string, AttributeValue> => {
  const item: Record<string, AttributeValue> = {};

  item[dynmrIdAttrName] = { S: dynmrId };
  item[entNameAttrName] = { S: entName };

  for (const propName in entConfig) {
    const attrName = newAttributeName(entName, propName);
    if (!(propName in ent)) continue;
    const propValue = ent[propName as unknown as keyof InferEnt<E>];
    item[attrName] = marshallValue(propValue);
  }

  return item;
};
