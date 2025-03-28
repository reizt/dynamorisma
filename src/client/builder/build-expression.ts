import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshallValue } from '../utils/marshall';

type Obj = Record<string, unknown>;
type Nev<T extends Obj> = { [K in keyof T]?: undefined };
type FourObjIntersect<X extends Obj, Y extends Obj, Z extends Obj, W extends Obj> =
	| (X & Nev<Y> & Nev<Z> & Nev<W>)
	| (Y & Nev<X> & Nev<Z> & Nev<W>)
	| (Z & Nev<X> & Nev<Y> & Nev<W>)
	| (W & Nev<X> & Nev<Y> & Nev<Z>);
export type Conditions = FourObjIntersect<
	// One of the following:
	{ and: Conditions[] },
	{ or: Conditions[] },
	{ not: Conditions },
	{ condition: Condition }
>;

export type ConditionWithoutAttrName =
	| {
			opr: 'attribute_exists' | 'attribute_not_exists';
	  }
	| {
			opr: 'attribute_type';
			type: 'S' | 'SS' | 'N' | 'NS' | 'B' | 'BS' | 'BOOL' | 'L' | 'M';
	  }
	| {
			opr: '=' | '<>';
			value: AttributeValue;
			computedValue?: 'size';
	  }
	| {
			opr: '<' | '<=' | '>' | '>=';
			value: AttributeValue.NMember | AttributeValue.SMember;
			computedValue?: 'size';
	  }
	| {
			opr: 'begins_with' | 'contains';
			value: AttributeValue.SMember;
	  }
	| {
			opr: 'in';
			valueIn: AttributeValue.SSMember | AttributeValue.NSMember | AttributeValue.BSMember | AttributeValue.LMember;
	  }
	| {
			opr: 'between';
			valueFrom: AttributeValue.NMember | AttributeValue.SMember;
			valueTo: AttributeValue.NMember | AttributeValue.SMember;
	  };
export type Condition = {
	attrName: string;
} & ConditionWithoutAttrName;

type Output = {
	names: Record<string, string> | undefined;
	values: Record<string, AttributeValue> | undefined;
	expression: string | undefined;
};
export const buildExpression = (conds: Conditions): Output => {
	if (conds.not != null) {
		const q = buildExpression(conds.not);
		return {
			names: q.names,
			values: q.values,
			expression: q.expression != null ? `NOT (${q.expression})` : undefined,
		};
	}

	if (conds.and != null || conds.or != null) {
		let names: Record<string, string> = {};
		let values: Record<string, AttributeValue> = {};
		const expressions: string[] = [];
		for (const cond of (conds.and ?? conds.or)!) {
			const q = buildExpression(cond);
			names = { ...names, ...q.names };
			values = { ...values, ...q.values };
			if (q.expression != null) {
				expressions.push(q.expression);
			}
		}
		const glue = conds.and != null ? ' AND ' : ' OR ';
		const expression = expressions.map((exp) => `(${exp})`).join(glue);
		return disallowEmptyOutput({
			names,
			values,
			expression,
		});
	}

	const names: Record<string, string> = {};
	const values: Record<string, AttributeValue> = {};
	const opr = conds.condition.opr;

	const keyAlt = `#${conds.condition.attrName}`;
	names[keyAlt] = conds.condition.attrName;

	let expression: string;
	switch (opr) {
		case 'attribute_exists':
		case 'attribute_not_exists': {
			expression = `${opr} (${keyAlt})`;
			break;
		}
		case 'attribute_type': {
			const valueAlt = `:${conds.condition.attrName}`;
			values[valueAlt] = { S: conds.condition.type };
			expression = `${opr} (${keyAlt}, ${valueAlt})`;
			break;
		}
		case '=':
		case '<>':
		case '<':
		case '<=':
		case '>':
		case '>=': {
			const valueAlt = `:${conds.condition.attrName}`;
			values[valueAlt] = conds.condition.value;
			if (conds.condition.computedValue === 'size') {
				expression = `size(${keyAlt}) ${opr} ${valueAlt}`;
				break;
			}
			expression = `${keyAlt} ${opr} ${valueAlt}`;
			break;
		}
		case 'begins_with':
		case 'contains': {
			const valueAlt = `:${conds.condition.attrName}`;
			values[valueAlt] = conds.condition.value;
			expression = `${opr}(${keyAlt}, ${valueAlt})`;
			break;
		}
		case 'between': {
			const valueAltFrom = `:${conds.condition.attrName}_from`;
			const valueAltTo = `:${conds.condition.attrName}_to`;
			values[valueAltFrom] = conds.condition.valueFrom;
			values[valueAltTo] = conds.condition.valueTo;
			expression = `${keyAlt} BETWEEN ${valueAltFrom} AND ${valueAltTo}`;
			break;
		}
		case 'in': {
			const valueAlts: string[] = [];
			const valueAltPrefix = `:${conds.condition.attrName}`;
			const valueIn = conds.condition.valueIn.SS ?? conds.condition.valueIn.NS ?? conds.condition.valueIn.BS ?? conds.condition.valueIn.L;
			for (let i = 0; i < valueIn.length; i++) {
				const valueAlt = `${valueAltPrefix}_${i}`;
				values[valueAlt] = marshallValue(valueIn[i]!);
				valueAlts.push(valueAlt);
			}
			expression = `${keyAlt} IN (${valueAlts.join(', ')})`;
			break;
		}
		default:
			throw new Error(`Unsupported condition operator: ${opr}`);
	}

	return disallowEmptyOutput({
		names,
		values,
		expression,
	});
};

const disallowEmptyOutput = (output: Output): Output => {
	if (output.names != null && Object.keys(output.names).length === 0) {
		output.names = undefined;
	}
	if (output.values != null && Object.keys(output.values).length === 0) {
		output.values = undefined;
	}
	if (output.expression != null && output.expression.length === 0) {
		output.expression = undefined;
	}
	return { ...output };
};
