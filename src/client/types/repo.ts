import type { EntConfig, InferEnt, InferProp, PropConfig } from './config';

export type DynmrSchema = Record<string, EntConfig>;
export type Dynmr<S extends DynmrSchema> = {
  [E in keyof S]: EntRepo<S[E]>;
};

export type EntRepo<E extends EntConfig> = {
  collect: (input: CollectIn<E>) => Promise<InferEntWithId<E>[]>;
  pick: (input: PickIn<E>) => Promise<InferEntWithId<E> | null>;
  create: (input: InferEnt<E>) => Promise<InferEntWithId<E>>;
  createBatch: (input: InferEnt<E>[]) => Promise<InferEntWithId<E>[]>;
  update: (input: InferEntWithId<E>) => Promise<InferEntWithId<E>>;
  updateBatch: (input: InferEntWithId<E>[]) => Promise<InferEntWithId<E>[]>;
  del: (dynmrId: string) => Promise<void>;
  delBatch: (dynmrIds: string[]) => Promise<void>;
};

export type DynmrIdInfo = { __dynmrId: string };
export type InferEntWithId<E extends EntConfig> = InferEnt<E> & DynmrIdInfo;

export type AvailableGsiPropName<E extends EntConfig> = keyof {
  [K in keyof E as E[K]['gsi'] extends undefined ? never : K]: K;
};

export type CollectIn<E extends EntConfig> = {
  where?: Where<E>;
  scanLimit?: number;
  gsi?: AvailableGsiPropName<E>;
};

export type PickIn<E extends EntConfig> = {
  where: Where<E>;
  scanLimit?: number;
  gsi?: AvailableGsiPropName<E>;
};

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
