export type Relationship = {
  links: {
    related: string;
  };
};

export type RelationshipList<T extends string> = Record<T, Relationship>;
