export interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

export interface Attribute {
  skill: string;
  level: number;
}

export const metadataBuilder = (metadata: Partial<Metadata>): Metadata => ({
  name: '',
  description: '',
  image: '',
  attributes: [],
  ...metadata,
});

export const attributeBuilder = (attribute: Partial<Attribute>): Attribute => ({
  skill: '',
  level: 0,
  ...attribute,
});
