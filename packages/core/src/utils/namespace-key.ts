import { type NestedValueOf } from './nested-value-of';

export type NamespaceKey<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string ? never : Property;
}[Keys];
