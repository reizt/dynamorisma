import { sayHello } from './hello';

describe(sayHello.name, () => {
  it('contains name', () => {
    const name = 'John';
    const message = sayHello(name);
    expect(message.includes(name)).toBe(true);
  });
});
