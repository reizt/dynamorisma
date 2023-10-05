import type { AttributeValue } from '@aws-sdk/client-dynamodb';

type TypedAttributeValue<V> = V extends string
  ? AttributeValue.SMember
  : V extends number
  ? AttributeValue.NMember
  : V extends boolean
  ? AttributeValue.BOOLMember
  : V extends Uint8Array
  ? AttributeValue.BMember
  : V extends string[]
  ? AttributeValue.SSMember
  : V extends number[]
  ? AttributeValue.NSMember
  : V extends Uint8Array[]
  ? AttributeValue.BSMember
  : V extends any[]
  ? AttributeValue.LMember
  : V extends Record<string, any>
  ? AttributeValue.MMember
  : AttributeValue.NULLMember;

export const marshallValue = <V>(value: V): TypedAttributeValue<V> => {
  if (value == null) {
    return { NULL: true } as TypedAttributeValue<V>;
  }

  if (typeof value === 'string') {
    return { S: value as string } as TypedAttributeValue<V>;
  }

  if (typeof value === 'number') {
    return { N: String(value) } as TypedAttributeValue<V>;
  }

  if (typeof value === 'boolean') {
    return { BOOL: value as boolean } as TypedAttributeValue<V>;
  }

  if (value instanceof Uint8Array) {
    return { B: value as Uint8Array } as TypedAttributeValue<V>;
  }

  if (Array.isArray(value)) {
    const isS = value.every((v): v is string => typeof v === 'string');
    if (isS) {
      return { SS: value as string[] } as TypedAttributeValue<V>;
    }

    const isN = value.every((v): v is number => typeof v === 'number');
    if (isN) {
      return { NS: value.map(String) } as TypedAttributeValue<V>;
    }

    const isB = value.every((v): v is Uint8Array => v instanceof Uint8Array);
    if (isB) {
      return { BS: value as Uint8Array[] } as TypedAttributeValue<V>;
    }

    return { L: value.map((v) => marshallValue(v)) } as TypedAttributeValue<V>;
  }

  if (typeof value === 'object') {
    const obj: Record<string, AttributeValue> = {};
    for (const key in value) {
      obj[key] = marshallValue(value[key]);
    }
    return { M: obj } as TypedAttributeValue<V>;
  }

  throw new Error(`marshallValue: unknown value ${JSON.stringify(value)}`);
};
