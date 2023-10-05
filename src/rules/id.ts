import { randomBytes } from 'node:crypto';

export const dynmrIdAttrName = '__dynmrId';
export const entNameAttrName = '__entName';

const len = 8;

export const newDynmrId = (): string => {
  const idChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
  let buf = randomBytes(len);
  // randomBytes may return less than len buf
  while (buf.length < len) {
    buf = randomBytes(len);
  }
  const residues: number[] = [];
  for (let i = 0; i < len; i++) {
    residues.push(buf[i]! & (idChars.length - 1));
  }
  return residues.map((c) => idChars.charAt(c)).join('');
};
