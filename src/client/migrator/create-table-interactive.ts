import type { DynamorismaContext } from '../../context';
import { askUntilValid } from '../utils/cli';

const question = {
	billingMode: 'Select billing mode: 1) PAY_PER_REQUEST, 2) PROVISIONED: ',
	readCapacityUnits: 'Enter read capacity units: ',
	writeCapacityUnits: 'Enter write capacity units: ',
};
const invalidMessage = {
	billingMode: 'Select 1 or 2.',
	readCapacityUnits: 'Enter a positive integer.',
	writeCapacityUnits: 'Enter a positive integer.',
};

type Output = {
	billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
	readCapacityUnits?: number;
	writeCapacityUnits?: number;
};

export const askCreateTableInputInteractively = async (ctx: DynamorismaContext): Promise<Output> => {
	const billingMode = await askUntilValid(
		question.billingMode,
		(input): input is '1' | '2' => {
			return input === '1' || input === '2';
		},
		invalidMessage.billingMode,
	);

	let readCapacityUnits: string | undefined;
	let writeCapacityUnits: string | undefined;

	if (billingMode === '2') {
		readCapacityUnits = await askUntilValid(
			question.readCapacityUnits,
			(input): input is string => {
				return /^[1-9]\d*$/.test(input);
			},
			invalidMessage.readCapacityUnits,
		);
		writeCapacityUnits = await askUntilValid(
			question.writeCapacityUnits,
			(input): input is string => {
				return /^[1-9]\d*$/.test(input);
			},
			invalidMessage.writeCapacityUnits,
		);
	}

	return {
		billingMode: ({ 1: 'PAY_PER_REQUEST', 2: 'PROVISIONED' } as const)[billingMode],
		readCapacityUnits: readCapacityUnits != null ? Number(readCapacityUnits) : undefined,
		writeCapacityUnits: writeCapacityUnits != null ? Number(writeCapacityUnits) : undefined,
	};
};
