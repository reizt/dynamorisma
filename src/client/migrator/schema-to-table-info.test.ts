import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import type { DynamorismaSchema } from '../types/repo';
import { schemaToTableInfo } from './schema-to-table-info';
import type { TableInfo } from './types';

describe(schemaToTableInfo.name, () => {
	it('should work', () => {
		const schema: DynamorismaSchema = {
			entX: {
				propS: { type: 'S', gsi: { readCapacityUnits: 5, writeCapacityUnits: 2 } },
				propN: { type: 'N' },
				propB: { type: 'B', gsi: { readCapacityUnits: 0, writeCapacityUnits: 0 } },
				propM: { type: 'M', props: { propMpropS: { type: 'S' } } },
			},
		};
		const actual = schemaToTableInfo(schema);
		const want: TableInfo = {
			attributes: [
				{ name: dynamorismaIdAttrName, type: 'S' },
				{ name: entNameAttrName, type: 'S' },
				{ name: 'entX_propS', type: 'S' },
				{ name: 'entX_propB', type: 'B' },
			],
			indexes: [
				{
					name: 'entName_gsi',
					hashKey: entNameAttrName,
					readCapacityUnits: 0,
					writeCapacityUnits: 0,
				},
				{
					name: 'entX_propS_gsi',
					hashKey: entNameAttrName,
					rangeKey: 'entX_propS',
					readCapacityUnits: 5,
					writeCapacityUnits: 2,
				},
				{
					name: 'entX_propB_gsi',
					hashKey: entNameAttrName,
					rangeKey: 'entX_propB',
					readCapacityUnits: 0,
					writeCapacityUnits: 0,
				},
			],
		};
		expect(actual).toEqual(want);
	});
});
