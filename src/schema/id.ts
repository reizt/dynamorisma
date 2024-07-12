export const dynmrIdAttrName = '__dynmrId';
export const entNameAttrName = '__entName';

const randomString = (chars: string[], len: number): string => {
	const values = crypto.getRandomValues(new Uint32Array(len));
	return values.reduce((acc, cur) => acc + chars[cur % chars.length], '');
};

const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];

export const newDynmrId = () => randomString(chars, 8);
