import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { EntConfig, InferEnt } from '../types/config';
import { marshallValue } from '../utils/marshall';
import { newAttributeName } from './attribute';
import { dynmrIdAttrName, entNameAttrName } from './id';

export const buildItem = <E extends EntConfig>(entName: string, entSchema: E, ent: InferEnt<E>, dynmrId: string): Record<string, AttributeValue> => {
  const item: Record<string, AttributeValue> = {};

  item[dynmrIdAttrName] = { S: dynmrId };
  item[entNameAttrName] = { S: entName };

  for (const propName in entSchema) {
    const attrName = newAttributeName(entName, propName);
    if (!(propName in ent)) continue;
    const propValue = ent[propName as unknown as keyof InferEnt<E>];
    item[attrName] = marshallValue(propValue);
  }

  return item;
};
