import { unmarshallValue } from './unmarshall';

describe(unmarshallValue.name, () => {
	it('marshalls null', () => {
		const value = { NULL: true };
		expect(unmarshallValue(value)).toEqual(undefined);
	});
	it('marshalls BOOL', () => {
		const value = { BOOL: true };
		expect(unmarshallValue(value)).toEqual(true);
	});
	it('marshalls S', () => {
		const value = { S: 'foo' };
		expect(unmarshallValue(value)).toEqual('foo');
	});
	it('marshalls N', () => {
		const value = { N: '123' };
		expect(unmarshallValue(value)).toEqual(123);
	});
	it('marshalls B', () => {
		const value = { B: new Uint8Array([1, 2, 3]) };
		expect(unmarshallValue(value)).toEqual(new Uint8Array([1, 2, 3]));
	});
	it('marshalls SS', () => {
		const value = { SS: ['foo', 'bar'] };
		expect(unmarshallValue(value)).toEqual(['foo', 'bar']);
	});
	it('marshalls NS', () => {
		const value = { NS: ['123', '456'] };
		expect(unmarshallValue(value)).toEqual([123, 456]);
	});
	it('marshalls BS', () => {
		const value = { BS: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])] };
		expect(unmarshallValue(value)).toEqual([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])]);
	});
	it('marshalls L', () => {
		const value = { L: [{ S: 'foo' }, { N: '123' }, { B: new Uint8Array([1, 2, 3]) }] };
		expect(unmarshallValue(value)).toEqual(['foo', 123, new Uint8Array([1, 2, 3])]);
	});
	it('marshalls M', () => {
		const value = { M: { foo: { S: 'bar' }, baz: { N: '123' } } };
		expect(unmarshallValue(value)).toEqual({ foo: 'bar', baz: 123 });
	});
});
