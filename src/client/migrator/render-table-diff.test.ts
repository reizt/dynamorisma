import { renderTableDiff } from './render-table-diff';
import type { TableDiff } from './types';

describe(renderTableDiff.name, () => {
	it('should render table diff', () => {
		const diff: TableDiff = {
			attributes: {
				added: [{ name: 'bar', type: 'N' }],
				removed: [{ name: 'foo', type: 'S' }],
				changed: [{ name: 'baz', oldType: 'S', newType: 'N' }],
			},
			indexes: {
				added: [{ name: 'foo-bar-index', hashKey: 'foo', rangeKey: 'bar' }],
				removed: [{ name: 'foo-baz-index', hashKey: 'foo', rangeKey: 'baz' }],
				changed: [
					{
						name: 'foo-bar-index',
						hashKey: 'foo',
						rangeKey: 'bar',
						old: { readCapacityUnits: 1, writeCapacityUnits: 1 },
						new: { readCapacityUnits: 2, writeCapacityUnits: 2 },
					},
				],
			},
		};
		renderTableDiff(diff);
	});
});
