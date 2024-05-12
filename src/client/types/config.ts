export type EntConfig = Record<string, PropConfig>;
export type PropConfig = {
  optional?: true;
  gsi?: { readCapacityUnits?: number; writeCapacityUnits?: number };
} & (
  | {
      type: 'S';
      enum?: readonly string[];
    }
  | {
      type: 'SS';
      enum?: readonly string[];
    }
  | {
      type: 'N';
      enum?: readonly number[];
    }
  | {
      type: 'NS';
      enum?: readonly number[];
    }
  | {
      type: 'BOOL';
    }
  | {
      type: 'B';
    }
  | {
      type: 'BS';
    }
  | {
      type: 'L';
      items: PropConfig;
    }
  | {
      type: 'M';
      props: Record<string, PropConfig>;
    }
);

export type InferEnt<E extends EntConfig> = {
  [K in keyof E as E[K]['optional'] extends true ? never : K]: InferProp<E[K]>;
} & {
  [K in keyof E as E[K]['optional'] extends true ? K : never]?: InferProp<E[K]>;
};

export type InferProp<P extends PropConfig> =
  | (P extends { optional: true } ? undefined : never)
  | (P extends { type: 'S' }
      ? P['enum'] extends readonly (infer R)[]
        ? R
        : string
      : P extends { type: 'N' }
        ? P['enum'] extends readonly (infer R)[]
          ? R
          : number
        : P extends { type: 'BOOL' }
          ? boolean
          : P extends { type: 'B' }
            ? Uint8Array
            : P extends { type: 'SS' }
              ? P['enum'] extends readonly (infer R)[]
                ? R[]
                : string[]
              : P extends { type: 'NS' }
                ? P['enum'] extends readonly (infer R)[]
                  ? R[]
                  : number[]
                : P extends { type: 'BS' }
                  ? Uint8Array[]
                  : P extends { type: 'L' }
                    ? InferProp<P['items']>[]
                    : P extends { type: 'M' }
                      ? {
                          [K in keyof P['props'] as P['props'][K]['optional'] extends true ? never : K]: InferProp<P['props'][K]>;
                        } & {
                          [K in keyof P['props'] as P['props'][K]['optional'] extends true ? K : never]?: InferProp<P['props'][K]>;
                        }
                      : never);
