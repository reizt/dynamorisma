import { calcTableDiff } from './calc-table-diff';
import type { TableDiff, TableInfo } from './types';

describe(calcTableDiff.name, () => {
	test('no changes', () => {
		const x: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'S' },
				{ name: 'bar', type: 'N' },
			],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const y: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'S' },
				{ name: 'bar', type: 'N' },
			],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: { added: [], removed: [], changed: [] },
		};
		expect(actual).toEqual(want);
	});
	test('add attribute', () => {
		const x: TableInfo = {
			attributes: [{ name: 'foo', type: 'S' }],
			indexes: [],
		};
		const y: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'S' },
				{ name: 'bar', type: 'N' },
			],
			indexes: [],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: {
				added: [{ name: 'bar', type: 'N' }],
				removed: [],
				changed: [],
			},
			indexes: { added: [], removed: [], changed: [] },
		};
		expect(actual).toEqual(want);
	});
	test('remove attribute', () => {
		const x: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'S' },
				{ name: 'bar', type: 'N' },
			],
			indexes: [],
		};
		const y: TableInfo = {
			attributes: [{ name: 'foo', type: 'S' }],
			indexes: [],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: {
				added: [],
				removed: [{ name: 'bar', type: 'N' }],
				changed: [],
			},
			indexes: { added: [], removed: [], changed: [] },
		};
		expect(actual).toEqual(want);
	});
	test('change attribute type', () => {
		const x: TableInfo = {
			attributes: [{ name: 'foo', type: 'S' }],
			indexes: [],
		};
		const y: TableInfo = {
			attributes: [{ name: 'foo', type: 'N' }],
			indexes: [],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: {
				added: [],
				removed: [],
				changed: [{ name: 'foo', oldType: 'S', newType: 'N' }],
			},
			indexes: { added: [], removed: [], changed: [] },
		};
		expect(actual).toEqual(want);
	});
	test('add index', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
					},
				],
				removed: [],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
	test('remove index', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [],
				removed: [{ name: 'foo-bar-index', hashKey: 'foo', rangeKey: 'bar' }],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
	test('change index hash key', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'bar',
					rangeKey: 'foo',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [
					{
						name: 'foo-bar-index',
						hashKey: 'bar',
						rangeKey: 'foo',
					},
				],
				removed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
					},
				],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
	test('change index range key', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'foo',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'foo',
					},
				],
				removed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
					},
				],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
	test('change index throughput', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
					readCapacityUnits: 1,
					writeCapacityUnits: 1,
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
					readCapacityUnits: 2,
					writeCapacityUnits: 2,
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [],
				removed: [],
				changed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
						old: {
							readCapacityUnits: 1,
							writeCapacityUnits: 1,
						},
						new: {
							readCapacityUnits: 2,
							writeCapacityUnits: 2,
						},
					},
				],
			},
		};
		expect(actual).toEqual(want);
	});
	test('delete index throughput', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
					readCapacityUnits: 1,
					writeCapacityUnits: 1,
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [],
				removed: [],
				changed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
						old: {
							readCapacityUnits: 1,
							writeCapacityUnits: 1,
						},
						new: {
							readCapacityUnits: undefined,
							writeCapacityUnits: undefined,
						},
					},
				],
			},
		};
		expect(actual).toEqual(want);
	});
	test('force recreate index for new keys even throughput changed', () => {
		const x: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
					readCapacityUnits: 1,
					writeCapacityUnits: 1,
				},
			],
		};
		const y: TableInfo = {
			attributes: [],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'bar',
					rangeKey: 'foo',
					readCapacityUnits: 2,
					writeCapacityUnits: 2,
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: { added: [], removed: [], changed: [] },
			indexes: {
				added: [
					{
						name: 'foo-bar-index',
						hashKey: 'bar',
						rangeKey: 'foo',
						readCapacityUnits: 2,
						writeCapacityUnits: 2,
					},
				],
				removed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
						readCapacityUnits: 1,
						writeCapacityUnits: 1,
					},
				],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
	test('combined', () => {
		const x: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'S' },
				{ name: 'bar', type: 'N' },
			],
			indexes: [
				{
					name: 'foo-bar-index',
					hashKey: 'foo',
					rangeKey: 'bar',
				},
			],
		};
		const y: TableInfo = {
			attributes: [
				{ name: 'foo', type: 'N' },
				{ name: 'baz', type: 'S' },
			],
			indexes: [
				{
					name: 'foo-baz-index',
					hashKey: 'foo',
					rangeKey: 'baz',
				},
			],
		};
		const actual = calcTableDiff(x, y);
		const want: TableDiff = {
			attributes: {
				added: [{ name: 'baz', type: 'S' }],
				removed: [{ name: 'bar', type: 'N' }],
				changed: [{ name: 'foo', oldType: 'S', newType: 'N' }],
			},
			indexes: {
				added: [
					{
						name: 'foo-baz-index',
						hashKey: 'foo',
						rangeKey: 'baz',
					},
				],
				removed: [{ name: 'foo-bar-index', hashKey: 'foo', rangeKey: 'bar' }],
				changed: [],
			},
		};
		expect(actual).toEqual(want);
	});
});
