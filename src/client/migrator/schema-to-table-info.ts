import type { ScalarAttributeType } from '@aws-sdk/client-dynamodb';
import { newAttributeName } from '../../schema/attribute';
import { entNameGsiName, newGsiName } from '../../schema/gsi';
import { dynamorismaIdAttrName, entNameAttrName } from '../../schema/id';
import type { DynamorismaSchema } from '../types/repo';
import type { AttributeType, TableInfo, TableInfoAttribute, TableInfoIndex } from './types';

const isScalarType = (type: AttributeType): type is ScalarAttributeType => {
	return ['B', 'S', 'N'].includes(type);
};

export const schemaToTableInfo = (schema: DynamorismaSchema): TableInfo => {
	const attributes: TableInfoAttribute[] = [];
	const indexes: TableInfoIndex[] = [];

	attributes.push({ name: dynamorismaIdAttrName, type: 'S' }, { name: entNameAttrName, type: 'S' });
	indexes.push({ name: entNameGsiName, hashKey: entNameAttrName, readCapacityUnits: 0, writeCapacityUnits: 0 });

	for (const entName in schema) {
		const entConfig = schema[entName]!;
		for (const propName in entConfig) {
			const propConfig = entConfig[propName]!;
			if (propConfig.gsi == null) continue;

			const attrName = newAttributeName(entName, propName);
			const gsiName = newGsiName(entName, propName);

			if (!isScalarType(propConfig.type)) continue;

			attributes.push({ name: attrName, type: propConfig.type });
			indexes.push({
				name: gsiName,
				hashKey: entNameAttrName,
				rangeKey: attrName,
				readCapacityUnits: propConfig.gsi.readCapacityUnits,
				writeCapacityUnits: propConfig.gsi.writeCapacityUnits,
			});
		}
	}

	return { attributes, indexes };
};
