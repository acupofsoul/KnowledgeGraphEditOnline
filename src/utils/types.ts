export interface Property {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
}

export interface Concept {
  id: string;
  name: string;
  properties: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipType {
  id: string;
  name: string;
  properties: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface Node {
  id: string;
  conceptId: string;
  properties: Record<string, any>;
  position: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  relationshipTypeId: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Graph {
  concepts: Concept[];
  relationshipTypes: RelationshipType[];
  nodes: Node[];
  relationships: Relationship[];
}

export type GraphElement = Node | Relationship;
