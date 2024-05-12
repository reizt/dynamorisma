import { newDynmrId } from './id';

describe(newDynmrId.name, () => {
	it('generates a random string with the correct length', () => {
		const id = newDynmrId();
		expect(id.length).toEqual(8);
	});
});
