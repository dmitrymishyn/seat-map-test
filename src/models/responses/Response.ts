import { RelationshipList } from './RelationshipsResponse';

export type Response<T> = {
  data: T;
  jsonapi: {
    version: string;
  };
  links: Record<'up' | 'self', string>;
};

export type Attributes<T extends string, K extends object, R extends null | RelationshipList<string> = null> = {
  id: string;
  type: T;
  links: Record<'self', string>;
  attributes: K;
  relationships: R;
  version?: string;
};
