import type { EntConfig, InferEnt, InferProp, PropConfig } from './config';

export type DynmrSchema = Record<string, EntConfig>;
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
  scanLimit?: number;
  gsi?: AvailableGsiPropName<E>;
};
export type CollectOut<E extends EntConfig> = {
  entities: InferEnt<E>[];
  dynmrIds: string[];
};
export type AvailableGsiPropName<E extends EntConfig> = keyof {
  [K in keyof E as E[K]['gsi'] extends true ? K : never]: K;
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

type Obj = Record<string, unknown>;
type Nev<T extends Obj> = { [K in keyof T]?: undefined };
type FourObjIntersect<X extends Obj, Y extends Obj, Z extends Obj, W extends Obj> =
  | (X & Nev<Y> & Nev<Z> & Nev<W>)
  | (Y & Nev<X> & Nev<Z> & Nev<W>)
  | (Z & Nev<X> & Nev<Y> & Nev<W>)
  | (W & Nev<X> & Nev<Y> & Nev<Z>);

export type Where<E extends EntConfig> = FourObjIntersect<
  // One of the following:
  { [K in keyof E]?: Filter<E[K]> },
  { AND: Where<E>[] },
  { OR: Where<E>[] },
  { NOT: Where<E> }
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
