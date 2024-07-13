import { newDynamorismaId } from './id';

describe(newDynamorismaId.name, () => {
	it('generates a random string with the correct length', () => {
		const id = newDynamorismaId();
		expect(id.length).toEqual(8);
	});
});
