import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { newAttributeName } from '../../schema/attribute';
import type { EntConfig, InferEnt } from '../types/config';

export const unmarshallValue = (value: AttributeValue): any => {
  if (value.NULL != null) return undefined;
  if (value.BOOL != null) return value.BOOL;
  if (value.S != null) return value.S;
  if (value.N != null) return Number(value.N);
  if (value.B != null) return value.B;
  if (value.SS != null) return value.SS;
  if (value.NS != null) return value.NS.map(Number);
  if (value.BS != null) return value.BS;
  if (value.L != null) return value.L.map((v) => unmarshallValue(v));
  if (value.M != null) {
    const obj: Record<string, any> = {};
    for (const key in value.M) {
      obj[key] = unmarshallValue(value.M[key]!);
    }
    return obj;
  }
  throw new Error(`unmarshallValue: unknown value ${JSON.stringify(value)}`);
};

type Item = Record<string, AttributeValue>;
export const unmarshallEnt = <E extends EntConfig>(entName: string, entConfig: E, item: Item): InferEnt<E> => {
  const ent: InferEnt<E> = {} as any;
  for (const propName in entConfig) {
    const attrName = newAttributeName(entName, propName);
    ent[propName as unknown as keyof InferEnt<E>] = unmarshallValue(item[attrName] ?? { NULL: true });
  }
  return ent;
};
