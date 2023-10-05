import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { EntConfig, EntName, InferEnt, InferProp, PropConfig } from './config';

export type DynmrSchema = Record<EntName, EntConfig>;
export type Dynmr<S extends DynmrSchema> = {
  [E in keyof S]: EntRepo<S[E]>;
};

export type EntRepo<E extends EntConfig> = {
  collect: (input: CollectIn<E>) => Promise<CollectOut<E>>;
  pick: (input: PickIn<E>) => Promise<PickOut<E>>;
  put: (input: PutIn<E>) => Promise<PutOut<E>>;
  putBatch: (input: PutManyIn<E>) => Promise<PutManyOut<E>>;
  del: (input: DelIn<E>) => Promise<DelOut<E>>;
  delBatch: (input: DelManyIn<E>) => Promise<DelManyOut<E>>;
};

export type CollectIn<E extends EntConfig> = {
  where?: Where<E>;
  limit?: number;
  exclusiveStartKey?: AttributeValue;
};
export type CollectOut<E extends EntConfig> = {
  entities: InferEnt<E>[];
  dynmrIds: string[];
  lastEvaluatedKey?: AttributeValue;
};

export type PickIn<E extends EntConfig> = {
  where: Where<E>;
};
export type PickOut<E extends EntConfig> = {
  entity: InferEnt<E> | null;
  dynmrId: string | null;
};

export type PutIn<E extends EntConfig> = {
  ent: InferEnt<E>;
};
// eslint-disable-next-line no-unused-vars
export type PutOut<E extends EntConfig> = {
  dynmrId: string;
};

export type PutManyIn<E extends EntConfig> = {
  entities: InferEnt<E>[];
};
// eslint-disable-next-line no-unused-vars
export type PutManyOut<E extends EntConfig> = {
  dynmrIds: string[];
};

// eslint-disable-next-line no-unused-vars
export type DelIn<E extends EntConfig> = {
  dynmrId: string;
};
// eslint-disable-next-line no-unused-vars
export type DelOut<E extends EntConfig> = void;

// eslint-disable-next-line no-unused-vars
export type DelManyIn<E extends EntConfig> = {
  dynmrIds: string[];
};
// eslint-disable-next-line no-unused-vars
export type DelManyOut<E extends EntConfig> = void;

type NeverObj<T extends Record<string, any>> = {
  [K in keyof T]: never;
};
type KeysHavingIntersect<X extends Record<string, any>, Y extends Record<string, any>> = (X & NeverObj<Y>) | (Y & NeverObj<X>);

export type Where<E extends EntConfig> = KeysHavingIntersect<
  {
    [K in keyof E]?: Filter<E[K]>;
  },
  {
    AND?: Where<E>[];
    OR?: Where<E>[];
    NOT?: Where<E>;
  }
>;

export type Filter<P extends PropConfig> = {
  // DynamoDB supports eq, ne for comparable types
  eq?: InferProp<P>;
  ne?: InferProp<P>;
  in?: InferProp<P>[];
} & (P extends { type: 'S' }
  ? {
      // DynamoDB supports beginsWith for string
      beginsWith?: string;
      contains?: string;
    }
  : P extends { type: 'N' }
  ? {
      // DynamoDB supports gt, gte, lt, lte, between for number
      gt?: InferProp<P>;
      gte?: InferProp<P>;
      lt?: InferProp<P>;
      lte?: InferProp<P>;
      between?: [InferProp<P>, InferProp<P>];
    }
  : {});
