import type { AttributeValue } from '@aws-sdk/client-dynamodb';

type AttributeType = keyof AttributeValue;

type TypedAttributeValue<V> = V extends string
	? AttributeValue.SMember
	: V extends number
		? AttributeValue.NMember
		: V extends boolean
			? AttributeValue.BOOLMember
			: V extends Uint8Array
				? AttributeValue.BMember
				: V extends any[]
					? AttributeValue.SSMember | AttributeValue.NSMember | AttributeValue.BSMember | AttributeValue.LMember
					: V extends object
						? AttributeValue.MMember
						: never;

export const marshallValue = <V>(value: V, asType: AttributeType = '$unknown'): TypedAttributeValue<V> => {
	const shouldForce = (type: AttributeType): boolean => asType === type || asType === '$unknown';

	if (value == null) {
		return { NULL: true } as unknown as TypedAttributeValue<V>;
	}

	if (typeof value === 'string') {
		return { S: value } as unknown as TypedAttributeValue<V>;
	}

	if (typeof value === 'number') {
		return { N: String(value) } as unknown as TypedAttributeValue<V>;
	}

	if (value instanceof Uint8Array) {
		return { B: value } as unknown as TypedAttributeValue<V>;
	}

	if (typeof value === 'boolean') {
		return { BOOL: value } as unknown as TypedAttributeValue<V>;
	}

	if (Array.isArray(value)) {
		const isS = value.every((v): v is string => typeof v === 'string');
		if (shouldForce('SS') && isS) {
			return { SS: value } as unknown as TypedAttributeValue<V>;
		}

		const isN = value.every((v): v is number => typeof v === 'number');
		if (shouldForce('NS') && isN) {
			return { NS: value.map(String) } as unknown as TypedAttributeValue<V>;
		}

		const isB = value.every((v): v is Uint8Array => v instanceof Uint8Array);
		if (shouldForce('BS') && isB) {
			return { BS: value } as unknown as TypedAttributeValue<V>;
		}

		return { L: value.map((v) => marshallValue(v)) } as unknown as TypedAttributeValue<V>;
	}

	if (typeof value === 'object') {
		const obj: Record<string, AttributeValue> = {};
		for (const key in value) {
			obj[key] = marshallValue(value[key]);
		}
		return { M: obj } as unknown as TypedAttributeValue<V>;
	}

	throw new Error(`marshallValue: unknown value ${JSON.stringify(value)}`);
};
