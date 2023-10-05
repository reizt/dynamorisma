import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshallValue } from './marshall';

describe(marshallValue.name, () => {
  it('unmarshalls NULL', () => {
    const want: AttributeValue = { NULL: true };
    expect(marshallValue(null)).toEqual(want);
  });
  it('unmarshalls S', () => {
    const want: AttributeValue = { S: 'foo' };
    expect(marshallValue('foo')).toEqual(want);
  });
  it('unmarshalls N', () => {
    const want: AttributeValue = { N: '123' };
    expect(marshallValue(123)).toEqual(want);
  });
  it('unmarshalls BOOL', () => {
    const want: AttributeValue = { BOOL: true };
    expect(marshallValue(true)).toEqual(want);
  });
  it('unmarshalls B', () => {
    const value = new Uint8Array([1, 2, 3]);
    const want: AttributeValue = { B: value };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls SS', () => {
    const value = ['foo', 'bar'];
    const want: AttributeValue = { SS: value };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls NS', () => {
    const value = [123, 456];
    const want: AttributeValue = { NS: value.map(String) };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls BS', () => {
    const value = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
    const want: AttributeValue = { BS: value };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls L', () => {
    const value = ['foo', 123, new Uint8Array([1, 2, 3])];
    const want: AttributeValue = { L: value.map((v) => marshallValue(v)) };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls M', () => {
    const value = { foo: 'bar', baz: 123 };
    const want: AttributeValue = { M: { foo: { S: 'bar' }, baz: { N: '123' } } };
    expect(marshallValue(value)).toEqual(want);
  });
  it('unmarshalls nested M', () => {
    const value = { foo: { bar: 'baz' } };
    const want: AttributeValue = { M: { foo: { M: { bar: { S: 'baz' } } } } };
    expect(marshallValue(value)).toEqual(want);
  });
});
