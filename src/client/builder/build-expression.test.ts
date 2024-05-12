import { buildExpression } from './build-expression';

describe(buildExpression.name, () => {
	describe('opers', () => {
		test('attribute_exists', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'attribute_exists' },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.expression).toEqual('attribute_exists (#foo_bar)');
		});
		test('attribute_not_exists', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'attribute_not_exists' },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.expression).toEqual('attribute_not_exists (#foo_bar)');
		});
		test('attribute_type', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'attribute_type', type: 'S' },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'S' } });
			expect(q.expression).toEqual('attribute_type (#foo_bar, :foo_bar)');
		});
		test('=', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '=', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar = :foo_bar');
		});
		test('<>', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '<>', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar <> :foo_bar');
		});
		test('<', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '<', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar < :foo_bar');
		});
		test('<=', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '<=', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar <= :foo_bar');
		});
		test('>', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '>', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar > :foo_bar');
		});
		test('>=', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '>=', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('#foo_bar >= :foo_bar');
		});
		test('size', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: '=', computedValue: 'size', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.expression).toEqual('size(#foo_bar) = :foo_bar');
		});
		test('begins_with', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'begins_with', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('begins_with(#foo_bar, :foo_bar)');
		});
		test('contains', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'contains', value: { S: 'baz' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar': { S: 'baz' } });
			expect(q.expression).toEqual('contains(#foo_bar, :foo_bar)');
		});
		test('between', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'between', valueFrom: { S: 'baz' }, valueTo: { S: 'qux' } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar_from': { S: 'baz' }, ':foo_bar_to': { S: 'qux' } });
			expect(q.expression).toEqual('#foo_bar BETWEEN :foo_bar_from AND :foo_bar_to');
		});
		test('in', () => {
			const q = buildExpression({
				condition: { attrName: 'foo_bar', opr: 'in', valueIn: { SS: ['baz', 'qux'] } },
			});
			expect(q.names).toEqual({ '#foo_bar': 'foo_bar' });
			expect(q.values).toEqual({ ':foo_bar_0': { S: 'baz' }, ':foo_bar_1': { S: 'qux' } });
			expect(q.expression).toEqual('#foo_bar IN (:foo_bar_0, :foo_bar_1)');
		});
	});
	describe('multiple conditions', () => {
		test('and', () => {
			const q = buildExpression({
				and: [
					{
						condition: {
							attrName: 'foo',
							opr: '=',
							value: { S: 'bar' },
						},
					},
					{
						condition: {
							attrName: 'baz',
							opr: '=',
							value: { S: 'qux' },
						},
					},
				],
			});
			expect(q.names).toEqual({ '#foo': 'foo', '#baz': 'baz' });
			expect(q.values).toEqual({ ':foo': { S: 'bar' }, ':baz': { S: 'qux' } });
			expect(q.expression).toEqual('(#foo = :foo) AND (#baz = :baz)');
		});
		test('or', () => {
			const q = buildExpression({
				or: [
					{
						condition: {
							attrName: 'foo',
							opr: '=',
							value: { S: 'bar' },
						},
					},
					{
						condition: {
							attrName: 'baz',
							opr: '=',
							value: { S: 'qux' },
						},
					},
				],
			});
			expect(q.names).toEqual({ '#foo': 'foo', '#baz': 'baz' });
			expect(q.values).toEqual({ ':foo': { S: 'bar' }, ':baz': { S: 'qux' } });
			expect(q.expression).toEqual('(#foo = :foo) OR (#baz = :baz)');
		});
		test('not', () => {
			const q = buildExpression({
				not: {
					condition: {
						attrName: 'foo',
						opr: '=',
						value: { S: 'bar' },
					},
				},
			});
			expect(q.names).toEqual({ '#foo': 'foo' });
			expect(q.values).toEqual({ ':foo': { S: 'bar' } });
			expect(q.expression).toEqual('NOT (#foo = :foo)');
		});
		test('nested and', () => {
			const q = buildExpression({
				and: [
					{
						condition: {
							attrName: 'foo',
							opr: '=',
							value: { S: 'bar' },
						},
					},
					{
						and: [
							{
								condition: {
									attrName: 'baz',
									opr: '=',
									value: { S: 'qux' },
								},
							},
							{
								condition: {
									attrName: 'quux',
									opr: '=',
									value: { S: 'corge' },
								},
							},
						],
					},
				],
			});
			expect(q.names).toEqual({ '#foo': 'foo', '#baz': 'baz', '#quux': 'quux' });
			expect(q.values).toEqual({ ':foo': { S: 'bar' }, ':baz': { S: 'qux' }, ':quux': { S: 'corge' } });
			expect(q.expression).toEqual('(#foo = :foo) AND ((#baz = :baz) AND (#quux = :quux))');
		});
	});
});
