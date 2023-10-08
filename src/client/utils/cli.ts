import { createInterface } from 'node:readline/promises';

export const question = async (question: string): Promise<string> => {
  const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await readlineInterface.question(question);
  readlineInterface.close();
  return answer;
};

export const confirm = async (msg: string) => {
  const answer = await question(`${msg}(y/n): `);
  return answer.trim().toLowerCase() === 'y';
};

export const askUntilValid = async <V extends string>(question: string, validator: (input: string) => input is V, invalidMessage: string): Promise<V> => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  let input = await readline.question(question);
  while (!validator(input)) {
    console.log(invalidMessage);
    input = await readline.question(question);
  }
  readline.close();
  return input;
};
