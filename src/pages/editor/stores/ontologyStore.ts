import { create } from 'zustand';
import { NodeType, EdgeType, TypeGroup, Ontology } from '../types';

interface OntologyStore {
  // 状态
  ontology: Ontology;
  isLoading: boolean;
  error: string | null;
  
  // 操作
  addNodeType: (nodeType: Omit<NodeType, 'id' | 'createdAt' | 'updatedAt'>) => NodeType;
  addEdgeType: (edgeType: Omit<EdgeType, 'id' | 'createdAt' | 'updatedAt'>) => EdgeType;
  addTypeGroup: (typeGroup: Omit<TypeGroup, 'id' | 'createdAt' | 'updatedAt'>) => TypeGroup;
  updateNodeType: (id: string, updates: Partial<NodeType>) => void;
  updateEdgeType: (id: string, updates: Partial<EdgeType>) => void;
  updateTypeGroup: (id: string, updates: Partial<TypeGroup>) => void;
  deleteNodeType: (id: string) => void;
  deleteEdgeType: (id: string) => void;
  deleteTypeGroup: (id: string) => void;
  
  // 辅助方法
  getNodeTypeById: (id: string) => NodeType | undefined;
  getEdgeTypeById: (id: string) => EdgeType | undefined;
  getTypeGroupById: (id: string) => TypeGroup | undefined;
  getNodeTypesByGroup: (groupId: string) => NodeType[];
  getEdgeTypesByGroup: (groupId: string) => EdgeType[];
  
  // 导入/导出
  importOntology: (data: Ontology) => void;
  exportOntology: () => string;
  
  // 重置
  resetOntology: () => void;
}

// 初始本体数据
const initialOntology: Ontology = {
  id: 'default-ontology',
  name: '默认本体',
  description: '默认的知识图谱本体',
  nodeTypes: [
    {
      id: 'node-type-1',
      name: '实体',
      description: '基本实体类型',
      color: '#1890ff',
      shape: 'rect',
      defaultSize: 40,
      properties: [
        {
          id: 'prop-1',
          name: '名称',
          description: '实体名称',
          type: 'string',
          required: true,
          unique: false,
        },
        {
          id: 'prop-2',
          name: '描述',
          description: '实体描述',
          type: 'string',
          required: false,
          unique: false,
        },
      ],
      constraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'node-type-2',
      name: '概念',
      description: '抽象概念类型',
      color: '#52c41a',
      shape: 'circle',
      defaultSize: 36,
      properties: [
        {
          id: 'prop-3',
          name: '名称',
          description: '概念名称',
          type: 'string',
          required: true,
          unique: false,
        },
        {
          id: 'prop-4',
          name: '定义',
          description: '概念定义',
          type: 'string',
          required: false,
          unique: false,
        },
      ],
      constraints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  edgeTypes: [
    {
      id: 'edge-type-1',
      name: '关联',
      description: '基本关联关系',
      color: '#faad14',
      lineStyle: 'solid',
      defaultSize: 2,
      properties: [
        {
          id: 'prop-5',
          name: '名称',
          description: '关联名称',
          type: 'string',
          required: true,
          unique: false,
        },
        {
          id: 'prop-6',
          name: '强度',
          description: '关联强度',
          type: 'number',
          defaultValue: 1,
          required: false,
          unique: false,
          validation: {
            min: 0,
            max: 10,
          },
        },
      ],
      constraints: [],
      sourceTypes: [],
      targetTypes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'edge-type-2',
      name: '继承',
      description: '继承关系',
      color: '#722ed1',
      lineStyle: 'dashed',
      defaultSize: 2,
      properties: [
        {
          id: 'prop-7',
          name: '名称',
          description: '继承名称',
          type: 'string',
          required: true,
          unique: false,
        },
      ],
      constraints: [],
      sourceTypes: [],
      targetTypes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  typeGroups: [
    {
      id: 'group-1',
      name: '基本类型',
      description: '基本的节点和边类型',
      nodeTypeIds: ['node-type-1', 'node-type-2'],
      edgeTypeIds: ['edge-type-1', 'edge-type-2'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useOntologyStore = create<OntologyStore>((set, get) => ({
  // 初始状态
  ontology: initialOntology,
  isLoading: false,
  error: null,
  
  // 添加节点类型
  addNodeType: (nodeType) => {
    const newNodeType: NodeType = {
      ...nodeType,
      id: `node-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      ontology: {
        ...state.ontology,
        nodeTypes: [...state.ontology.nodeTypes, newNodeType],
        updatedAt: new Date().toISOString(),
      },
    }));
    
    return newNodeType;
  },
  
  // 添加边类型
  addEdgeType: (edgeType) => {
    const newEdgeType: EdgeType = {
      ...edgeType,
      id: `edge-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      ontology: {
        ...state.ontology,
        edgeTypes: [...state.ontology.edgeTypes, newEdgeType],
        updatedAt: new Date().toISOString(),
      },
    }));
    
    return newEdgeType;
  },
  
  // 添加类型组
  addTypeGroup: (typeGroup) => {
    const newTypeGroup: TypeGroup = {
      ...typeGroup,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      ontology: {
        ...state.ontology,
        typeGroups: [...state.ontology.typeGroups, newTypeGroup],
        updatedAt: new Date().toISOString(),
      },
    }));
    
    return newTypeGroup;
  },
  
  // 更新节点类型
  updateNodeType: (id, updates) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        nodeTypes: state.ontology.nodeTypes.map((nodeType) =>
          nodeType.id === id
            ? { ...nodeType, ...updates, updatedAt: new Date().toISOString() }
            : nodeType
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 更新边类型
  updateEdgeType: (id, updates) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        edgeTypes: state.ontology.edgeTypes.map((edgeType) =>
          edgeType.id === id
            ? { ...edgeType, ...updates, updatedAt: new Date().toISOString() }
            : edgeType
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 更新类型组
  updateTypeGroup: (id, updates) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        typeGroups: state.ontology.typeGroups.map((typeGroup) =>
          typeGroup.id === id
            ? { ...typeGroup, ...updates, updatedAt: new Date().toISOString() }
            : typeGroup
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 删除节点类型
  deleteNodeType: (id) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        nodeTypes: state.ontology.nodeTypes.filter((nodeType) => nodeType.id !== id),
        typeGroups: state.ontology.typeGroups.map((group) => ({
          ...group,
          nodeTypeIds: group.nodeTypeIds.filter((typeId) => typeId !== id),
        })),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 删除边类型
  deleteEdgeType: (id) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        edgeTypes: state.ontology.edgeTypes.filter((edgeType) => edgeType.id !== id),
        typeGroups: state.ontology.typeGroups.map((group) => ({
          ...group,
          edgeTypeIds: group.edgeTypeIds.filter((typeId) => typeId !== id),
        })),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 删除类型组
  deleteTypeGroup: (id) => {
    set((state) => ({
      ontology: {
        ...state.ontology,
        typeGroups: state.ontology.typeGroups.filter((typeGroup) => typeGroup.id !== id),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
  
  // 根据 ID 获取节点类型
  getNodeTypeById: (id) => {
    return get().ontology.nodeTypes.find((nodeType) => nodeType.id === id);
  },
  
  // 根据 ID 获取边类型
  getEdgeTypeById: (id) => {
    return get().ontology.edgeTypes.find((edgeType) => edgeType.id === id);
  },
  
  // 根据 ID 获取类型组
  getTypeGroupById: (id) => {
    return get().ontology.typeGroups.find((typeGroup) => typeGroup.id === id);
  },
  
  // 根据组 ID 获取节点类型
  getNodeTypesByGroup: (groupId) => {
    const { ontology } = get();
    const group = ontology.typeGroups.find((g) => g.id === groupId);
    if (!group) return [];
    return ontology.nodeTypes.filter((nodeType) => group.nodeTypeIds.includes(nodeType.id));
  },
  
  // 根据组 ID 获取边类型
  getEdgeTypesByGroup: (groupId) => {
    const { ontology } = get();
    const group = ontology.typeGroups.find((g) => g.id === groupId);
    if (!group) return [];
    return ontology.edgeTypes.filter((edgeType) => group.edgeTypeIds.includes(edgeType.id));
  },
  
  // 导入本体
  importOntology: (data) => {
    set({ ontology: data });
  },
  
  // 导出本体
  exportOntology: () => {
    return JSON.stringify(get().ontology, null, 2);
  },
  
  // 重置本体
  resetOntology: () => {
    set({ ontology: initialOntology });
  },
}));
