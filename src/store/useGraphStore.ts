import { create } from 'zustand';
import { Concept, RelationshipType, Node, Relationship, Graph } from '../utils/types';

interface GraphStore {
  // 数据
  graph: Graph;
  
  // 概念相关操作
  addConcept: (concept: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConcept: (id: string, updates: Partial<Concept>) => void;
  deleteConcept: (id: string) => void;
  
  // 关系类型相关操作
  addRelationshipType: (relationshipType: Omit<RelationshipType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRelationshipType: (id: string, updates: Partial<RelationshipType>) => void;
  deleteRelationshipType: (id: string) => void;
  
  // 节点相关操作
  addNode: (node: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  
  // 关系相关操作
  addRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  
  // 数据导入导出
  importGraph: (graph: Graph) => void;
  exportGraph: () => Graph;
  
  // 选择状态
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  // 初始数据
  graph: {
    concepts: [],
    relationshipTypes: [],
    nodes: [],
    relationships: [],
  },
  
  // 概念操作
  addConcept: (concept) => set((state) => ({
    graph: {
      ...state.graph,
      concepts: [...state.graph.concepts, {
        ...concept,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    },
  })),
  
  updateConcept: (id, updates) => set((state) => ({
    graph: {
      ...state.graph,
      concepts: state.graph.concepts.map((concept) => 
        concept.id === id 
          ? { ...concept, ...updates, updatedAt: new Date().toISOString() }
          : concept
      ),
    },
  })),
  
  deleteConcept: (id) => set((state) => ({
    graph: {
      ...state.graph,
      concepts: state.graph.concepts.filter((concept) => concept.id !== id),
      nodes: state.graph.nodes.filter((node) => node.conceptId !== id),
    },
  })),
  
  // 关系类型操作
  addRelationshipType: (relationshipType) => set((state) => ({
    graph: {
      ...state.graph,
      relationshipTypes: [...state.graph.relationshipTypes, {
        ...relationshipType,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    },
  })),
  
  updateRelationshipType: (id, updates) => set((state) => ({
    graph: {
      ...state.graph,
      relationshipTypes: state.graph.relationshipTypes.map((type) => 
        type.id === id 
          ? { ...type, ...updates, updatedAt: new Date().toISOString() }
          : type
      ),
    },
  })),
  
  deleteRelationshipType: (id) => set((state) => ({
    graph: {
      ...state.graph,
      relationshipTypes: state.graph.relationshipTypes.filter((type) => type.id !== id),
      relationships: state.graph.relationships.filter((rel) => rel.relationshipTypeId !== id),
    },
  })),
  
  // 节点操作
  addNode: (node) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: [...state.graph.nodes, {
        ...node,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    },
  })),
  
  updateNode: (id, updates) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map((node) => 
        node.id === id 
          ? { ...node, ...updates, updatedAt: new Date().toISOString() }
          : node
      ),
    },
  })),
  
  deleteNode: (id) => set((state) => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.filter((node) => node.id !== id),
      relationships: state.graph.relationships.filter(
        (rel) => rel.source !== id && rel.target !== id
      ),
    },
  })),
  
  // 关系操作
  addRelationship: (relationship) => set((state) => ({
    graph: {
      ...state.graph,
      relationships: [...state.graph.relationships, {
        ...relationship,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    },
  })),
  
  updateRelationship: (id, updates) => set((state) => ({
    graph: {
      ...state.graph,
      relationships: state.graph.relationships.map((rel) => 
        rel.id === id 
          ? { ...rel, ...updates, updatedAt: new Date().toISOString() }
          : rel
      ),
    },
  })),
  
  deleteRelationship: (id) => set((state) => ({
    graph: {
      ...state.graph,
      relationships: state.graph.relationships.filter((rel) => rel.id !== id),
    },
  })),
  
  // 数据导入导出
  importGraph: (graph) => set({ graph }),
  exportGraph: () => get().graph,
  
  // 选择状态
  selectedElement: null,
  setSelectedElement: (id) => set({ selectedElement: id }),
}));
