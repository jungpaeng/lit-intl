import { type NestedValueOf } from './nested-value-of';

export type MessageKey<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string ? Property : never;
}[Keys];
