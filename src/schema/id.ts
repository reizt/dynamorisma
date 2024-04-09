import { randomInt } from 'node:crypto';

export const dynmrIdAttrName = '__dynmrId';
export const entNameAttrName = '__entName';

const randomString = (chars: string[], len: number): string => {
  let string = '';
  for (let i = 0; i < len; i++) {
    string += chars[randomInt(0, chars.length)];
  }
  return string;
};

const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];

export const newDynmrId = () => randomString(chars, 8);
